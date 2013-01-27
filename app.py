import os

from flask import Flask
from flask import render_template
from jinja2 import evalcontextfilter, Markup, escape
from jinja2.environment import Environment
from urllib import quote

#
# Custom filters for Jinja
#
@evalcontextfilter
def format_tags(eval_ctx, value, attr=''):
    f = lambda x: '<span class="tag %s"><a href="/tag/%s">%s</a></span>' % (attr, x, x)

    if isinstance(value, list):
        return Markup(' '.join(map(f, value)))
    else:
        return Markup(f(value))

@evalcontextfilter
def optional_url(eval_ctx, name, url):
    if url != None and len(url) > 0:
        return Markup('<a href="%s">%s</a>' % (url, name))
    else:
        return name

app = Flask(__name__)
app.jinja_env.filters['format_tags'] = format_tags
app.jinja_env.filters['optional_url'] = optional_url

#
# Request handlers
#
@app.route("/")
def index():
    return render_template("index.html")

@app.route("/byeonbread")
def byeonbread():
    return render_template("byeonbread.html")

@app.route("/history")
def history():
    return render_template("history.html")

@app.route("/tagcloud")
def tagcloud():
    tags = extract_tags()
    cloud = map(lambda t: '{text: "%s", weight: %d, link: "/tag/%s"}' % (t, tags[t], t), tags)
    cloud_js = ",\n".join(cloud)

    return render_template("tagcloud.html", cloud=Markup(cloud_js))


@app.route("/projects")
@app.route("/tag/<tag>")
def projects(tag=None):
    from pymongo import MongoClient
    import settings

    connection = MongoClient(settings.DB_URL, settings.DB_PORT)
    db = connection.resume
    db.authenticate(settings.DB_USERNAME, settings.DB_PASSWORD)

    query = None
    if tag != None:
        # http://docs.mongodb.org/manual/reference/operator/or/#_S_or
        query = {'$or': [{'keywords':tag}, {'languages':tag}, {'year':tag}]}
        
    projects = db.projects.find(query)

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
    host = os.environ.get("HOST", "0.0.0.0")
    port = int(os.environ.get("PORT", 80))
    debug = bool(os.environ.get("DEBUG", 0))

    app.run(host=host, port=port, debug=debug)

if app.config['DEBUG']:
    from werkzeug import SharedDataMiddleware
    import os
    app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
      '/': os.path.join(os.path.dirname(__file__), 'static')
    })
