#!/bin/zsh
cd "$(dirname "$0")"

export ELECTRON_MIRROR="${ELECTRON_MIRROR:-https://npmmirror.com/mirrors/electron/}"

if ! command -v npm >/dev/null 2>&1; then
  echo "未找到 npm。请先安装 Node.js 标准发行版，然后重新运行 ./start.command。"
  exit 1
fi

if [ ! -d "node_modules" ]; then
  npm install
fi

npm start
