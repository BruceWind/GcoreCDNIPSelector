# GcoreCDNIPSelector

[中文](https://github.com/BruceWind/GcoreCDNIPSelector/blob/main/README_zh.md)｜[English](https://github.com/BruceWind/GcoreCDNIPSelector/blob/main/README.md)

Select the optimal IP from [Gcore-CDN](https://gcore.com/cdn/) for the lowest latency and most stable connections📶.

> I use Github Actions（[![Scan and Push](https://github.com/BruceWind/GcoreCDNIPSelector/actions/workflows/daily-cron-action.yml/badge.svg)](https://github.com/BruceWind/GcoreCDNIPSelector/actions/workflows/daily-cron-action.yml)）to run the repo in LAN, which generates a [result.txt](/result.txt) in case of available results. If U R Chinese guys, I recommand you open the file to look results, instead of running the repo.

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


For choosing the best one of result, you may need [站长ping](https://ping.chinaz.com/) to make sure that the connection is almost stable on every China citis. Otherwise, you can use your HTTP service to test bandwidth.


## In addition
----------------------------------

At present, I use https://api.gcorelabs.com/cdn/public-net-list to query IPs. In case it expired, this script will be invalid. If you find this script is invalid, please put up an issue or find new URL to replace it.

###  Spacial for post-Soviet countries
<details>
  <summary>click to expand </summary>
  I know some countries, like China, have a strong internet censorship system called the Great Firewall (GFW). It's even stricter than China's version. You might have had trouble downloading IP ranges during running this script. To fix this, I have a backup plan. I will use Github actions to save IP ranges in this repository every week. You can turn off the code `fetchWithTimeout()`. If you don't do that, it will still work, but it might take more time to finish.
  
</details>



## Have you tried AWS'CDN Cloudfront?

I have written another IP-selector for Cloudfront: https://github.com/BruceWind/CloudFrontIPSelector, you can try it.

