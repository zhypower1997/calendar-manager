# 使用Node.js官方基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json（或pnpm-lock.yaml）
COPY package.json pnpm-lock.yaml ./

# 安装pnpm
RUN npm install -g pnpm

# 安装项目依赖
RUN pnpm install

# 复制项目文件
COPY . .

# 构建应用
RUN pnpm build

# 设置数据存储路径
VOLUME /mnt/workspace

# 设置环境变量
ENV PORT=7860
ENV HOST=0.0.0.0

# 暴露端口
EXPOSE 7860

# 配置ENTRYPOINT启动命令
ENTRYPOINT ["node_modules/.bin/next", "start", "-p", "7860", "-H", "0.0.0.0"]