#!/bin/bash

printf "
 _____ _   _ ____  ____  _   _ _   _
| ____| \ | |  _ \|  _ \| | | | \ | |
|  _| |  \| | | | | |_) | | | |  \| |
| |___| |\  | |_| |  _ <| |_| | |\  |
|_____|_| \_|____/|_| \_|\___/|_| \_|

Welcome to EndRun.\n\n"

set -e

if [[ -z $(which node) ||  -z $(which npm) ]]; then
  echo "Please install node and npm before re-running this command. https://nodejs.org/en/download/"
  exit 1
fi;

if [ -z $(which gulp) ]; then
  npm install -g gulp-cli
fi;

git init
npm install
gulp setup
