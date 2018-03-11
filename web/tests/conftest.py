from web import create_app
import pytest


@pytest.fixture
def testapp(request):
    """Session-wide test `Flask` application."""
    settings_override = {
        'TESTING': True,
        'DEBUG': True,
    }
    app = create_app(__name__, config=settings_override,
                     template_folder='../templates')

    # Establish an application context before running the tests.
    ctx = app.app_context()
    ctx.push()

    def teardown():
        ctx.pop()

    request.addfinalizer(teardown)
    return app.test_client()
