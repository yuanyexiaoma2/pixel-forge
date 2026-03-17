# PictureMe

AI 图像生成桌面应用，基于 Electron + Vite + React + Express。

## 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/yuanyexiaoma2/pixel-forge.git
cd pixel-forge

# 2. 安装依赖
npm install

# 3. 复制环境变量配置
cp .env.example .env

# 4. 启动（前端 + 后端）
npm run start
```

启动后打开 http://localhost:5173 即可使用。

## 默认账号

| 用户名 | 密码 |
|--------|------|
| majiwei | majiwei666 |

## API Key 配置

`KIE_API_KEY` 可在 `.env` 中填写，也可以留空——首次登录后会自动弹窗提示配置。

## 常用命令

| 命令 | 说明 |
|------|------|
| `npm run start` | 启动前端 + 后端 |
| `npm run dev` | 启动前端 + 后端 + Electron |
| `npm run build` | 构建前端 |
| `npm run dist` | 构建并打包桌面应用 |

## 技术栈

- **前端**: React 19 + Vite
- **后端**: Express + sql.js (SQLite)
- **桌面**: Electron
- **AI**: kie.ai API
