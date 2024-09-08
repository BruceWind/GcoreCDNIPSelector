import { exec } from 'node:child_process';
import fetch from 'node-fetch';
import fs from 'node:fs';
import ping from 'ping';
import globalAgent from 'global-agent';

import cliProgress from 'cli-progress';
const terminalBarUI = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

import net from 'node:net';

globalAgent.bootstrap();

// Function to read and parse a JSON file
function readJsonFile(filePath) {
  const jsonData = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(jsonData);
}

const OFFICIAL_CDN_IPs_URL = "https://api.gcore.com/cdn/public-ip-list"

//Read IP from gcore_cdn_ip_ranges.json located in the project's root directory and update it weekly or daily.
const { localRanges } = readJsonFile("./gcore_cdn_ip_ranges.json")

// This line had set been disable, due to Gcore without IP in China mainland.
//const PREFIX_IP_LOCALATION = "http://ip2c.org/" // It is used to query which country belongs to.

"use strict"

import { Netmask } from 'netmask';

// In case script can not find any available IPs, You should try to  increase {THRESHOLD} to 140.
const THRESHOLD = 200;

const PING_THREADS = 50;
let countOfBeingProcess = 0;

// Function to execute a command as a Promise
function execPromise(command) {
  return new Promise(function (resolve, reject) {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// Function to fetch data with a timeout
function fetchWithTimeout(url, httpSettings, timeout) {
  return Promise.race([
    fetch(url, httpSettings),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}

let ips = [];

// Main function to orchestrate the IP scanning process
async function main() {
  try {
    const httpSettings = {
      method: "Get",
      headers: {
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36'
      }
    };

    let json;
    try {
      var response = await fetchWithTimeout(OFFICIAL_CDN_IPs_URL, httpSettings, 6000);
      const body = await response.text();
      json = JSON.parse(body);
    }
    catch (e) {
      //console.error(e);
      console.warn("Request went wrong but it's ok. It will use local JSON file to read IP ranges.");
    }

    // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
    const arrOfIPRanges = json ? json["addresses"] : localRanges;

    if (!json) {
      console.warn("Use local IP ranges.");
    }

    // Iterate through IP ranges and collect IPs
    for (const ipRnage of arrOfIPRanges) {
      let netmask = new Netmask(ipRnage);

      netmask.forEach(async (ip) => {
        const ipstr = ip + '';
        if (parseInt(ipstr.split('.')[3]) < 100) {
          ips.push(ip);
          // console.log('jump ' + ipstr);
        }
      })

    }


    console.log(`Current progress:`);

    terminalBarUI.start(ips.length, 0);
    let unsortedArr = [];
    for (let i = 0; i < ips.length; i++) {
      const ip = ips[i];

      // Check if we're at the processing limit or near the end of the IP list
      if (countOfBeingProcess > PING_THREADS || i > ips.length - 20) {
        terminalBarUI.update(i);
        countOfBeingProcess++;
        const avgLatency = await queryAvgLatency(ip);
        if (avgLatency < THRESHOLD) {
          unsortedArr.push({ ip, latency: avgLatency });
        }
        countOfBeingProcess--;
        // Check if we need to trim the unsorted array
        if (unsortedArr.length > 150) {
          unsortedArr = unsortedArr.sort((a, b) => {
            return a.latency - b.latency;
          });
          unsortedArr.slice(100, 150);
          console.warn('removed 50 IPs.');
        }
      }
      else {
        countOfBeingProcess++;
        queryAvgLatency(ip).then(function (avgLatency) {
          if (avgLatency < THRESHOLD) {
            unsortedArr.push({ ip, latency: avgLatency });
          }
          countOfBeingProcess--;
        }).catch(function (e) {
          countOfBeingProcess--;
        });
      }
    }

    console.log(`\nunsortedArr.length is ${unsortedArr.length}`);
    // to sort the array by the latency.
    const resultArr = unsortedArr.sort((a, b) => {
      return a.latency - b.latency;
    });
    if (resultArr.length > 0) {
      console.log(`Available IPs: ${JSON.stringify(resultArr)}`);
      //to save this sorted array to 'result.txt'.
      fs.writeFile('result.txt', JSON.stringify(resultArr), function (err) {
        if (err) {
          console.log(err);
          console.warn('Writing file  went wrong.');
        } else {
          console.log('File saved successfully.');
          console.log(`Congratulation!!! Fount ${resultArr.length} available IPs.`);
          console.log(`Plz, open result.txt to get them.`);
        }
        // exit
        process.exit(err ? 1 : 0);
      });
    }
    else {// or not need to change file.
      console.warn(`Sorry, no available IPs was found.`);
      console.warn('You could try increasing THREASHOLD.');
      // exit
      process.exit(0);
    }
    //  !!! Don't do this. this make app quit before IPs are written.
    //  process.exit(0); 

  } catch (e) {
    console.error(e.message);
  }
}

// Delay the execution of the main function
setTimeout(main, 100);

// Function to query latency using ping
async function queryLatency(ip) {
  try {
    const result = await ping.promise.probe(ip, {
      timeout: 2,
    });

    return result.alive ? Math.round(result.avg) : 1000;
  }
  catch (e) {
    // console.log(`${ip} is not reachable.`, e.message);
  }
  return 1000;
}

const TIMEOUT = 8600;

// Function to query TCP latency
async function queryTCPLatency(ip) {
  const port = 443;
  const start = process.hrtime.bigint();

  try {
    const elapsed = await new Promise((resolve, reject) => {
      const socket = new net.Socket();
      const timeout = setTimeout(() => {
        socket.destroy();
        reject(new Error('Connection timed out'));
      }, TIMEOUT);

      socket.on('connect', () => {
        clearTimeout(timeout);
        const end = process.hrtime.bigint();
        const elapsed = Math.floor(Number(end - start) / 1000000); // to ms
        socket.end();
        resolve(elapsed);
      });

      socket.on('error', (err) => {
        clearTimeout(timeout);
        reject(err);
      });

      socket.connect(port, ip);
    });

    return elapsed;
  } catch (err) {
    // console.log(`TCP connection failed for ${ip}: ${err.message}`);
    return 1000;
  }
}

// Function to query average latency using multiple methods
async function queryAvgLatency(ip) {
  try {
    // Initial TCP latency query to establish connection
    await queryTCPLatency(ip);

    // Perform ping latency check
    const pingLatency = await queryLatency(ip);
    // Check if ping latency exceeds threshold
    if (pingLatency > THRESHOLD + 50) return pingLatency;

    // Perform multiple TCP latency checks
    const latency1 = await queryTCPLatency(ip);
    // Check if first TCP latency exceeds threshold
    if (latency1 > THRESHOLD + 50) return latency1;

    const latency2 = await queryTCPLatency(ip);
    // Check if second TCP latency exceeds threshold
    if (latency2 > THRESHOLD + 50) return latency2;

    // Check for undefined latencies
    if (latency1 === undefined || latency2 === undefined) throw new Error('latencies are undefined');

    // Perform an additional TCP latency check (unused in calculation)
    const latency3 = await queryTCPLatency(ip);

    // Calculate and return the average of the two valid TCP latencies
    const result = Math.round((latency1 + latency2 + latency3) / 3);
    return result;
  }
  catch (e) {
    // Error handling for unreachable IP
    console.log(`${ip} is not reachable.`, e.message);
  }
  return 1000;
}
