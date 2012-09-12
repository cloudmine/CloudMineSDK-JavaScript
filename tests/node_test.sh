#!/bin/bash
if [ "$(which qunit)" == "" ]; then
  npm install qunit
fi

if [ "$2" == "" ]; then
    echo "QUnit Tests for CloudMine:"
    echo "Usage: $(basename $0) ApplicationId APIKey"
    exit 0
fi

export CLOUDMINE_APPID=$1
export CLOUDMINE_APIKEY=$2
qunit -c ../js/cloudmine.js -t ./tests.js
