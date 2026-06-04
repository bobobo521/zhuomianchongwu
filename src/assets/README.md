# 美术资源投放文件夹

把图片放进这个文件夹，并按下面的文件名命名，应用启动后会自动调用。

当前文件夹已经包含一套小猫外观默认皮肤。普通动作是 512 x 512 px 透明 PNG，小游戏动作和素材是 768 x 768 px 透明 PNG。

如需重新生成这套小猫默认皮肤，可在项目根目录运行：

```bash
node scripts/generate-default-cat-skin.mjs
```

如果某张图片暂时没有放，应用会继续使用内置占位图，不会报错。

## 最简单用法

1. 准备透明背景 PNG 图片。
2. 把图片放到 `src/assets`。
3. 按清单里的文件名重命名，例如 `pet-idle.png`、`game-balloon-idle.png`。
4. 重新启动桌宠。

## 普通模式

- `pet-idle.png`
- `pet-talk.png`
- `pet-happy.png`
- `pet-thinking.png`
- `pet-sleep.png`
- `pet-wake.png`
- `pet-hover.png`
- `pet-click.png`
- `pet-drag.png`
- `pet-surprised.png`
- `pet-confirm.png`
- `pet-error.png`

## 小游戏模式

- `game-enter.png`
- `game-balloon-idle.png`
- `game-balloon-aim.png`
- `game-balloon-shoot.png`
- `game-balloon-hit.png`
- `game-balloon-miss.png`
- `game-balloon-celebrate.png`
- `game-exit.png`
- `game-arrow.png`
- `game-target.png`
- `game-target-hit.png`
- `game-hit-effect.png`

详细用途可以看项目根目录的 `美术资源替换清单.csv`。
