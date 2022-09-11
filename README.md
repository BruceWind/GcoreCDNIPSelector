# CloudFrontIPSelector
to choose the CloudFront IPs with the lowest possible connection latency.

### Background
Because AWS's DNS function is so good, users of AWS CloudFront typically report having an extremely steady experience.

On the other hand, those living in China use it often get timeout, shipments lost and high latency. As a result, some people prefer to bind to CloudFront's domain using low-latency IP addresses. I created this script to choose IPs with the lowest latency in these situations.


### How to use?

1. set up node environment.
Some pople who have no experience on Node  may need to set up [nvm](https://github.com/nvm-sh/nvm).

2. run this JS file.
```
node ./main.js
```

3. wait minites to get `result.txt` which contain best IPs will be saved in this folder.
