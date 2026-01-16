# Vben Admin 快速开始

本文档提供 Vben Admin 的快速开始指南，帮助您快速搭建和运行 Vben Admin 项目。

## 📋 目录

- [环境准备](#环境准备)
- [创建项目](#创建项目)
- [项目结构](#项目结构)
- [开发运行](#开发运行)
- [构建部署](#构建部署)
- [常见问题](#常见问题)

## 环境准备

### Node.js 版本要求

Vben Admin 需要以下环境：

- **Node.js**: >= 18.0.0 (推荐 20.x LTS)
- **包管理器**: pnpm (推荐) 或 npm/yarn/bun

### 安装 Node.js

推荐使用 nvm (Node Version Manager) 管理 Node.js 版本：

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# 重启终端后，安装 Node.js 20
nvm install 20

# 使用 Node.js 20
nvm use 20

# 验证安装
node --version
# v20.x.x
```

### 安装 pnpm

```bash
# 使用 npm 安装 pnpm
npm install -g pnpm

# 或使用 Node.js corepack
corepack enable
corepack prepare pnpm@latest --activate

# 验证安装
pnpm --version
# 8.x.x 或更高
```

### 安装 Git

```bash
# macOS (使用 Homebrew)
brew install git

# Ubuntu/Debian
sudo apt-get install git

# 验证安装
git --version
```

## 创建项目

### 方式一：使用 Git 克隆（推荐）

```bash
# 克隆项目
git clone https://github.com/vbenjs/vue-vben-admin.git

# 进入项目目录
cd vue-vben-admin

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

### 方式二：使用模板创建

```bash
# 使用 GitHub CLI
gh repo clone vbenjs/vue-vben-admin

# 或使用 wget 下载
wget https://github.com/vbenjs/vue-vben-admin/archive/refs/heads/main.zip
unzip main.zip
cd vue-vben-admin-main
pnpm install
```

### 方式三：使用 Create Vben Admin（如果可用）

```bash
# 使用 create-vben-admin CLI
pnpm create vben-admin my-app

# 进入项目
cd my-app

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

## 项目结构

### Monorepo 结构

Vben Admin 采用 Monorepo 架构：

```
vue-vben-admin/
├── apps/                    # 应用程序
│   ├── web-antd/           # Ant Design Vue 版本
│   ├── web-ele/            # Element Plus 版本
│   ├── web-naive/          # Naive UI 版本
│   ├── web-tdesign/        # TDesign 版本
│   ├── playground/         # 开发测试应用
│   └── docs/               # 文档站点
├── packages/               # 共享包
│   ├── effects/            # 通用效果
│   ├── hooks/              # 共享 Hooks
│   ├── utils/              # 工具函数
│   └── ...
├── internal/               # 内部工具
│   └── lint-configs/       # 代码规范配置
├── scripts/                # 脚本工具
└── ...
```

### 应用目录结构

每个应用（如 `web-antd`）的典型结构：

```
apps/web-antd/src/
├── api/                    # API 接口
├── assets/                 # 静态资源
├── components/             # 业务组件
│   ├── common/             # 公共组件
│   ├── layout/             # 布局组件
│   └── features/           # 功能组件
├── composables/            # 组合式函数
├── constants/              # 常量定义
├── layouts/                # 页面布局
├── router/                 # 路由配置
│   ├── routes/             # 路由定义
│   │   ├── core/           # 核心路由
│   │   ├── index.ts        # 静态路由
│   │   └── modules/        # 动态路由模块
│   └── ...
├── stores/                 # Pinia 状态管理
├── utils/                  # 工具函数
├── views/                  # 页面组件
└── ...
```

## 开发运行

### 安装依赖

```bash
# 进入项目根目录
cd vue-vben-admin

# 安装所有依赖（推荐使用 pnpm）
pnpm install

# 如果安装失败，可以尝试清理缓存
pnpm store prune
pnpm install
```

### 启动开发服务器

```bash
# 启动所有应用
pnpm dev

# 启动特定应用（推荐）
pnpm dev --filter @vben/web-antd

# 启动多个应用
pnpm dev --filter @vben/web-antd --filter @vben/docs

# 启动开发服务器并查看所有可用命令
pnpm run
```

### 开发服务器配置

默认配置：
- **端口**: 5555
- **主机**: localhost
- **热更新**: 启用

自定义端口：
```bash
# 修改 .env.development
VITE_PORT=5555
```

### 访问应用

启动成功后，访问：
- **主应用**: http://localhost:5555
- **文档**: http://localhost:5556

## 构建部署

### 构建项目

```bash
# 构建所有应用
pnpm build

# 构建特定应用
pnpm build --filter @vben/web-antd

# 构建并分析
pnpm run build:analyze
```

### 构建配置

#### 环境变量

创建 `.env.production` 文件：

```bash
# API 地址
VITE_API_BASE_URL=https://api.example.com
VITE_GLOB_API_URL=https://api.example.com/api

# 构建配置
VITE_COMPRESS=gzip
VITE_DROP_CONSOLE=true
```

#### 构建优化

```bash
# 1. 代码分割
# 在 vite.config.ts 中配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vue': ['vue', 'vue-router', 'pinia'],
          'ui': ['ant-design-vue', '@vben/components'],
          'utils': ['lodash-es', 'dayjs'],
        },
      },
    },
  },
})

