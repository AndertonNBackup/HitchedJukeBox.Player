#!/bin/bash

cd /usr/code/server
npm i
npm run watch &
cd /usr/code/client 
npm i
npm run start:docker