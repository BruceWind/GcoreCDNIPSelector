import { exec } from 'node:child_process';
import fetch from 'node-fetch';
import fs from 'node:fs';
import ping from 'ping';
import globalAgent from 'global-agent';


globalAgent.bootstrap();

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
const THRESHOLD = 100;


const PING_THREADS = 800;
let countOfBeingProcess = 0;

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


function fetchWithTimeout(url, httpSettings, timeout) {
  return Promise.race([
    fetch(url, httpSettings),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ]);
}



let ips = [];


//
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
      console.error(e);
    }


    // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
    const arrOfIPRanges = json ? json["addresses"] : localRanges;

    if (!json) {
      console.warn("Use local IP ranges.");
    }

    for (const ipRnage of arrOfIPRanges) {
      let netmask = new Netmask(ipRnage);

      let ip = netmask.first;

      netmask.forEach(async (ip) => {
        ips.push(ip);
      })

    }


    console.log(`IPs.length is ${ips.length}`);

    const unsortedArr = [];
    for (let i = 0; i < ips.length; i++) {
      const ip = ips[i];

      if (countOfBeingProcess > PING_THREADS || i > ips.length - 20) {
        countOfBeingProcess++;
        const avgLatency = await queryAvgLatency(ip);
        if (avgLatency < THRESHOLD) {
          unsortedArr.push({ ip, latency: avgLatency });
        }
        countOfBeingProcess--;
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

    console.log(`unsortedArr.length is ${unsortedArr.length}`);
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

setTimeout(main, 100);

async function queryLatency(ip) {
  try {
    const result = await ping.promise.probe(ip, {
      timeout: 2,
    });

    return result.alive ? Math.round(result.avg) : 1000;
  }
  catch (e) {
    console.log(`${ip} is not reachable.`, e.message);
  }
  return 1000;
}



async function queryAvgLatency(ip) {
  try {
    await queryLatency(ip); // this line looks like useless, but In my opinion, this can make connection reliable.
    const latency1 = await queryLatency(ip);
    if (latency1 > THRESHOLD + 50) return latency1;
    const latency2 = await queryLatency(ip);
    if (latency2 > THRESHOLD + 50) return latency2;
    const latency3 = await queryLatency(ip);
    return Math.round((latency1 + latency2 + latency3) / 3);
  }
  catch (e) {
    console.log(`${ip} is not reachable.`, e.message);
  }
  return 1000;
}
