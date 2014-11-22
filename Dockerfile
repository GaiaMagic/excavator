FROM node:0.10.33

MAINTAINER Cai Guanhao (caiguanhao@gmail.com)

RUN npm --loglevel http install -g gulp

ADD package.json /excavator/package.json

RUN cd /excavator && npm --loglevel http install

ADD . /excavator

WORKDIR /excavator

RUN gulp build

ENV NODE_ENV production

CMD node excavator.js
