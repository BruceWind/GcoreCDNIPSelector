const { exec } = require('node:child_process')

// pls make sure this is identical from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_AWS_IPs_URL = "https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips"
const PREFIX_IP_LOCALATION = "http://ip2c.org/"
var ipInfo = require("ip-info-finder");

"use strict"

const Netmask = require('netmask').Netmask


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

let IPs = [];
let excludeCNIPs = [];


// 
async function main() {
    try {
        var result = await execPromise(`curl ${OFFICIAL_AWS_IPs_URL}`);
        const json = JSON.parse(result);
        // items of this are CIDR, its doc is here https://datatracker.ietf.org/doc/rfc4632/.
        const arrOfIPRanges = json["CLOUDFRONT_GLOBAL_IP_LIST"];

        for (const ipRnage of arrOfIPRanges) {
            let ips = new Netmask(ipRnage)

            let ip = ips.first;

            const queryLocationCommand = `curl ${PREFIX_IP_LOCALATION}${ip}`;
            const resultOfIP = await execPromise(queryLocationCommand);
            if (resultOfIP.includes(';')) {
                const nation = resultOfIP.split(";")[1].trim();
                if (nation !== 'CN') {
                    excludeCNIPs.push(ip)
                }
                else {
                    console.log(`${ip} is in China.`);
                    continue;
                }
            }
            else {
                throw new Error(` unexpected result : ${resultOfIP}.`)
            }


            ips.forEach((item) => {
                excludeCNIPs.push(item);
            })
        }


        console.log(`IPs.length is ${excludeCNIPs.length}`);


    } catch (e) {
        console.error(e.message);
    }
}

setTimeout(main, 100);