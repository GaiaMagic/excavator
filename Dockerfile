FROM dockerfile/nodejs

MAINTAINER Cai Guanhao (caiguanhao@gmail.com)

RUN npm install -g npm gulp

ADD package.json /excavator/package.json

RUN cd /excavator && npm install

ADD . /excavator

WORKDIR /excavator

ENV NODE_ENV production

RUN gulp build

EXPOSE 3000

CMD node excavator.js
