import os

from flask import Flask
from flask import render_template
from jinja2 import evalcontextfilter, Markup, escape
from jinja2.environment import Environment

#
# Custom filters for Jinja
#
@evalcontextfilter
def format_tags(eval_ctx, value, attr=''):
    f = lambda x: '<span class="tag %s">%s</span>' % (attr, x)

    if isinstance(value, list):
        return Markup(' '.join(map(f, value)))
    else:
        return Markup(f(value))

app = Flask(__name__)
app.jinja_env.filters['format_tags'] = format_tags

#
# Request handlers
#
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/tagcloud")
def tagcloud():
    tags = extract_tags()
    cloud = map(lambda t: '{text: "%s", weight: %d, link: "/tag/%s"}' % (t, tags[t], t), tags)
    cloud_js = ",\n".join(cloud)

    return render_template("tagcloud.html", cloud=Markup(cloud_js))


@app.route("/tag/<tag>")
def category(tag):
    from pymongo import MongoClient
    import settings

    connection = MongoClient(settings.DB_URL, settings.DB_PORT)
    db = connection.resume
    db.authenticate(settings.DB_USERNAME, settings.DB_PASSWORD)

    # http://docs.mongodb.org/manual/reference/operator/or/#_S_or
    projects = db.projects.find({'$or': [{'keywords':tag}, {'languages':tag}, {'year':tag}]})

    return render_template("projects.html", projects=projects)

def extract_tags():
    import json 

    def register_tag(tag_collection, tag):
        if tag not in tag_collection:
            tag_collection[tag] = 1
        else:
            tag_collection[tag] += 1

    tags = {}
    with open('projects.json') as f:
        data = json.loads(f.read())

        for row in data:
            for kw in row['keywords']:
                register_tag(tags, kw)
            for ln in row['languages']:
                register_tag(tags, ln)

            if isinstance(row['year'], list):
                for y in row['year']:
                    register_tag(tags, y)
            else:
                register_tag(tags, row['year'])

    return tags

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
