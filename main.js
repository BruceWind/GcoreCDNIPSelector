import { exec } from 'node:child_process';
import fetch from 'node-fetch';
import fs from 'node:fs';
import ping from 'ping';
import globalAgent from 'global-agent';

globalAgent.bootstrap();


//it may be outdated.
const localRanges = [
  "109.230.114.0/28",
  "92.223.76.16/28",
  "197.148.108.104/29",
  "120.28.10.44/30",
  "5.188.94.0/28",
  "185.249.133.0/26",
  "92.223.110.0/27",
  "5.8.92.0/26",
  "43.245.140.0/30",
  "94.43.206.200/29",
  "185.244.209.0/26",
  "5.8.43.0/28",
  "92.223.123.0/26",
  "217.76.64.88/30",
  "80.93.210.0/26",
  "195.34.58.18/31",
  "185.163.3.0/26",
  "5.252.26.0/26",
  "92.223.55.0/26",
  "82.114.163.144/30",
  "188.72.125.0/24",
  "130.193.166.0/30",
  "188.94.153.0/28",
  "195.34.58.16/31",
  "5.1.106.248/30",
  "212.188.76.64/28",
  "109.68.233.240/30",
  "37.236.95.0/30",
  "185.105.1.0/28",
  "92.223.78.16/28",
  "5.101.222.0/28",
  "92.223.107.32/27",
  "171.229.196.128/27",
  "92.223.64.0/28",
  "78.111.101.0/26",
  "5.188.7.0/26",
  "78.111.103.0/26",
  "92.223.122.160/27",
  "5.188.133.0/26",
  "213.156.151.0/26",
  "93.123.38.0/26",
  "37.110.209.224/29",
  "92.223.74.16/28",
  "197.215.140.232/29",
  "134.0.219.24/30",
  "81.253.239.0/30",
  "92.223.118.0/27",
  "190.95.248.32/30",
  "160.242.112.240/30",
  "95.85.88.0/26",
  "91.243.83.0/26",
  "185.239.153.0/24",
  "93.123.11.0/26",
  "87.120.106.0/26",
  "92.38.159.0/26",
  "5.101.217.0/28",
  "62.209.27.232/31",
  "146.185.221.128/26",
  "80.93.221.0/26",
  "92.38.142.0/26",
  "92.223.122.128/25",
  "80.15.252.8/31",
  "81.253.239.32/30",
  "92.223.120.0/24",
  "95.85.69.0/26",
  "92.223.47.0/26",
  "92.223.43.0/26",
  "185.194.11.72/30",
  "92.223.12.0/27",
  "89.223.90.0/26",
  "81.253.239.24/30",
  "80.240.113.0/26",
  "37.17.119.112/28",
  "31.184.207.0/26",
  "45.82.103.0/26",
  "92.223.112.0/26",
  "92.38.168.0/28",
  "91.243.87.0/26",
  "5.188.121.128/25",
  "102.68.141.72/30",
  "150.107.126.0/26",
  "81.253.239.12/30",
  "102.67.99.48/28",
  "92.223.114.0/26",
  "5.189.207.0/28",
  "92.223.120.0/27",
  "5.101.219.0/28",
  "81.253.239.4/30",
  "185.101.137.0/28",
  "89.218.28.16/28",
  "94.176.183.0/26",
  "45.82.100.0/26",
  "94.128.12.236/30",
  "181.39.11.208/30",
  "194.44.246.204/30",
  "5.188.132.0/28",
  "5.188.126.0/28",
  "213.156.144.0/26",
  "45.65.8.0/26",
  "92.223.63.0/27",
  "95.85.93.0/26",
  "46.49.10.224/28",
  "167.160.20.172/31",
  "92.223.126.0/26",
  "180.149.90.64/30",
  "92.38.170.0/28",
  "92.223.124.0/26",
  "102.130.69.140/30",
  "185.101.136.0/27",
  "1.37.77.96/28",
  "92.223.61.16/28",
  "92.223.68.16/28",
  "87.120.164.0/26",
  "197.188.22.100/30",
  "45.82.101.0/26",
  "185.188.144.0/26",
  "92.38.159.0/28",
  "181.174.80.180/30",
  "197.225.145.24/30",
  "92.223.116.192/26",
  "82.97.205.0/26",
  "195.22.198.48/31",
  "171.234.242.192/27",
  "82.213.5.48/30",
  "80.240.124.0/26",
  "46.19.99.4/30",
  "95.85.92.0/26",
  "134.0.219.36/31",
  "186.16.19.92/30",
  "5.101.68.0/27",
  "185.158.211.184/29",
  "41.210.189.20/30",
  "178.160.192.36/30",
  "79.133.108.0/26",
  "37.98.156.188/30",
  "92.223.108.0/27",
  "92.46.108.104/30",
  "195.14.146.80/30",
  "217.21.47.160/28",
  "103.211.151.20/31",
  "92.223.92.16/28",
  "92.223.118.32/28",
  "170.238.234.216/30",
  "151.248.104.94/31",
  "194.152.37.176/28",
  "179.0.200.96/27"
];


// pls make sure this is identical url from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_CDN_IPs_URL = "https://api.gcorelabs.com/cdn/public-net-list"

// This line had set been disable, due to Gcore without IP in China mainland.
//const PREFIX_IP_LOCALATION = "http://ip2c.org/" // It is used to query which country belongs to.

"use strict"

import { Netmask } from 'netmask';

const THRESHOLD = 180;
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


function fetchWithTimeout(url,httpSettings, timeout) {
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
    try
    {
      var response = await fetchWithTimeout(OFFICIAL_CDN_IPs_URL, httpSettings, 3000);
      const body = await response.text();
      json = JSON.parse(body);
    }
    catch(e){
      console.error(e);
    }

  
    // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
    const arrOfIPRanges =  json ? json["addresses"] : localRanges;

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

    //to save this sorted array to 'result.txt'.
    fs.writeFile('result.txt', JSON.stringify(resultArr), function (err) {
      if (err) return console.log(err);
    });

    if (resultArr.length > 0) {
      console.log(`Congratulation!!! Fount ${resultArr.length} available IPs.`);

      console.log(`Plz, open result.txt to get them.`);
    }
    else {
      console.error(`Sorry, no available IPs was found.`);

      console.log('You could try increasing THREASHOLD.');

    }

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
    if (latency1 > THRESHOLD+50) return latency1;
    const latency2 = await queryLatency(ip);
    if (latency2 > THRESHOLD+50) return latency2;
    const latency3 = await queryLatency(ip);
    return Math.round((latency1 + latency2 + latency3) / 3);
  }
  catch (e) {
    console.log(`${ip} is not reachable.`, e.message);
  }
  return 1000;
}
