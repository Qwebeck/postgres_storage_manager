from setuptools import setup, find_packages
setup(
    name="HelloWorld",
    version="0.1",
    packages=find_packages(),
    scripts=["config.py, models.py, server.py, queries.py"],

    # Project uses reStructuredText, so ensure that the docutils get
    # installed or upgraded on the target machine
    install_requires=[
        "flask==1.0.2",
        "flask_sqlalchemy==2.1",
        "psycopg2==2.7.7"
        ]
)