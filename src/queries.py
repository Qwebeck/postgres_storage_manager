"""Module, where all query templates are constructed"""
from sqlalchemy import func, update, delete, join, select, and_, between, or_, outerjoin
from models import (db,
                    Products,
                    Businesses,
                    Orders,
                    SpecificOrders,
                    ProductsMovement)
from sqlalchemy.orm import aliased
from datetime import datetime
from sqlalchemy.sql import text


def client_supplier_query(order_id):
    """Return query for get inforamtions about sides in order."""
    Clients = aliased(Businesses)
    Suppliers = aliased(Businesses)
    ClientSupplier = join(Orders, Clients, Orders.client_id == Clients.name)\
        .join(Suppliers, Suppliers.name == Orders.supplier_id)
    query = aliased(select([Clients.name.label("Клиент"),
                            Suppliers.name.label("Поставщик")])
                    .where(Orders.order_id == order_id)
                    .select_from(ClientSupplier))
    return query


def types_query(owner_id):
    """Return query for proucts on storage."""
    query = Products.query.with_entities(Products.type_name.label('Тип'))\
        .filter_by(owner_id=owner_id)\
        .distinct()
    return query


def statistics_query(owner_id):
    """Return a query, that get count of each type on storage."""
    query = select([Products.type_name.label('Tип'),
                    func.count(Products.type_name).label('Всего')])\
        .where(Products.owner_id == owner_id)\
        .group_by(Products.type_name)
    return aliased(query)


def expand_type_query(owner_id: str, type_name: []) -> 'session query':
    """Return query, where provide detaled info about available products for this type."""
    query = select([Products.type_name.label('Тип'),
                    Products.serial_number.label('Серийный номер'),
                    Products.producent.label('Изготовитель'),
                    Products.model.label('Модель'),
                    Products.product_condition.label('Состояние'),
                    Products.additonal_info.label('Инфо')])\
        .where(
        and_(
            Products.owner_id == owner_id,
            Products.type_name.in_(type_name)
        )
    )
    return db.session.query(aliased(query))


def create_product(new_product, owner_id):
    """Create new product, from provided dict."""
    if not isinstance(new_product, dict):
        raise ValueError(f"New product {new_product} is not a dict")
    new_product = Products(
        serial_number=new_product['serial_number'],
        type_name=new_product['type_name'],
        owner_id=owner_id,
        product_condition=bool(new_product['product_condition']),
        model=new_product['model'],
        producent=new_product['producent'],
        additonal_info=new_product['additional_info']
    )
    return new_product


def businesses_query():
    query = select(
        [Businesses.name.label("name")]
    )
    return aliased(query)


# Fix. Add owner id check
def get_orders_query(history, business_id):
    """
    Create query object to get all orderrs from storage.

    Return Query
    """
    Clients = aliased(Businesses)
    Suppliers = aliased(Businesses)
    query = db.session.query(
        Orders.order_date.label("Дата заказа"),
        Clients.name.label("Клиент"),
        Suppliers.name.label("Поставщик"),
        Orders.order_id)\
        .join(Clients, Clients.name == Orders.client_id)\
        .join(Suppliers, Suppliers.name == Orders.supplier_id)\
        .filter(or_(Orders.supplier_id == business_id, Orders.client_id == business_id))
    if not history:
        query = query.filter(Orders.completion_date == None).order_by(Orders.order_date.desc())
    else:
        query = db.session.query(
            Orders.completion_date.label("Дата выполнения"),
            Clients.name.label("Клиент"),
            Suppliers.name.label("Поставщик"),
            Orders.order_id)\
            .join(Clients, Clients.name == Orders.client_id)\
            .join(Suppliers, Suppliers.name == Orders.supplier_id)
        query = query.filter(and_(Orders.completion_date != None,
                                  or_(Orders.supplier_id == business_id,
                                      Orders.client_id == business_id)))\
                     .order_by(Orders.completion_date.desc())
    return query