# 2. 压缩
# 启用 gzip/brotli 压缩
VITE_COMPRESS=gzip

# 3. 移除 console
VITE_DROP_CONSOLE=true
```

### 预览构建结果

```bash
# 预览所有应用
pnpm preview

# 预览特定应用
pnpm preview --filter @vben/web-antd
```

### 部署

#### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    
    # 静态资源
    location / {
        root /var/www/vben-admin;
        try_files $uri $uri/ /index.html;
        
        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API 代理
    location /api/ {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    
    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

#### Docker 部署

```dockerfile
# Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

# 复制 package.json
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建
RUN pnpm build

# 生产阶段
FROM nginx:alpine

# 复制构建结果
COPY --from=builder /app/apps/web-antd/dist /usr/share/nginx/html

# 复制 nginx 配置
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;

        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:8080;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}
```

#### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  frontend:
    build: .
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

  backend:
    image: your-backend-image:latest
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: always
```

## 常见问题

### 1. 安装依赖失败

**问题**: `pnpm install` 失败

**解决方案**:
```bash
# 清理缓存
pnpm store prune

# 删除 node_modules 和 lock 文件
rm -rf node_modules pnpm-lock.yaml

# 重新安装
pnpm install

# 如果仍然失败，尝试使用 npm
npm install
```

### 2. 开发服务器启动失败

**问题**: 端口被占用

**解决方案**:
```bash
# 修改端口
# .env.development
VITE_PORT=5556

# 或查找并结束占用端口的进程
lsof -i :5555
kill -9 <PID>
```

### 3. TypeScript 错误

**问题**: 类型检查失败

**解决方案**:
```bash
# 运行类型检查
pnpm type-check

# 查看具体错误
pnpm type-check --noEmit
```

### 4. 构建失败

**问题**: 内存不足

**解决方案**:
```bash
# 增加 Node.js 内存限制
export NODE_OPTIONS="--max-old-space-size=8192"

# 或在 package.json 中配置
{
  "scripts": {
    "build": "cross-env NODE_OPTIONS=--max-old-space-size=8192 turbo build"
  }
}
```

### 5. 样式不生效

**问题**: Tailwind CSS 样式未生效

**解决方案**:
```bash
# 检查 Tailwind 配置
cat tailwind.config.js

# 重新构建
pnpm build

# 清理缓存
pnpm run clean
```

### 6. 路由不生效

**问题**: 动态路由未加载

**解决方案**:
1. 检查路由配置文件
2. 确认权限配置正确
3. 检查路由守卫逻辑
4. 查看控制台错误信息

### 7. API 请求失败

**问题**: 跨域或 404 错误

**解决方案**:
1. 检查 `.env` 文件中的 API 地址
2. 确认后端服务已启动
3. 检查代理配置（开发环境）
4. 查看网络请求详情

## 下一步

### 学习路径

1. **基础入门**
   - 阅读项目结构文档
   - 了解路由配置
   - 学习状态管理

2. **进阶开发**
   - 组件开发最佳实践
   - 权限系统配置
   - 主题定制

3. **高级主题**
   - 性能优化
   - 构建部署
   - 测试策略

### 资源

- **官方文档**: https://doc.vben.pro/
- **GitHub**: https://github.com/vbenjs/vue-vben-admin
- **示例**: https://www.vben.pro/
- **社区**: https://github.com/vbenjs/vue-vben-admin/discussions

### 获取帮助

1. **GitHub Issues**: 提交 bug 或功能请求
2. **GitHub Discussions**: 社区讨论
3. **文档**: 查阅官方文档
4. **示例**: 查看示例代码

## 总结

通过以上步骤，您应该已经成功搭建并运行了 Vben Admin 项目。接下来可以：

1. **探索项目**: 浏览代码结构，了解各个模块的作用
2. **修改配置**: 根据项目需求调整配置
3. **开发功能**: 开始您的业务开发
4. **部署上线**: 构建并部署到生产环境

祝您开发愉快！
