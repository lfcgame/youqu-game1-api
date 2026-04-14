FROM node:18-alpine
WORKDIR /opt/application
COPY . .
RUN npm install --registry=https://registry.npmmirror.com
EXPOSE 8000

# 就是这一行！直接用 node 启动！
CMD ["node", "src/server.js"]
