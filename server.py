from flask import (jsonify, render_template, request)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, update, delete, join, select, and_
from sqlalchemy.orm import aliased
from config import *
from models import (app, db, Products, Businesses, Orders, SpecificOrders)
from sqlalchemy.sql import text
from datetime import datetime
from src.utils import pack_query_to_dict
from src.queries import (client_supplier_query,
                         types_query,
                         statistics_query,
                         expand_type_query,
                         create_product,
                         businesses_query,
                         get_orders_query,
                         expand_order_query,
                         orders_from_to_query,
                         change_owner,
                         add_history_record,
                         expand_history_order_query)

from sqlalchemy.exc import IntegrityError
import traceback

class InvalidUsage(Exception):
    status_code = 400

    def __init__(self, message, status_code=None, payload=None):
        Exception.__init__(self)
        self.message = message
        if status_code is not None:
            self.status_code = status_code
        self.payload = payload

    def to_dict(self):
        rv = dict(self.payload or ())
        rv['message'] = self.message
        return rv


@app.errorhandler(IntegrityError)
def handle_invalid_usage(error):
    response = InvalidUsage(
        message='Подобный ключ уже существует в базе данных')
    response.status_code = 500
    response = response.to_dict()
    return jsonify(response), 400


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/get_types/id/<string:owner_id>')
def get_types(owner_id):
    available_types = types_query(owner_id).all()
    result = pack_query_to_dict(available_types)
    return jsonify(result)


@app.route('/get_statistics/id/<string:owner_id>')
def count_types(owner_id):
    """Return count of products on storage."""
    statistics = statistics_query(owner_id)
    result = db.session.query(statistics).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/expand_types/id/<string:owner_id>/types/<string:type_name>')
def get_details_about_type(owner_id, type_name):
    types = type_name.split(',')
    result = expand_type_query(owner_id, [type_name]).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/add_items_on_storage/id/<string:owner_id>', methods=['POST'])
def insert_items(owner_id):
    new_product = request.get_json()
    if 'additional_info' not in new_product.keys():
        new_product['additional_info'] = ""
    new_product = create_product(new_product, owner_id)
    db.session.add(new_product)
    db.session.commit()
    return 'ok'


@app.route('/delete_product', methods=['DELETE'])
def delete_product():
    serial_number = request.get_json()['serial_number']
    db.session.query(Products.serial_number)\
              .filter_by(serial_number=serial_number)\
              .delete()
    db.session.commit()
    return 'ok'

@app.route('/delete_order/id/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    try:
        db.session.query(SpecificOrders)\
            .filter_by(order_id=order_id)\
            .delete()
        db.session.query(Orders)\
                  .filter_by(order_id=order_id)\
                  .delete()
        db.session.commit()
    except Exception:
        tb = traceback.format_exc()
        print(tb)
    return 'ok'



@app.route('/info_about_businesses')
def get_info():
    query = businesses_query()
    result = db.session.query(query).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/get_orders/<string:business_id>')
def get_orders(business_id):
    history = request.args.get('history')
    result = get_orders_query(history, business_id).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/get_orders/from/<string:from_>/to/<string:to>/<string:business_id>')
def orders_in_period(from_, to, business_id):
    history = request.args.get('history')
    query = orders_from_to_query(history, from_, to, business_id)
    result = query.all()
    result = pack_query_to_dict(result)
    if not result:
        result = {'result': None}
    return jsonify(result)


@app.route('/add_order', methods=["POST"])
def add_order():
    data = request.get_json()
    new_order = Orders(client_id=data.pop('client_id'),
                       supplier_id=data.pop('supplier_id'))
    db.session.add(new_order)
    db.session.commit()
    for item in data:
        try:
            new_specific_order = SpecificOrders(order_id=new_order.order_id,
                                                quantity=int(
                                                    data[item]['number']),
                                                type_name=data[item]['type'])
            db.session.add(new_specific_order)
        except ValueError:
            continue
    db.session.commit()
    return 'ok'


@app.route('/sides_in_order/id/<int:order_id>')
def get_order_sides(order_id):
    result = db.session.query(client_supplier_query(order_id)).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/expand_history_order/id/<int:order_id>')
def expand_history_order(order_id):
    result = expand_history_order_query(order_id).all()
    result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/expand_order/id/<int:order_id>')
def expand_order(order_id):
    query = expand_order_query(order_id).all()
    item_info = {'available_products': [],
                 'order_stats': []
                 }
    products_with_stats = {}
    for row in query:
        if row.type_name not in products_with_stats.keys():
            print(row.number)
            item_stats = {
                'Тип': row.type_name,
                'Останеться': row.number-row.quantity if row.number else -row.quantity,
                'Требуеться': row.quantity,

            }
            item_info['order_stats'].append(item_stats)
            # Quantity - number of products ,that should be added to order
            # Used, because query returns all products, that satisfy conditions
            products_with_stats[row.type_name] = row.quantity
        # row.serial_number equviavalent to product existance.
        if row.serial_number and products_with_stats[row.type_name] > 0:
            item_info['available_products'].append(row)
            products_with_stats[row.type_name] -= 1
            # item_info['order_stats'][row.type_name]['Останеться'] += 1
    return jsonify(item_info)


@app.route('/add_new_business', methods=['POST'])
def add_info():
    info = request.get_json()
    new_business = Businesses(
        name=info['name'].strip(),
    )
    db.session.add(new_business)
    db.session.commit()
    return 'done'


# Possibly - the main reason of too many connections to database/
@app.route('/complete_order/id/<int:order_id>', methods=["POST"])
def complete_order(order_id):
    data = request.get_json()
    product_serial_numbers = data['products']
    customer_id = data['customer']
    add_history_record(order_id, product_serial_numbers)
    change_owner(customer_id, product_serial_numbers)
    return 'ok'


if __name__ == '__main__':
    db.engine.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME};")
    db.create_all()
    app.run(debug=True)
