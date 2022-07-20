FROM node:18.4.0-alpine3.15
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
COPY ./src ./src
COPY ./videos ./videos
CMD npm start