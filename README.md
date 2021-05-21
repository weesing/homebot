# What is HomeBot?
HomeBot is a NodeJS based Telegram Bot that allows broadcasting of messages through Google Home Minis, Control Devices (On/Off), and Camera Snapshot retrieval (WIP).

Last tested on NodeJS version 14

# How to run
- Run `npm install`
  - Installing of *nix machines requires the `make` and `g++` package.
  - You can install these using the commands in Ubuntu 20.04 LTS
  ` sudo apt install build-essentials`

- Run `node serveresm.js`

# Secrets
- In order to integrate with Telegram and Google Home (and it's Minis).
- Please observe `sample.secrets.json` as an example and create your `secrets.json` file containing your real secrets. 
- *Please remember not to commit your secrets in your code repository, add the `secrets.json` file into your .gitignore*

# Improvements
- Migrate to different Telegram Bot framework from Telegraf. Not very ideal internal error handling and often crashes the bot.