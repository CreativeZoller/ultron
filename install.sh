#! /usr/bin/env bash
bower=./node_modules/.bin/bower

git config url."https://".insteadOf git://
npm install
$bower install && $bower prune
