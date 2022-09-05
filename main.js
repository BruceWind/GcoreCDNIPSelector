const { exec } = require('node:child_process')

// pls make sure this is identical from https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/LocationsOfEdgeServers.html.
const OFFICIAL_AWS_IPs_URL = "https://d7uri8nf7uskq.cloudfront.net/tools/list-cloudfront-ips"




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


async function main() {
    try {
        var result = await execPromise(`curl ${OFFICIAL_AWS_IPs_URL}`);
        const json = JSON.parse(result);
        const arrOfIPs = json["CLOUDFRONT_GLOBAL_IP_LIST"];
        console.log("Output 1: \n", arrOfIPs)
    } catch (e) {
        console.error(e.message);
    }
}

setTimeout(main, 100);