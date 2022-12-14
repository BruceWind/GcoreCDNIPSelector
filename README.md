# GcoreCDNIPSelector
to choose the best IP from [Gcore-CDN](https://gcore.com/cdn/) to reach the lowest latency and stable connections.

### Background
Gcore's CDN provides a smooth experience over the world.

However, network connections from China sometime get shipments-lost and high-latency.
As a result, some people would have liked to use low-latency IP addresses to bind Gcore's domain. 

So, I wrote a script to choose IPs with the lowest latency to cater for this situation.


### How to use it?

1. set up node environment.
In case people haven't set up node. I highly recommend [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows.) to set up.

2. run this JS file.
```
npm install
node ./main.js
```

3. wait minutes to get `result.txt` which contains the best IPs that will be saved in this folder.

For choosing the best one of them, you may need [站长ping](https://ping.chinaz.com/) to make sure that the connection is stable over China. Otherwise, you can use your HTTP service to test bandwidth.

### In addition

At present, I use https://api.gcorelabs.com/cdn/public-net-list to query IPs. In case it expired, this script will be invalid. If you find this script is invalid, please put up an issue or find new URL to replace it.


Have you tried AWS CDN Cloudfront? 

I have written another IP-selector for Cloudfront: https://github.com/BruceWind/CloudFrontIPSelector, you can try it.

