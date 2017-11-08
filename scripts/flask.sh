#!/bin/bash

DEBUG=true;
SKIP_REQUIREMENTS_CHECK=true;

set -e

cd /src

if [ -f requirements.txt ]
then
    if ! $SKIP_REQUIREMENTS_CHECK
    then
        echo "Checking for package updates...";
        pip3 install -Ur requirements.txt;
    fi;
fi;
if $DEBUG
then
    python3 app.py
else
    if [ "uwsgi_config.ini" ]
    then
        exec uwsgi --ini uwsgi_config.ini --logto ./logs/uwsgi.log
    else
        exec uwsgi --socket 0.0.0.0:8000 -w app:app
    fi;
fi;