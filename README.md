# GcoreCDNIPSelector
to choose the best IP from [Gcore-CDN](https://gcore.com/cdn/) to reach the lowest latency and stable connections.

### Background
Gcore's CDN provide a smooth experience over the world.

However, network connections from China sometime get shipments-lost and high-latency.
As a result, some people would have liked to use low-latency IP addresses to bind Gcore's domain. 

So, I wrote a script to choose IPs with the lowest latency to cater for this situation.


### How to use?

1. set up node environment.
In case people who havn't set up node. I highly recommand [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows.) to set up.

2. run this JS file.
```
npm install
node ./main.js
```

3. wait minites to get `result.txt` which contain best IPs will be saved in this folder.


### In addition

At present, I use https://api.gcorelabs.com/cdn/public-net-list to query IPs. In case it expired, this script will going to be invalid. If you find this script is invalid, please put up an issue or find new url to replace.
