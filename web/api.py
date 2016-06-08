from flask import Blueprint, render_template


api_module = Blueprint('api', __name__, template_folder='templates/api')
