const { exec } = require('node:child_process')

// pls make sure this is identical url from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_AWS_IPs_URL = "https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips"
const PREFIX_IP_LOCALATION = "http://ip2c.org/"

"use strict"

const Netmask = require('netmask').Netmask

const PING_THREADS = 3000;
let countOfBeingProcess = 0;
// this is the pattern of the latency from ping result.
const latencyPattern = /time=(\d+)\sms/gm;

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
        var result = await execPromise(`curl ${OFFICIAL_AWS_IPs_URL}`);
        const json = JSON.parse(result);
        // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
        const arrOfIPRanges = json["CLOUDFRONT_GLOBAL_IP_LIST"];

        for (const ipRnage of arrOfIPRanges) {
            let netmask = new Netmask(ipRnage);

            let ip = netmask.first;

            const queryLocationCommand = `curl --max-time 6.5  --connect-timeout 6.0  ${PREFIX_IP_LOCALATION}${ip}`;
            let resultOfIP = undefined;
            try {
                resultOfIP = await execPromise(queryLocationCommand);
            }
            catch (e) {
                console.log(`${queryLocationCommand} is faield.`, e);
                continue;
            }

            if (resultOfIP.includes(';')) {
                const nation = resultOfIP.split(";")[1].trim();

                console.log(`${ip} is in ${nation}. size: ${netmask.size}`);
                if (nation == 'CN') {
                    continue;
                }
                else {
                    netmask.forEach(async (ip) => {
                        excludeCNIPs.push(ip);
                    })
                }
            }
            else {
                throw new Error(` unexpected result : ${resultOfIP}.`)
            }

        }


        console.log(`IPs.length is ${excludeCNIPs.length}`);

        const unsortedArr = [];
        for (let i = 0; i < excludeCNIPs.length; i++) {
            const ip = excludeCNIPs[i];

            if (countOfBeingProcess > PING_THREADS) {
                countOfBeingProcess++;
                const avgLatency = await queryAvgLatency(ip);
                if (avgLatency < 200) {
                    unsortedArr.push({ ip, latency: avgLatency });
                }
                countOfBeingProcess--;
            }
            else {
                countOfBeingProcess++;
                queryAvgLatency(ip).then(function (avgLatency) {
                    if (avgLatency < 200) {
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

    } catch (e) {
        console.error(e.message);
    }
}

setTimeout(main, 100);

async function queryLatency(ip) {
    const pingCommand = `ping -c 1 -W 1 ${ip}`;

    try {
        const resultOfPing = await execPromise(pingCommand);
        // console.log(resultOfPing);
        const arr = latencyPattern.exec(resultOfPing);
        if (!arr[1]) return 1000;
        console.log(`${ip}'s latency is ${arr[1]}`);

        return Number(arr[1]);
    }
    catch (e) {
        console.log(`${ip} is not reachable.`);
    }
    return 1000;
}



async function queryAvgLatency(ip) {
    const pingCommand = `ping -c 1 -W 1 ${ip}`;

    try {
        await queryLatency(ip); // this line looks like useless, but In my opinion, this can make connection reliable. 
        const latency1 = await queryLatency(ip);
        const latency2 = await queryLatency(ip);
        return (latency1 + latency2) / 2;
    }
    catch (e) {
        console.log(`${ip} is not reachable.`, e.message);
    }
    return 1000;
}