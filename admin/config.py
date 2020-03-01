from flask import Flask


use_cases = {
    'develop': {
        'user_name': 'falcon',
        'password':  '252325',
        'host': 'localhost',
        'database': 'falcon_db'
    },
    'production': {
        'user_name': 'b2b',
        'password':  '2504',
        'host': 'localhost',
        'database':  'b2b_database'
    },
    'test': {
        'user_name': 'b2b',
        'password':  '2504',
        'host': 'localhost',
        'database':  'b2b_database'
    },
    'cloud': {
        'user_name': 'htegqoba',
        'password': 'CwPfK1W8zi87m2zyb5zAZibx9x9Hgw4f',
        'host': 'balarama.db.elephantsql.com:5432',
        'database': 'htegqoba'
    }
}

actual_config = use_cases['develop']
USER = actual_config['user_name']
DATABASE = actual_config['database']
host_connection_string = f"{USER}:{actual_config['password']}@{actual_config['host']}"
SQLALCHEMY_DATABASE_URI = f'postgresql://{host_connection_string}/{DATABASE}'
SCHEMA_NAME = "b2b"

app = Flask(__name__, template_folder='templates')
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['JSON_SORT_KEYS'] = False