"""
Super query in SQL
WITH a AS (
    SELECT type_name, supplier_id, quantity 
    FROM b2b.orders
    JOIN b2b.specific_orders USING (order_id)
    WHERE order_id = 11),
    b as (
        SELECT serial_number, owner_id, quantity,
        ROW_NUMBER()  OVER (
            PARTITION BY a.type_name
        ) r_n,
    COUNT(*) OVER (
            PARTITION BY a.type_name
        ) c
    FROM b2b.products p
    JOIN a ON a.supplier_id = p.owner_id AND a.type_name = p.type_name )
SELECT *, c-quantity  AS "Left" FROM b WHERE r_n <= quantity
"""


def expand_order_query(order_id):
    """Return query object.

       Fieldes:
        type_name,
        quantity,
        serial_number,
        model,
        producent,
        additional_info,
        objects on storage

        Max number of returned rows is 100
     """
    SupplierProducts = outerjoin(Orders, Products, Orders.supplier_id == Products.owner_id)
    print(SupplierProducts)
    count = aliased(
        select([
            Products.type_name,
            func.count().label('number')
        ])
        .select_from(SupplierProducts)
        .where(Orders.order_id == order_id)
        .group_by(Products.type_name))

    ProductsSupplierCanSupply = join(Orders, SpecificOrders, Orders.order_id == SpecificOrders.order_id)\
        .join(Businesses, Orders.supplier_id == Businesses.name)\
        .outerjoin(Products, and_(Products.owner_id == Businesses.name,
                                  Products.type_name == SpecificOrders.type_name))\
        .outerjoin(count, SpecificOrders.type_name == count.c.type_name)

    # column dublicates, that needed because of there usage in server.py
    query = aliased(select([SpecificOrders.type_name.label('Тип'),
                            SpecificOrders.type_name,
                            SpecificOrders.quantity,
                            Products.serial_number,
                            Products.serial_number.label('Серийный номер'),
                            Products.model.label('Модель'),
                            Products.producent.label('Производитель'),
                            Products.additonal_info.label(
                                'Дополнительная информация'),
                            count.c.number])
                    .select_from(ProductsSupplierCanSupply).where(and_(Orders.order_id == order_id))
                    .order_by(Products.type_name)
                    .limit(100))
    return db.session.query(query)


def orders_from_to_query(is_history, from_, to, business_id):
    if is_history is None:
        print('here')
        query = get_orders_query(is_history, business_id).filter(
            between(Orders.order_date, from_, to)
        )
    else:
        query = get_orders_query(is_history, business_id).filter(
            between(Orders.completion_date, from_, to)
        )

    return query


def change_owner(client, serial_numbers):
    db.session.query(Products).filter(Products.serial_number.in_(serial_numbers)).\
        update({Products.owner_id: client
                }, synchronize_session=False)
    db.session.commit()


def add_history_record(order_id, serial_numbers):
    db.session.query(Orders).filter(Orders.order_id == order_id).\
        update({Orders.completion_date: datetime.utcnow()
                }, synchronize_session=False)

    db.session.query(SpecificOrders)\
              .filter_by(order_id=order_id)\
              .delete()

    products = db.session.query(Products).filter(
        Products.serial_number.in_(serial_numbers)).all()
    query = aliased(select(
        [
            Products.serial_number,
            Products.type_name,
            Products.producent,
            Products.model
        ]
    )
        .select_from(Products)
        .where(Products.serial_number.in_(serial_numbers)))
    products = db.session.query(query)
    for product in products:
        history_record = ProductsMovement(
            order_id=order_id,
            serial_number=product.serial_number,
            type_name=product.type_name,
            producent=product.producent,
            model=product.model
        )
        db.session.add(history_record)
    db.session.commit()


def expand_history_order_query(order_id):
    query = select([ProductsMovement.serial_number.label('Серийный номер'),
                    ProductsMovement.type_name.label('Тип'),
                    ProductsMovement.producent.label('Производитель'),
                    ProductsMovement.model.label('Модель'),
                    ])\
        .select_from(ProductsMovement)\
        .where(ProductsMovement.order_id == order_id)

    return db.session.query(aliased(query))
