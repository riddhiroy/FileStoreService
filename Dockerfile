FROM node:18-alpine
RUN apk add --no-cache git bash
RUN mkdir -p /app/{Models,utils}
ADD server/* /app
ADD server/Models/* /app/Models/
ADD server/utils/* /app/utils/
ADD server/constants/* /app/constants/
WORKDIR /app
# COPY server/package.json ./
RUN npm install
# Command to run the application
CMD ["node", "server.js"]
