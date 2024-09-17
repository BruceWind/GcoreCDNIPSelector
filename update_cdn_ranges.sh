#!/bin/sh

# 检查 jq 是否已安装
if ! command -v jq > /dev/null 2>&1; then
    echo "jq is not installed. Installing jq..."

    # Try to detect package manager and install jq
    if command -v apt-get > /dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y jq
    elif command -v yum > /dev/null 2>&1; then
        sudo yum install -y jq
    elif command -v brew > /dev/null 2>&1; then
        brew install jq
    else
        echo "Package manager not found or not supported. Please install jq manually."
        exit 1
    fi
else
    echo "jq is already installed."
fi

# 检查 curl 是否已安装
if ! command -v curl > /dev/null 2>&1; then
    echo "curl is not installed. Installing curl..."

    # Try to detect package manager and install curl
    if command -v apt-get > /dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y curl
    elif command -v yum > /dev/null 2>&1; then
        sudo yum install -y curl
    elif command -v brew > /dev/null 2>&1; then
        brew install curl
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
