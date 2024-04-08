# File Store Service
A simple file store service (HTTP server and a command line client) that stores plain-text files. The server receives requests from clients to store, update, delete files, and perform operations on files stored in the server.

# Steps to use in local environment
- clone this repository in the desired folder [git clone repository link](https://github.com/riddhiroy/FileStoreService.git)
- SERVER SIDE SETUP:
  - you should have Node and npm in your sytem already. Refer [installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  - navigate to the `server/` directory. This directory has the `server.js` that we will run for our server.
  - run `npm insatll` to install all the required dependencies as mentioned in `package.json`
  - run `node server.js` to start the server. Alternatively you can use `nodemon server.js` so that you do not need to restart your server after changes.
  - The server is now running and listening on port 5000
- CLIENT SIDE SETUP:
  - navigate to the goClient/ directory
  - run `go mod tidy`
  - run `go get github.com/spf13/cobra`
  - run command `go run client.go <args>`
  - To create a store binary:
    - run `go build -o store client.go`
    - run the desired commands: >> `./store <args>`
    - run `./store --help` to know more
    - [optional] Add the directory containing the store executable to your PATH.
      - `export PATH="$PATH:~/<project_path>/store"`
      - `source ~/.zshrc` or `source ~/.bashrc`
     
# Docker Image 
- Docker image for the server-side application: https://hub.docker.com/repository/docker/riddhiroy/file-store-server/
- When running the image, ensure it's exposed to port 5000 by utilizing the command: `docker run -d -p 5000:5000 riddhiroy/file-store-server:v1`
`
