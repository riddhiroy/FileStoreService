FROM node:18-alpine
RUN apk add --no-cache git bash
RUN mkdir -p /app/{Models,utils}
ADD server/* /app
ADD server/Models/* /app/Models/
ADD server/utils/* /app/utils/
ADD server/constants/* /app/constants/
ADD server/tests/* /app/tests/
WORKDIR /app
RUN npm install
# Command to run the application
CMD ["node", "server.js"]
