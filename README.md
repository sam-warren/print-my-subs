# Print My Subs

An express service and vue interface that allows a Twitch streamer to authenticate and listen for updates to their subscriber count. When a new user subscribes, the information is sent to a printer on their local network or over USB.

# Installation
```
git clone https://github.com/sam-warren/print-my-subs.git
```

# Config
Create an ENV file in server/.env with the following properties:

```
CLIENT_ID=
CLIENT_SECRET=
PORT=5010
DATABASE_URL=
```

# First time startup
It may take docker up to a minute to set up the database before you can authenticate with twitch. Run printmysubs.bat for the first time and leave it until the logs in the db shell stop. Then close all the shell windows and start it again with printmysubs.bat.

# Starting up
Run `printmysubs.bat`

# Getting updates
Run `getupdates.bat`
