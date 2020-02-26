#  Elephant uri
# SQLALCHEMY_DATABASE_URI = 'postgres://htegqoba:CwPfK1W8zi87m2zyb5zAZibx9x9Hgw4f@balarama.db.elephantsql.com:5432/'
# DATABASE = 'falcon_db'
ROLE = 'falcon:252325@localhost'
# ROLE = 'b2b:2504@localhost'
DATABASE = 'b2b_database'
SQLALCHEMY_DATABASE_URI = f'postgresql://{ROLE}/{DATABASE}'
# SQLALCHEMY_DATABASE_URI = f'postgresql://b2b:2504@localhost/{DATABASE}'
SQLALCHEMY_TRACK_MODIFICATIONS = False
SCHEMA_NAME = "b2b"
