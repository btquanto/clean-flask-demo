#!/bin/bash
set -eu;

REQUIREMENTS="requirements.txt";

# Install requirements from requirements.txt. Comment this if you don't have any changes to requirements.txt
if [ -f $REQUIREMENTS ]; then
    pip3 wheel --find-links=/wheeldir -w /wheeldir -r $REQUIREMENTS;
    pip3 install --find-links=/wheeldir -r $REQUIREMENTS;
fi;

# gunicorn --config config/gunicorn.py app:app
python3 app.py