from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from admin.config import app, SCHEMA_NAME
from datetime import datetime

db = SQLAlchemy(app)
db.engine.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME};")


class Businesses(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    name = db.Column(db.String, primary_key=True)
    is_service = db.Column(db.Boolean, default=False)
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
    producent = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)
    owner_id = db.Column(db.String, db.ForeignKey(f'{SCHEMA_NAME}.businesses.name'),
                         nullable=False)
    product_condition = db.Column(db.Boolean, default=True)
    additonal_info = db.Column(db.String(500))
    adding_date = db.Column(db.DateTime, default=datetime.utcnow)
    appear_in_order = db.Column(db.Integer,
                                db.ForeignKey(f'{SCHEMA_NAME}.orders.order_id'))

    def __repr__(self):
        return f'{self.type_name} {self.serial_number}, produced by {self.producent}'


class CriticalLevels(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    business = db.Column(db.String,
                         db.ForeignKey(
                             f'{SCHEMA_NAME}.businesses.name', ondelete="CASCADE"),
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
    producent = db.Column(db.String(50), nullable=False)
    model = db.Column(db.String(50), nullable=False)


class SpecificOrders(db.Model):
    __table_args__ = {"schema": SCHEMA_NAME}
    specific_order_id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey(f'{SCHEMA_NAME}.orders.order_id'),
                         nullable=False)
    quantity = db.Column(db.Integer, default=1)
    type_name = db.Column(db.String(50), nullable=None)
    # assigned_products = db.relationship("Products", backref='order')


db.create_all()
