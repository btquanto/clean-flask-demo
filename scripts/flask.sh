#!/bin/bash
DEBUG=false;
SKIP_REQUIREMENTS_CHECK=false;

set -e

cd /src

if ! [ -f config/flaskconfig.py ]
then
    echo "Configuration file `config/flaskconfig.py` not found"
    echo "Please create one using `config/flaskconfig.py.template` as the template"
    exit 0;
fi;

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