# FileStoreService
A simple file store service (HTTP server and a command line client) that stores plain-text files and performs crud and some other operations on the files.

# Steps to use in local environment
- clone this repository in the desired folder [git clone repository link](https://github.com/riddhiroy/FileStoreService.git)
- SERVER SIDE SETUP:
  - you should have Node and npm in your sytem already. Refer [installation guide](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  - run `node server.js` to start the server. Alternatively you can use `nodemon server,js` so that you do not need to restart your server after changes.
  - The server is now running and listening on port 5000...
- CLIENT SIDE SETUP:
  - navigate to the goClient/ directory
  - run `go mod tidy`
  - run `go get github.com/spf13/cobra`
  - running command `go run client.go <args>` should work.
  - However, here we want to create a store binary. For that:
    - run `go build -o store client.go`
    - now you can run your commands like: >> `./store <args>`
    - [optional] Add the directory containing the store executable to your PATH.
      - `export PATH="$PATH:~/<project_path>/store"`
      - `source ~/.zshrc` or `source ~/.bashrc`
     
# Docker Image 
- I have created an image for the server which can be pulled from: https://hub.docker.com/repository/docker/riddhiroy/file-store-server/
- when runing the image make sure to expose it to port 5000->5000. For eg: `docker run -d -p 5000:5000 riddhiroy/file-store-server:v1
`
