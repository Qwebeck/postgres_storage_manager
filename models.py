from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from config import SCHEMA_NAME, SQLALCHEMY_DATABASE_URI
from datetime import datetime
# from eralchemy import render_er

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = SQLALCHEMY_DATABASE_URI
app.config['JSON_SORT_KEYS'] = False
db = SQLAlchemy(app)

# Drawing ER diagram
# Draw from SQLAlchemy base
# render_er(SQLALCHEMY_DATABASE_URI, 'b2b_database.png')


class Businesses(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    name = db.Column(db.String, primary_key=True)
    products = db.relationship('Products', backref='owner',
                               lazy='select')

    def __repr__(self):
        return f'<{self.name}>'


class Orders(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    order_id = db.Column(db.Integer, primary_key=True)
    order_date = db.Column(db.DateTime, default=datetime.now)
    details = db.Column(db.String(100))
    completion_date = db.Column(db.DateTime)
    client_id = db.Column(db.String, db.ForeignKey(f'{SCHEMA_NAME}.businesses.name'),
                          nullable=False)
    supplier_id = db.Column(db.String, db.ForeignKey(f'{SCHEMA_NAME}.businesses.name'),
                            nullable=False)
    specific_orders = db.relationship('SpecificOrders', backref='orders',
                                      lazy='select')
    clients = db.relationship('Businesses',
                              lazy='select',
                              backref='orders_as_client',
                              foreign_keys=[client_id])
    suppliers = db.relationship('Businesses',
                                lazy='select',
                                backref='orders_as_supplier',
                                foreign_keys=[supplier_id])


class Products(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    serial_number = db.Column(db.String(20), primary_key=True)
    type_name = db.Column(db.String(50), nullable=False)
    producent = db.Column(db.String(20), nullable=False)
    model = db.Column(db.String(20), nullable=False)
    owner_id = db.Column(db.String, db.ForeignKey(f'{SCHEMA_NAME}.businesses.name'),
                         nullable=False)
    product_condition = db.Column(db.Boolean, default=True)
    additonal_info = db.Column(db.String(100))
    adding_date = db.Column(db.DateTime, default=datetime.utcnow)
    appear_in_order = db.Column(db.Integer,
                                db.ForeignKey(f'{SCHEMA_NAME}.orders.order_id'))

    def __repr__(self):
        return f'{self.type_name} {self.serial_number}, produced by {self.producent}'

# FIX
# Currently every product could be displayed only in one order, after order completion.
# It is connected with many-to-many realtionship between SpecificOrders and Products

# class History(db.Model):
#     order_id = ForeignKey to order
#     products_id = ForeignKey to product primary key


class CriticalLevels(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    business = db.Column(db.String,
                         db.ForeignKey(f'{SCHEMA_NAME}.businesses.name'),
                         primary_key=True)
    type_name = db.Column(db.String(50),
                          primary_key=True)
    critical_amount = db.Column(db.Integer)


class ProductsMovement(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    record_id = db.Column(db.Integer,
                          primary_key=True
                          )
    order_id = db.Column(db.Integer,
                         db.ForeignKey(f'{SCHEMA_NAME}.orders.order_id'),
                         nullable=False)
    serial_number = db.Column(db.String(20))
    type_name = db.Column(db.String(50), nullable=False)
    producent = db.Column(db.String(20), nullable=False)
    model = db.Column(db.String(20), nullable=False)


class SpecificOrders(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    specific_order_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey(f'{SCHEMA_NAME}.orders.order_id'),
                         nullable=False)
    quantity = db.Column(db.Integer, default=1)
    type_name = db.Column(db.String(50), nullable=None)
    # assigned_products = db.relationship("Products", backref='order')
