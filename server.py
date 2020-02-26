from cloud_backup import upload_dump
import atexit
from flask import (jsonify, render_template, request)
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, update, delete, join, select, and_
from sqlalchemy.orm import aliased
from config import *
from models import (app, db, Products, Businesses, Orders, SpecificOrders)
from sqlalchemy.sql import text
from datetime import datetime
from queries import (client_supplier_query,
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
                     expand_history_order_query,
                     unbind_from_order,
                     bind_to_order,
                     modify_specific_orders,
                     unbind_all_from_order,
                     expand_type_query_2,
                     set_critical_level
                     )

from sqlalchemy.exc import IntegrityError, OperationalError
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


@app.errorhandler(OperationalError)
def handle_invalid_usage(error):
    response = InvalidUsage(
        message='Потеряно соединение с сервером базы данных')
    response.status_code = 500
    response = response.to_dict()
    return jsonify(response), 400


@app.route('/')
def main():
    return render_template('index.html')


@app.route('/edit_order/id/<int:order_id>/modify_specific_orders', methods=["POST"])
def edit_specific_orders(order_id):
    order_data = request.get_json()
    types = order_data['types'].items()
    modify_specific_orders(order_id, types)
    return 'ok'

# depracated
@app.route('/edit_order/id/<int:order_id>/modify_binded_products', methods=["POST"])
def edit_binded_products(order_id):
    order_data = request.get_json()
    binded_products = order_data['available_products'].keys()
    unbind_all_from_order(order_id)
    bind_to_order(order_id, binded_products)
    return 'ok'

# depracated
@app.route('/edit_order/id/<int:order_id>', methods=["POST"])
def edit_order(order_id):
    order_data = request.get_json()
    binded_products = order_data['binded_products']
    order_stats = order_data['order_types'].items()
    unbinded_products = order_data['unbinded_products']
    unbind_all_from_order(order_id)
    bind_to_order(order_id, binded_products)
    modify_specific_orders(order_id, order_stats)
    return 'ok', 200


@app.route('/mock')
def mock():
    return jsonify(None)

# V Depracated
@app.route('/get_types/id/<string:owner_id>')
def get_types(owner_id):
    available_types = types_query(owner_id).all()
    # result = pack_query_to_dict(available_types)
    available_types = [item._asdict() for item in available_types]
    return jsonify(available_types)

# V
@app.route('/get_statistics/id/<string:owner_id>')
def count_types(owner_id):
    """Return count of products on storage."""
    statistics = statistics_query(owner_id)
    result = db.session.query(statistics).all()
    # result = pack_query_to_dict(result)
    result = [item._asdict() for item in result]
    return jsonify(result)


@app.route('/expand_types/id/<string:owner_id>/types/<string:type_name>')
def get_details_about_type_2(owner_id, type_name):
    types = type_name.split(',')
    products_query, ordered_amount_query, critical_level_query = expand_type_query_2(
        owner_id, types)
    products = products_query.all()
    ordered_amount = ordered_amount_query.first()
    critical_level = critical_level_query.first()
    products = [item._asdict() for item in products]
    result = {
        'available_products': products,
        'type_stats': {'Всего заказов на тип': ordered_amount.number or 0, 'Количество на складе': len(products)},
        'critical_level': critical_level.critical_amount if critical_level else None
    }
    return jsonify(result)


@app.route('/expand_types/id/<string:owner_id>/types/<string:type_name>/for_order/<int:order_id>')
def get_details_about_type(owner_id, type_name, order_id):
    types = type_name.split(',')
    result = expand_type_query(owner_id, types, order_id).all()
    result = [item._asdict() for item in result]
    # result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/modify_critical_level', methods=["POST"])
def modify_cl():
    data = request.get_json()
    owner_id = data['owner']
    type_name = data['type_name']
    amount = data['amount']
    set_critical_level(owner_id, type_name, amount)
    return 'ok', 200


@app.route('/add_items_on_storage/id/<string:owner_id>', methods=['POST'])
def insert_items(owner_id):
    new_product = request.get_json()
    if 'additional_info' not in new_product.keys():
        new_product['additional_info'] = ""
    new_product, new_critical_entry = create_product(new_product, owner_id)
    db.session.add(new_product)
    if new_critical_entry:
        db.session.add(new_critical_entry)
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
        db.session.query(Products).filter(Products.appear_in_order == order_id)\
                  .update({Products.appear_in_order: None}, synchronize_session=False)
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

