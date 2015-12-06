from . import testapp


def test_pages(testapp):
    pages = ('/',)
    for page in pages:
        resp = testapp.get(page)
        assert resp.status_code == 200
