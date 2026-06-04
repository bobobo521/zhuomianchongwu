#!/bin/zsh
cd "$(dirname "$0")"

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"
if [ -d ".local-node/node/bin" ]; then
  export PATH="$(pwd)/.local-node/node/bin:$PATH"
fi
export ELECTRON_MIRROR="${ELECTRON_MIRROR:-https://npmmirror.com/mirrors/electron/}"

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm，桌宠依赖还不能安装。"
  echo ""
  echo "请先安装 Node.js 标准发行版：https://nodejs.org/"
  echo "如果你用 Homebrew，也可以运行：brew install node"
  echo ""
  echo "装好后重新打开终端，再运行："
  echo "cd \"$(pwd)\""
  echo "./start.command"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  echo "第一次启动需要安装依赖，稍等一下。"
  npm install
fi

npm start