# Info about existing businesse
# V
@app.route('/info_about_businesses')
def get_info():
    query = businesses_query()
    result = db.session.query(query).all()
    # result = pack_query_to_dict(result)
    result = [item._asdict() for item in result]
    return jsonify(result)

# V
@app.route('/get_orders/<string:business_id>')
def get_orders(business_id):
    history = request.args.get('history')
    result = get_orders_query(history, business_id).all()
    result = [item._asdict() for item in result]
    # result = pack_query_to_dict(result)
    return jsonify(result)


@app.route('/get_orders/from/<string:from_>/to/<string:to>/<string:business_id>')
def orders_in_period(from_, to, business_id):
    history = request.args.get('history')
    query = orders_from_to_query(history, from_, to, business_id)
    result = query.all()
    # result = pack_query_to_dict(result)
    if not result:
        result = None
    else:
        result = [item._asdict() for item in result]
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

# V
@app.route('/sides_in_order/id/<int:order_id>')
def get_order_sides(order_id):
    result = db.session.query(client_supplier_query(order_id)).all()
    # result = pack_query_to_dict(result)
    result = [item._asdict() for item in result]
    return jsonify(result)

# V
@app.route('/expand_history_order/id/<int:order_id>')
def expand_history_order(order_id):
    query = expand_history_order_query(order_id).all()
    order_sides = {'Клиент': query[0].client_id, 'Поставщик': query[0].supplier_id} if len(
        query) > 0 else {}
    order_info = {'available_products': [],
                  'order_stats': [],
                  'order_sides': order_sides}

    products_with_stats = {}
    for item in query:
        if item.type_name not in products_with_stats.keys():
            products_with_stats[item.type_name] = 0

        order_info['available_products'].append(item._asdict())
        products_with_stats[item.type_name] += 1

    order_info['order_stats'] = [{'Тип': i_type, 'Реализовано': amount}
                                 for i_type, amount in products_with_stats.items()]
    print(order_info)
    return jsonify(order_info)

# V
@app.route('/expand_order/id/<int:order_id>')
def expand_order(order_id):
    order_sides, order_stats_query, available_products_query = expand_order_query(
        order_id)
    stats = order_stats_query.all()
    stats = {item.Тип: item._asdict() for item in stats}
    counter = {type_: 0 for type_ in stats.keys()}
    available_products = available_products_query.all()
    assigned_products = []
    for item in available_products:
        if counter[item.Тип] < stats[item.Тип]['Заказано']:
            assigned_products.append(item._asdict())
            counter[item.Тип] += 1
    expanded_order = {
        'order_sides': order_sides.first()._asdict(),
        'order_stats': stats,
        'available_products': assigned_products
    }
    return jsonify(expanded_order)

    # query = expand_order_query(order_id).all()
    # order_sides = {'Клиент': query[0].client_id, 'Поставщик': query[0].supplier_id} if len(
    #     query) > 0 else {}
    # item_info = {'available_products': [],
    #              'order_stats': [],
    #              'order_sides': order_sides
    #              }
    # products_with_stats = {}
    # for row in query:
    #     if row.type_name not in products_with_stats.keys():
    #         item_stats = {
    #             'Тип': row.type_name,
    #             'Заказано': row.quantity,
    #             'Сгенерировано в рамках заказа': row.available_number or 0,
    #             'Всего на складе': row.number or 0,
    #             # 'Останеться': row.number - (row.quantity or 0) if row.number else -row.quantity or 0,
    #         }
    #         item_info['order_stats'].append(item_stats)
    #         # Quantity - number of products ,that should be added to order
    #         # Used, because query returns all products, that satisfy conditions
    #         products_with_stats[row.type_name] = row.quantity
    #     # row.serial_number equviavalent to product existance.
    #     if row.serial_number and (products_with_stats[row.type_name] or 0) > 0:
    #         item_info['available_products'].append(row._asdict())
    #         products_with_stats[row.type_name] -= 1
    #         # item_info['order_stats'][row.type_name]['Останеться'] += 1
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
    unbind_from_order(product_serial_numbers)
    return 'ok'


if __name__ == '__main__':
    from functools import partial
    db.engine.execute(f"CREATE SCHEMA IF NOT EXISTS {SCHEMA_NAME};")
    db.create_all()
    app.run(debug=False)
    atexit.register(partial(
        upload_dump, backup_file_name=f"{DATABASE}_dump", database=DATABASE))
