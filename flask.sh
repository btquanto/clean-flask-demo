#!/bin/bash
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

. /src/wsgi/gunicorn.sh