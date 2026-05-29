#node base image
FROM node:20-alpine
#set working directory
WORKDIR /app
#copy package.json
COPY package.json ./
#install dependencies
RUN npm install
# copy all files
COPY . .
# build the react app
run npm run build
# install static server
run npm install -g serve
# expose port
EXPOSE 3000
# serve the production build
CMD ["serve", "-s", "build", "-l", "3000"]
