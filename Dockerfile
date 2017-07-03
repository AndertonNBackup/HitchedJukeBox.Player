FROM node:8.1
# FROM node:8.1-alpine
RUN mkdir -p /code
WORKDIR /code
ADD . /code
RUN npm install -g -s --no-progress yarn && \
    yarn && \
    # yarn run build && \
    # yarn run prune && \
    yarn cache clean
CMD [ "node", "index.js" ]
EXPOSE 3000