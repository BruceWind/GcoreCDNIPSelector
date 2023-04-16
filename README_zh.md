# GcoreCDNIPSelector
从[Gcore-CDN](https://gcore.com/cdn/)中选择最佳IP，以获得最低延迟和最稳定的连接。


### 概述
Gcore的CDN在全球范围内提供了一个无缝的体验。然而，来自中国的网络连接有时会出现数据包丢失和高延迟。为了解决这个问题，一些用户喜欢将Gcore的域名绑定到低延迟的IP地址。这个脚本有助于在这种情况下选择具有最低延迟的IP地址。


### 使用指导

1. 设置node环境。

如果你还没有设置node, 我强烈推荐[nvm](https://github.com/nvm-sh/nvm)或[nvm-windows](https://github.com/coreybutler/nvm-windows。)来设置。

2. 运行这个JS文件。
```
cd GcoreCDNIPSelector/
npm install
node .
```

3. 等待几分钟，收到result.txt，其中包含保存在这个文件夹中的最佳IP地址。


为了选择最好的一个结果，你可能需要[站长ping](https://ping.chinaz.com/)来进行二次确认：以保证你选择的IP在国内大多数地区访问都比较稳定。或者，你可以使用你的HTTP服务来测试带宽。


### 补充

目前，我使用https://api.gcorelabs.com/cdn/public-net-list 
来查询IP。万一它过期了，这个脚本就无效了。如果你发现这个脚本是无效的，请提出issue或找到新的URL来代替它。


你试过AWS的CDN Cloudfront吗？

我已经为Cloudfront写了另一个IP选择器：[CloudFrontIPSelector](https://github.com/BruceWind/CloudFrontIPSelector),你可以试试。


