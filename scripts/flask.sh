#!/bin/bash
DEBUG=false;
SKIP_REQUIREMENTS_CHECK=false;

set -e

cd /src

if [ -f requirements.txt ]
then
    if ! $SKIP_REQUIREMENTS_CHECK
    then
        pip3 install -Ur requirements.txt;
    fi;
fi;
if $DEBUG
then
    python3 application.py
else
    . /src/scripts/flask_gunicorn.sh
fi;