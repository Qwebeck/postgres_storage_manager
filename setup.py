from setuptools import setup, find_packages
setup(
    name="b2b_database",
    version="1.0.0",
    license="BSD",
    install_requires=[
        'sqlalchemy',
        'flask',
        'flask_sqlalchemy',
        'psycopg2',
        'sh',
        'pydrive'
        ]
)
