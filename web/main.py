import os

from flask import Blueprint, render_template


main_module = Blueprint('main', __name__, template_folder='templates/main')


@main_module.route('/')
def index():
    return render_template("index.html")


@main_module.route("/byeonbread")
def byeonbread():
    return render_template("byeonbread.html")


@main_module.route("/history")
def history():
    return render_template("history.html")


@main_module.route("/tagcloud")
def tagcloud():
    tags = extract_tags()
    cloud = map(lambda t: '{text: "%s", weight: %d, link: "/tag/%s"}' % (t, tags[t], t), tags)
    cloud_js = ",\n".join(cloud)

    return render_template("tagcloud.html", cloud=Markup(cloud_js))


@main_module.route("/projects")
@main_module.route("/tag/<tag>")
def projects(tag=None):
    from pymongo import MongoClient
    import re

    connection = MongoClient(os.environ['DB_URL'], int(os.environ['DB_PORT']))
    db = connection.resume
    db.authenticate(os.environ['DB_USERNAME'], os.environ['DB_PASSWORD'])

    query = None
    if tag is None:
        # http://docs.mongodb.org/manual/reference/operator/or/#_S_or
        if re.match(r'\d+', tag):
            print('year')
            query = {'year': int(tag)}
        else:
            print('keyword')
            query = {'$or': [{'keywords':tag}, {'languages':tag}]}

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

