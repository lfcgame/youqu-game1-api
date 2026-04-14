FROM node:18-alpine
WORKDIR /opt/application
COPY . .
RUN npm install --registry=https://registry.npmmirror.com
RUN chmod +x run.sh
EXPOSE 8000
CMD ["sh", "run.sh"]
