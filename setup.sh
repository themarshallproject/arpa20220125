#!/bin/bash

printf "

▀█▀ █▀▄▀█ █▀█   █▀▀ █▀█ ▄▀█ █▀█ █░█ █ █▀▀ █▀
░█░ █░▀░█ █▀▀   █▄█ █▀▄ █▀█ █▀▀ █▀█ █ █▄▄ ▄█

Welcome to the graphics rig.\n\n"

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
