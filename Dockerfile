FROM node:16.17.0 as builder

WORKDIR /code

ADD package.json pnpm-lock.yaml /code/

RUN npm config set registry http://registry.npm.taobao.org/

RUN npm install -g pnpm

RUN pnpm config set registry https://registry.npm.taobao.org/

RUN pnpm install

ADD . /code

RUN npm run build

RUN wget http://gosspublic.alicdn.com/ossutil/1.6.18/ossutil64

RUN chmod 755 ossutil64

RUN ./ossutil64 config -e oss-cn-guangzhou.aliyuncs.com -i LTAI5tC8kTqenE6EUQoQTx63 -k rjM8GJtrWx3MMCmLXBYYXvTitH8Ka2 -L CH --loglevel debug -c ~/.ossutilconfig

RUN ./ossutil64 -c ~/.ossutilconfig cp -r -f dist oss://lcsubappassets/rtc

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder code/dist /usr/share/nginx/html
