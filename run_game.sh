#!/bin/bash

# 检查是否有Node.js环境
if command -v node &> /dev/null; then
    echo "Node.js已安装，版本："
    node --version
else
    echo "Node.js未安装，尝试使用NVS..."
    
    # 尝试使用NVS
    if [ -f "$HOME/.nvs/nvs.sh" ]; then
        echo "找到NVS，正在加载..."
        source "$HOME/.nvs/nvs.sh"
        nvs use
    else
        echo "未找到NVS，尝试其他方式..."
        
        # 尝试使用nvm
        if [ -f "$HOME/.nvm/nvm.sh" ]; then
            echo "找到NVM，正在加载..."
            source "$HOME/.nvm/nvm.sh"
            nvm use node
        else
            echo "未找到NVM，无法运行Node.js环境"
            exit 1
        fi
    fi
fi

# 检查是否有npm
if command -v npm &> /dev/null; then
    echo "npm已安装，版本："
    npm --version
    
    # 运行开发服务器
    echo "启动开发服务器..."
    npm run dev
else
    echo "npm未安装，无法运行开发服务器"
    exit 1
fi
