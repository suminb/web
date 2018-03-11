from web.utils import is_valid_coordinate


def test_is_valid_coordinate():
    assert is_valid_coordinate((0, 0))
    assert is_valid_coordinate((2.17, 3.14))
    assert not is_valid_coordinate(None)
    assert not is_valid_coordinate(None)
