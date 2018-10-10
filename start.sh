#! /bin/bash

set -e
cd /var/configurator/

mkdir -p /usr/share/nginx/html/configurator #will conditionally create dir if not exists
rm -rf /usr/share/nginx/html/configurator/*
cp -a /var/configurator/. /usr/share/nginx/html/configurator

#purge cache - key should come from web container env vars. will show 404 response if both vars aren't set.
# if [ "$ENVIRONMENT" = "staging" ] ; then
#     curl -vs -X POST https://api.fastly.com/service/5QmXOxcLrjEyYLpVkIlJrS/purge/cms -H 'Accept: application/json' -H "Fastly-Key: a3090b579fb95b8ad21539803f305b37" -H "Fastly-Soft-Purge:1"
# fi
# if [ "$ENVIRONMENT" = "production" ] ; then
#     curl -vs -X POST https://api.fastly.com/service/7hsMwPtVhhQB8PyeiO8ejW/purge/cms -H 'Accept: application/json' -H "Fastly-Key: a3090b579fb95b8ad21539803f305b37" -H "Fastly-Soft-Purge:1"
# fi
