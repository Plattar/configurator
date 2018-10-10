#! /bin/sh

set -e
cd /var/configurator/

npm install
npm run prod

#cleanup to recover space
find . -name "node_modules" -type d -exec rm -rf '{}' +
npm uninstall --global gulp
npm cache clean --force
