# -*- coding: utf-8 -*-
from apiclient.discovery import build

# Find the stack on which we want to store the database connection.
# Starting with Flask 0.9, the _app_ctx_stack is the correct one,
# before that we need to use the _request_ctx_stack.
try:
    from flask import _app_ctx_stack as stack
except ImportError:
    from flask import _request_ctx_stack as stack

class YoutubeClient(object):

    YOUTUBE_API_SERVICE_NAME = "youtube"
    YOUTUBE_API_VERSION = "v3"

    def __init__(self, app=None):
        if app is not None:
            self.init_app(app)

    def init_app(self, app):
        self.developer_key = app.config["GOOGLE_DEVELOPER_KEY"]
        # Use the newstyle teardown_appcontext if it's available,
        # otherwise fall back to the request context
        if hasattr(app, 'teardown_appcontext'):
            app.teardown_appcontext(self._teardown)
        else:
            app.teardown_request(self._teardown)

    @property
    def client(self):
        # Get the current elasticsearch client for the current context
        ctx = stack.top
        if not hasattr(ctx, 'youtube'):
            ctx.youtube = build(self.YOUTUBE_API_SERVICE_NAME,
                            self.YOUTUBE_API_VERSION,
                            developerKey=self.developer_key)
        return ctx.youtube

    def _teardown(self, exception):
        ctx = stack.top
        if hasattr(ctx, 'youtube'):
            ctx.youtube = None
