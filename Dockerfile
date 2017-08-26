FROM node:8.1
# FROM node:8.1-alpine
ENV API_PORT 8080
ENV API_URL 'ws://0.0.0.0:'
RUN mkdir -p /usr/code
COPY dev_entry_point.sh /usr/code/
WORKDIR /usr/code