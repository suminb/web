#!/usr/bin/env python

from distutils.core import setup
from setuptools import find_packages

import web


def readme():
    try:
        with open('README.rst') as f:
            return f.read()
    except FileNotFoundError:
        return '(Could not read from README.rst)'


setup(
    name='web',
    version=web.__version__,
    description='Personal website',
    long_description=readme(),
    url='http://github.com/suminb/web',
    license='GPLv3',
    packages=find_packages(),
    entry_points={
        'console_scripts': [
            'web = web.__main__:cli'
        ]
    },
)
