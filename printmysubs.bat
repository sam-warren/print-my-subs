@ECHO off
ECHO Starting database...
cd db
start "" docker-compose up
timeout \t 10
ECHO Starting server...
cd ../server
start "" npm run serve
ECHO Starting client...
cd ../client
start "" npm run serve
start chrome --new-window "http://localhost:8080"