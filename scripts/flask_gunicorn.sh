if [ -f scripts/config/gunicorn.py ]
then
    exec gunicorn --config scripts/config/gunicorn.py application:app
fi;