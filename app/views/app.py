import os

from flask import Flask
from flask import render_template

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

if __name__ == "__main__":
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", 80))
    debug = bool(os.environ.get("DEBUG", 1))

    app.run(host=host, port=port, debug=debug)
