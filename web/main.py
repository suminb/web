from flask import Blueprint, render_template


main_module = Blueprint('main', __name__, template_folder='templates/main')


@main_module.route('/')
def index():
    # FIXME: Could we automate this part somehow? (current_page)
    return render_template('index.html', **{'current_page': 'index'})


@main_module.route('/coding-expedition')
def coding_expedition():
    context = {'current_page': 'coding_expedition'}
    return render_template('coding-expedition.html', **context)
