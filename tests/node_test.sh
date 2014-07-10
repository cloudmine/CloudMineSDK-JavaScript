#!/bin/bash
QUNIT=../node_modules/.bin/qunit

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
$QUNIT -c ../js/cloudmine.js -d ./init.js ./util.js ./config.js -t ./tests.js
