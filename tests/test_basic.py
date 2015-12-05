import pytest


@pytest.fixture
def testapp():
    from app import app
    return app.test_client()


def test_pages(testapp):
    pages = ('/',)
    for page in pages:
        resp = testapp.get(page)
        assert resp.status_code == 200
