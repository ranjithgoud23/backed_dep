# Copyright 2023, the hatemragab project author.
# All rights reserved. Use of this source code is governed by a
# MIT license that can be found in the LICENSE file.

# Use the official Node.js runtime as a base image
FROM node:17.9.1-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production
RUN npm install --save-dev @types/multer


# Copy the current directory contents into the container at /app
COPY . .
# Expose port 3000 for the app
EXPOSE 3000
RUN npm install -g @nestjs/cli
RUN npm install -g typescript@4.8.4
RUN npm install -g cross-env
# Run the app
CMD ["npm","run","docker"]