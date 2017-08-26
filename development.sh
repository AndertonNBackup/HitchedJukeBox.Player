#!/bin/bash

IMAGE_NAME=hitchedjukebox.player
CONTAINER_NAME=player.dev

docker stop ${CONTAINER_NAME}  
docker rm ${CONTAINER_NAME}

docker run \
    -d \
    -p 4300:4300 \
    -p 8090:8090 \
    --name ${CONTAINER_NAME} \
    -e "NODE_ENV=development" \
    -v `pwd`/client:/usr/code/client \
    -v `pwd`/server:/usr/code/server \
    ${IMAGE_NAME}:dev \
    /usr/code/dev_entry_point.sh 