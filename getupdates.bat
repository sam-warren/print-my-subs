@ECHO off
ECHO Getting latest...
start "" git fetch
timeout \t 10
start "" git pull