# GcoreCDNIPSelector
Select the optimal IP from [Gcore-CDN](https://gcore.com/cdn/) for the lowest latency and most stable connections.


### Overview
Gcore's CDN delivers a seamless experience globally. However, network connections from China sometimes experience packet loss and high latency. To address this, some users prefer to bind Gcore's domain to low-latency IP addresses. This script helps select the IP addresses with the lowest latency for such situations.


### Usage Instructions

1. set up node environment.
In case people haven't set up node. I highly recommend [nvm](https://github.com/nvm-sh/nvm) or [nvm-windows](https://github.com/coreybutler/nvm-windows.) to set up.

2. run this JS file.
```
npm install
node .
```

3. wait for a few minutes to receive result.txt, which contains the optimal IP addresses saved in this folder.


For choosing the best one of result, you may need [站长ping](https://ping.chinaz.com/) to make sure that the connection is stable over China. Otherwise, you can use your HTTP service to test bandwidth.


### In addition

At present, I use https://api.gcorelabs.com/cdn/public-net-list to query IPs. In case it expired, this script will be invalid. If you find this script is invalid, please put up an issue or find new URL to replace it.


Have you tried AWS CDN Cloudfront?

I have written another IP-selector for Cloudfront: https://github.com/BruceWind/CloudFrontIPSelector, you can try it.

