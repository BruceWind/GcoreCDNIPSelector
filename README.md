# GcoreCDNIPSelector
to choose the [Gcore](https://gcore.com/) IPs with the lowest possible connection latency.

### Background
Gcore cdn provide a smooth experience over the world.

On the other hand, those who living in China use it sometime get laggy, shipments lost and high latency.
As a result, some people prefer to bind to Gcore's domain using low-latency IP addresses. I created this script to choose IPs with the lowest latency in these situations.


### How to use?

1. set up node environment.
Some pople who have no experience on Node  may need to set up [nvm](https://github.com/nvm-sh/nvm).

2. run this JS file.
```
node ./main.js
```

3. wait minites to get `result.txt` which contain best IPs will be saved in this folder.


### In addition

At present, I use https://api.gcorelabs.com/cdn/public-net-list to query IPs. It may be expired. As result of that, this script will going to be invalid. If you find this script is invalid, please put up an issue or find new url to replace.
