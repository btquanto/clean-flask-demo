bind = '0.0.0.0:8000'
worker_class = 'eventlet'
workers = 1
proc_name = 'clean-flask-demo'
accesslog = '/src/logs/g_access.log'
errorlog = '/src/logs/g_error.log'