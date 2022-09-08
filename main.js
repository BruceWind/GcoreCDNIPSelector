const { exec } = require('node:child_process')

// pls make sure this is identical from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_AWS_IPs_URL = "https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips"
const PREFIX_IP_LOCALATION = "http://ip2c.org/"
var ipInfo = require("ip-info-finder");

"use strict"

const Netmask = require('netmask').Netmask

const PING_THREADS = 300;
const lanternPattern = /time=(\d+)\sms/gm;

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
            let netmask = new Netmask(ipRnage)

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

        const resultArr = [];
        for (let i = 0; i < excludeCNIPs.length / PING_THREADS; i++) {
            const tempArr = excludeCNIPs.slice(i * PING_THREADS, (i + 1) * PING_THREADS);

            for (const ip of tempArr) {
                const lantern1 = await queryLantern(ip);
                const lantern2 = await queryLantern(ip);
                if (lantern1 < 150 || lantern2 < 150) {
                    resultArr.push({ ip, lantern: (Math.min(lantern1, lantern2)) });
                }
            }
        }

        fs = require('fs');
        fs.writeFile('result.txt', JSON.stringify(excludeCNIPs), function (err) {
            if (err) return console.log(err);
        });

    } catch (e) {
        console.error(e.message);
    }
}

setTimeout(main, 100);

async function queryLantern(ip) {
    const pingCommand = `ping -c 1 -W 1 ${ip}`;

    try {
        const resultOfPing = await execPromise(pingCommand);
        // console.log(resultOfPing);
        const arr = lanternPattern.exec(resultOfPing);
        if (!arr[1]) return 1000;
        console.log(`${ip}'s lantern is ${arr[1]}`);

        return Number(arr[1]);
    }
    catch (e) {
        console.log(`${ip} is not reachable.`);
    }
    return 1000;
}