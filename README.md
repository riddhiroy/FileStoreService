# File Store Service
A simple file store service (HTTP server and a command line client) that stores plain-text files. The server receives requests from clients to store, update, delete files, and perform operations on files stored in the server.

# Steps to use in local environment

**IMPORTANT: There has been a recent deprecation of ObjectId class in Bson, Latest commit replaces bson Object Id usage with imports from mongodb. Please pull the latest commit (9th April 4:35pm IST). Without the latest pull (one line change), the /rm function will throw errors.**
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

# Deployment in Kubernetes kind cluster
-  `brew install kind`
- `kind create cluster --name file-store-cluster`
- `kubectl config get-contexts`
- `kubectl config use-context kind-file-store-cluster`
- `kubectl apply -f file-store-template.yaml` (can also be created using commands like kubectl create deployment <deployment_name> -n <namespace_name> / same for namespace. First create namespace.)
- Retrieve yaml file for deployment: `kubectl get deployment/file-store-server -n file-store -o yaml`
- `kubectl get all -n file-store`
- `kubectl expose deployment file-store-server --type=NodePort --name=file-store-server-service --port=5000 --target-port=5000 -n file-store`
- `kubectl port-forward svc/file-store-server-service -n file-store 5000:5000`
- `kubectl logs service/file-store-server-service -n file-store -f`

`
