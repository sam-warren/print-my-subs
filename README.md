# Print My Subs

An Express service and Vue interface that allows a Twitch streamer to authenticate and listen for updates to their subscriber count. When a new user subscribes, the information is sent to a printer on their local network or over USB.

# Requirements
- Python
- Docker
- Node
- Git
- EPSON or STAR thermal printer with drivers installed

# Installation
```
git clone https://github.com/sam-warren/print-my-subs.git
```

# Config
1. Create an ENV file in `server/.env` with the following format, or make a copy of `.env.example`:

```
CLIENT_ID=
CLIENT_SECRET=
PORT=5010
LOCAL_IPV4=
```

You'll need to provide your own Client ID and Client Secret from your individually configured Twitch console. Run `ipconfig` in a cmd shell to get your local IPv4 address. This is usually of the format `192.168.1.XX` or `10.X.X.X`.

2. Open Powershell as administrator and run `npm install --global windows-build-tools` (Required for building `printer` dependency)

3. `cd server` and run `npm install printer --build-from-source`

# First time startup
It may take docker up to a minute to set up the database before you can authenticate with twitch. Run printmysubs.bat for the first time and leave it until the logs in the db shell stop. Then close all the shell windows and start it again with printmysubs.bat.

# Starting up
Run `printmysubs.bat`

# Getting updates
Run `getupdates.bat`

# Support
If you have any issues running PrintMySubs please create an issue in this repository and I'll check it out as soon as possible.

# Contributing
Pull requests are always open.
