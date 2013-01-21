import os

from flask import Flask
from flask import render_template

app = Flask(__name__, )

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/tag/<tag>")
def category(tag):
    return render_template("tag.html")

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 80))
    debug = bool(os.environ.get("DEBUG", 1))

    app.run(host=host, port=port, debug=debug)

if app.config['DEBUG']:
    from werkzeug import SharedDataMiddleware
    import os
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
      '/': os.path.join(os.path.dirname(__file__), 'static')
    })