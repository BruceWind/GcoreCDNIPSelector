const { exec } = require('node:child_process')

// pls make sure this is identical url from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_CDN_IPs_URL = "https://api.gcorelabs.com/cdn/public-net-list"

// This line had set been disable, due to Gcore without IP in China mainland.
//const PREFIX_IP_LOCALATION = "http://ip2c.org/" // It is used to query which country belongs to.

"use strict"

const Netmask = require('netmask').Netmask

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




let excludeCNIPs = [];


// 
async function main() {
    try {
        var result = await execPromise(`curl ${OFFICIAL_CDN_IPs_URL}`);
        const json = JSON.parse(result);
        // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
        const arrOfIPRanges = json["addresses"];

        for (const ipRnage of arrOfIPRanges) {
            let netmask = new Netmask(ipRnage);

            let ip = netmask.first;

            netmask.forEach(async (ip) => {
                excludeCNIPs.push(ip);
            })

        }


        console.log(`IPs.length is ${excludeCNIPs.length}`);

        const unsortedArr = [];
        for (let i = 0; i < excludeCNIPs.length; i++) {
            const ip = excludeCNIPs[i];

            if (countOfBeingProcess > PING_THREADS || i > excludeCNIPs.length - 10) {
                countOfBeingProcess++;
                const avgLatency = await queryAvgLatency(ip);
                if (avgLatency < 150) {
                    unsortedArr.push({ ip, latency: avgLatency });
                }
                countOfBeingProcess--;
            }
            else {
                countOfBeingProcess++;
                queryAvgLatency(ip).then(function (avgLatency) {
                    if (avgLatency < 150) {
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
        fs = require('fs');
        fs.writeFile('result.txt', JSON.stringify(resultArr), function (err) {
            if (err) return console.log(err);
        });

        if (resultArr.length > 0) {
            console.log(`Congratulation!!! Fount ${resultArr.length} IPs`);
        }
        else {
            console.err(`Sorry, no IPs found.`);
        }

    } catch (e) {
        console.error(e.message);
    }
}

setTimeout(main, 100);

async function queryLatency(ip) {
    const ping = require('ping');
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
        if (latency1 > 200) return latency1;
        const latency2 = await queryLatency(ip);
        if (latency2 > 200) return latency2;
        const latency3 = await queryLatency(ip);
        return Math.round((latency1 + latency2 + latency3) / 3);
    }
    catch (e) {
        console.log(`${ip} is not reachable.`, e.message);
    }
    return 1000;
}
