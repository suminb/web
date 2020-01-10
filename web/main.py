import os
import sys

from flask import Blueprint, render_template
from logbook import Logger, StreamHandler

from web.models import ExperienceCollection


main_module = Blueprint("main", __name__, template_folder="templates/main")

StreamHandler(sys.stderr).push_application()
log = Logger(__name__)

DATA_FILE = "data/experiences.yml"


@main_module.route("/")
def index():
    # FIXME: Could we automate this part somehow? (current_page)
    return render_template("index.html", **{"current_page": "index"})


@main_module.route("/coding-expedition.html")
def coding_expedition():
    context = {
        "current_page": "coding_expedition",
        "google_maps_api_key": os.environ["GOOGLE_MAPS_API_KEY"],
    }
    return render_template("coding_expedition.html", **context)


@main_module.route("/experience.html")
def experience_summary():
    experiences = ExperienceCollection.load(DATA_FILE)
    context = {
        "current_page": "experience",
        "experiences": experiences,
    }
    return render_template("experience_summary.html", **context)


@main_module.route("/experiences/<key>.html")
def experience(key):
    collection = ExperienceCollection.load(DATA_FILE)
    # FIXME: Code refactoring required
    try:
        experience = collection[key]
    except KeyError:
        return "", 404

    if not experience.published and not os.environ.get("DEBUG"):
        return "", 404

    context = {
        "current_page": "experience",
        "collection": collection,
        "experience": experience,
    }
    return render_template("experience.html", **context)


@main_module.route("/experiences/tags/<tag>.html")
def experiences_with_tag(tag):
    collection = ExperienceCollection.load(DATA_FILE)
    context = {
        "current_page": "experience",
        "experiences": collection.find_experiences_with_tag(tag),
    }
    return render_template("experiences.html", **context)
