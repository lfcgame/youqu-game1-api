FROM node:18-alpine
WORKDIR /opt/application
COPY . .

# 淘宝 npm 镜像，解决下载失败
RUN npm install --registry=https://registry.npmmirror.com

EXPOSE 8000
CMD ["sh", "run.sh"]
