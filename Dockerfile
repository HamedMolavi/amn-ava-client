FROM node:18.16.0-slim as builder
WORKDIR /isss-backend
COPY package.json .
COPY package-lock.json* .
RUN yarn install
RUN yarn global add typescript ts-node 

FROM builder
WORKDIR /isss-backend
COPY --from=builder /isss-backend /isss-backend
COPY tsconfig.json ./
COPY src ./src 
COPY security ./security

EXPOSE 3000

CMD [ "ts-node" , "./src/server.ts" ]
