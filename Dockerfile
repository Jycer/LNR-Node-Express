# FROM node:14-alpine
FROM timbru31/java-node

ENV NODE_ENV=production
ENV PORT="3000"
ENV NODE_TLS_REJECT_UNAUTHORIZED="0"
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
