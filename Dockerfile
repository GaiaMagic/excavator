FROM node:0.10.33

MAINTAINER Cai Guanhao (caiguanhao@gmail.com)

RUN npm --loglevel http install -g gulp

ADD package.json /excavator/package.json

RUN cd /excavator && npm --loglevel http install

ADD . /excavator

WORKDIR /excavator

ENV NODE_ENV production

EXPOSE 3000

CMD gulp build && node excavator.js
