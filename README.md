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
