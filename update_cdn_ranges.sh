#!/bin/bash

# 检查 jq 是否已安装
if ! command -v jq &> /dev/null; then
    echo "jq is not installed. Installing jq..."

    # 使用 apt-get 包管理器安装 jq
    if [[ -n $(command -v apt-get) ]]; then
        sudo apt-get update
        sudo apt-get install -y jq
    else
        echo "Package manager not found or not supported. Please install jq manually."
    fi
else
    echo "jq is already installed."
fi

# 检查 curl 是否已安装
if ! command -v curl &> /dev/null; then
    echo "curl is not installed. Installing curl..."

    # 使用 apt-get 包管理器安装 curl
    if [[ -n $(command -v apt-get) ]]; then
        sudo apt-get update
        sudo apt-get install -y curl
    else
        echo "Package manager not found or not supported. Please install curl manually."
        exit 1
    fi
else
    echo "curl is already installed."
fi




URL="https://api.gcorelabs.com/cdn/public-net-list"

# curl -o gcore_cdn_ip_ranges.json $URL
# curl -s $URL | jq -c '.addresses' > gcore_cdn_ip_ranges.json
ms=$(curl -s $URL | jq -c '.addresses')

# echo "$ms"

ms1="{"\"localRanges\"":$ms}"

echo "$ms1" | jq '.' > gcore_cdn_ip_ranges.json

git add ./gcore_cdn_ip_ranges.json

git commit -m "update gcore_cdn_ip_ranges.json"
