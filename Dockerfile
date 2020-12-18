#Use Ubuntu 18.04
FROM ubuntu:20.04
#Fetch and install updates
RUN apt-get update && apt-get -y upgrade
#Install required packages
RUN apt-get -y install curl
RUN curl -sL https://deb.nodesource.com/setup_14.x | bash
RUN apt-get -y install nodejs
#Set better shell because /bin/sh sux and doesnt support arrow keys
WORKDIR /autodeploy
SHELL ["/bin/bash", "-c"]

# Copy package.json for dependencies
COPY package.json .

RUN npm install

CMD node .