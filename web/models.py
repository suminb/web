from datetime import datetime
import os

from flask.json import JSONEncoder
import yaml


class CustomJSONEncoder(JSONEncoder):

    def default(self, obj):
        if isinstance(obj, datetime):
            return obj.strftime('%Y-%m-%dT%H:%M')
        else:
            return super(JSONEncoder, self).default(obj)


class Loader(yaml.SafeLoader):

    def __init__(self, stream):
        self._root = os.path.split(stream.name)[0]
        super(Loader, self).__init__(stream)

    def include(self, node):
        filename = os.path.join(self._root, self.construct_scalar(node))
        _, ext = os.path.splitext(filename)
        with open(filename, 'r') as f:
            if ext == '.yml':
                return yaml.load(f, Loader)
            else:
                return f.read()


Loader.add_constructor('!include', Loader.include)


class ExperienceCollection:
    """NOTE: Some implementations here are not really done with scalability in
    mind. However, the final product will be a set of static web pages and
    thus the performance of the server side logic is irrelevant.
    """

    def __init__(self, data):
        self.data = {k: Experience(key=k, **v) for k, v in data.items()}

    def __iter__(self):
        return iter(self.data)

    def __getitem__(self, key):
        return self.data[key]

    def items(self):
        return self.data.items()

    def find_experiences_with_tag(self, tag):
        return [v for k, v in self.items() if tag in v.tags]

    @property
    def categories(self):
        return set([v.category for k, v in self.data.items()])

    @classmethod
    def load(cls, yaml_file):
        with open(yaml_file) as fin:
            data = yaml.load(fin, Loader)
        collection = ExperienceCollection(data)

        return collection


class Experience:

    def __init__(self, key, published, parent, title, description, starts_at,
                 ends_at, category, tags):
        self.key = key
        self.published = published
        self.parent = parent
        self.title = title
        self.description = description
        self.starts_at = starts_at
        self.ends_at = ends_at
        self.category = category
        self.tags = tags
