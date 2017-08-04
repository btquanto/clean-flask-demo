#!/bin/bash

DEBUG=false;

set -e

cd /src

if [ -f requirements.txt ]
then
    echo "Checking for package updates...";
    pip install -Ur requirements.txt;
fi;
if $DEBUG
then
    python3 initialization.py
else
    if [ "uwsgi_config.ini" ]
    then
        exec uwsgi --ini uwsgi_config.ini --logto ./logs/uwsgi.log
    else
        exec uwsgi --http 0.0.0.0:8000 -w initialization:app
    fi;
fi;