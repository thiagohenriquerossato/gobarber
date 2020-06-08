FROM node:12

WORKDIR /us/app
COPY package.json yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000
CMD ["yarn", "dev"]
