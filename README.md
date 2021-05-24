# What is HomeBot?
HomeBot is a NodeJS based Telegram Bot that allows broadcasting of messages through Google Home Minis, Control Devices (On/Off), and Camera Snapshot retrieval (WIP).

Last tested on NodeJS version 14

# How to run
- There are 2 methods to run the application.
  - You can follow the 'Quick setup' to quickly run the application.
  - Or you can follow the Dockerized method (*recommended*).

## Quick setup
- Run `npm install`
  - Installing of *nix machines requires the `make` and `g++` package.
  - You can install these using the commands in Ubuntu 20.04 LTS
  ` sudo apt install build-essentials`

- Run `node serveresm.js`

## Dockerized *Recommended*
- You can also run this application in a dockerized form.
- The main docker file can be found at the root of the source named `Dockerfile`.

### Before you begin
- Ensure you have Docker installed.
  - Please refer to https://docker.io for instructions on installing Docker.

### Using Dockerfile
- Execute the following command to build the image:
```
docker build -t <image name e.g. weesing/rata:latest> .
```
- The `weesing/rata:latest` is the name/tag of the Docker image. You can change it to whatever tag you like.
- Execute the following command to start a container:
```
docker run --name rata -d --restart unless-stopped -p <your port>:8080 weesing/rata:latest
```
___
| Argument| Description |
| --            | -- |
| --name rata   | This will be the name of the container for easy execution of Docker commands later instead of using the container ID.
| -d            | Executes the container in daemon mode. If you omit this, the application will exit when you break (Ctrl+C) from the logs.
| -p 8080:8080  | Maps the local port `8080` to your container port which is also `8080`. This allows you to access the container through http://localhost:8080. If you wish to use another port, you can modify it to `<your port>:8080` (e.g. `80:8080` to use port 80).
| weesing/rata:latest  | Name of the image to use to run the container. If you have changed the name/tag of the Docker image in the previous `docker build...` command, please change this accordingly.
___
- To ensure that your container is running, execute:
```
docker ps
```
  - There should be a container named rata (or whatever you changed the `--name` argument to) running.
- To view the logs of the container, execute:
```
docker logs -f rata
```
  - This will tail the logs. Ctrl+C to exit.


### Shell script `exec.sh`
- There is a `exec.sh` shell script at the root of the source that performs all the actions listed under the section above that runs the application in a container.
- Execute this shell script using the command `./exec.sh`.



### Using docker-compose
- There is a `docker-compose.yaml` in the root of the source.
- To use the `docker-compose.yaml` file, ensure that you have Docker installed as well as docker-compose.
  - Refer to https://docs.docker.com/compose/install/ for docker-compose installation.
- You can execute the following to utilize the docker compose file:
```
docker-compose up -d
```

# Secrets
- In order to integrate with Telegram and Google Home (and it's Minis).
- Please observe `sample.secrets.json` as an example and create your `secrets.json` file containing your real secrets. 
- *Please remember not to commit your secrets in your code repository, add the `secrets.json` file into your .gitignore*

# Improvements
- *(DONE)* Migrate to different Telegram Bot framework from Telegraf. Not very ideal internal error handling and often crashes the bot.
- Refactoring of menu handling to it's own generic library.
