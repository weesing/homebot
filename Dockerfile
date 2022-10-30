FROM node:14.20.1

RUN mkdir /app

RUN mkdir /app/snapshots

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8080

CMD ["npm", "start"]
