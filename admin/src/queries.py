"""Module, where all query templates are constructed"""
from sqlalchemy import func, update, delete, join, select, and_, between, or_, outerjoin, case
from admin.src.models import (db,
                              Products,
                              Businesses,
                              Orders,
                              SpecificOrders,
                              ProductsMovementHistory,
                              CriticalLevels)
from sqlalchemy.orm import aliased
from datetime import datetime
from sqlalchemy.sql import text


def client_supplier_query(order_id: int) -> Products:
    """Return query for get inforamtions about sides in order."""

    Clients = aliased(Businesses)
    Suppliers = aliased(Businesses)
    ClientSupplier = join(Orders, Clients, Orders.client_name == Clients.name)\
        .join(Suppliers, Suppliers.name == Orders.supplier_name)
    query = aliased(select([Clients.name.label("Client"),
                            Suppliers.name.label("Supplier")])
                    .where(Orders.order_id == order_id)
                    .select_from(ClientSupplier))
    return query


def types_query(owner_name):
    """Return query for proucts on storage."""
    query = Products.query.with_entities(Products.type_name.label('Type'))\
        .filter_by(owner_name=owner_name)\
        .distinct()
    return query


def statistics_query(owner_name):
    """Query to describe current storage."""

    """
    WITH p_count AS (
        SELECT
            type_name,
            owner_name,
            COUNT(type_name) product_count
        FROM products
        GROUP BY (owner_name, type_name)
    ),
    """
    p_count = db.session.query(
        Products.type_name,
        Products.owner_name,
        func.count(Products.type_name).label('product_count'),
        func.count(case([
                        (Products.product_condition == True, Products.type_name)
                        ],
                        else_=None
                        )).label('valid')
    )\
        .select_from(Products)\
        .filter(Products.owner_name == owner_name)\
        .group_by(Products.owner_name, Products.type_name)\
        .subquery(name='p_count')
    """
    so AS (
        SELECT
            type_name,
            supplier_name,
            SUM(quantity) ordered
        FROM orders
        JOIN specific_orders USING(order_id)
        GROUP BY (type_name, supplier_name)
    )

    """
    specific_orders = db.session.query(
        SpecificOrders.type_name,
        Orders.supplier_name,
        func.sum(SpecificOrders.quantity).label('ordered')
    )\
        .select_from(Orders)\
        .join(SpecificOrders, Orders.order_id == SpecificOrders.order_id)\
        .filter(Orders.supplier_name == owner_name)\
        .group_by(SpecificOrders.type_name, Orders.supplier_name)\
        .subquery(name='specific_orders')
    """
    SELECT
        owner_name,
        p.type_name,
        so.ordered,
        p.product_count
    FROM p_count p
    LEFT JOIN so ON p.type_name = so.type_name AND p.owner_name = so.supplier_name
    ORDER BY 1
    """
    stats_query = db.session.query(
        p_count.c.owner_name,
        p_count.c.type_name.label('Type'),
        p_count.c.product_count.label('Amount'),
        p_count.c.valid.label('Amount of functional products'),
        (func.coalesce(specific_orders.c.ordered, 0)).label('Ordered amount'),
        CriticalLevels.critical_amount.label('Critical level')
    )\
        .select_entity_from(p_count)\
        .outerjoin(CriticalLevels, and_(CriticalLevels.business == p_count.c.owner_name,
                                        CriticalLevels.type_name == p_count.c.type_name))\
        .outerjoin(specific_orders, and_(p_count.c.type_name == specific_orders.c.type_name,
                                         p_count.c.owner_name == specific_orders.c.supplier_name))\
        .order_by(p_count.c.owner_name)
    return stats_query


def set_critical_level(owner_name, type_name, new_critical_level):
    db.session.query(CriticalLevels).filter(
        and_(
            CriticalLevels.business == owner_name,
            CriticalLevels.type_name == type_name
        ))\
        .update({CriticalLevels.critical_amount: new_critical_level
                 }, synchronize_session=False)

    db.session.commit()


def get_critical_level(owner_name, type_name):
    critical_level = select([
        CriticalLevels.critical_amount
    ])\
        .select_from(CriticalLevels)\
        .where(and_(
            CriticalLevels.business == owner_name,
            CriticalLevels.type_name.in_(type_name),
        )
    )
    return db.session.query(aliased(critical_level))


def expand_type_query(owner_name: str, type_name: []) -> 'session query':
    """Return query, where provide detaled info about available products for this type."""
    critical_level = get_critical_level(owner_name, type_name)

    ordered = db.session.query(
        func.sum(SpecificOrders.quantity).label('number')
    )\
        .join(Orders, Orders.order_id == SpecificOrders.order_id)\
        .filter(
        and_(
            Orders.supplier_name == owner_name,
            SpecificOrders.type_name.in_(type_name)
        )

    )

    query = select([Products.type_name.label('Type'),
                    Products.serial_number.label('Serial number'),
                    Products.producent.label('Producent'),
                    Products.model.label('Model'),
                    Products.product_condition.label('Condition'),
                    Products.additonal_info.label('Additional info'),
                    Products.appear_in_order.label('Bind to order')])\
        .where(
        and_(
            Products.owner_name == owner_name,
            Products.type_name.in_(type_name)
        )
    ).order_by(Products.appear_in_order.asc(),Products.serial_number.asc())
    return db.session.query(aliased(query)), ordered, critical_level


def expand_types_order(owner_name: str, type_name: [], order_id) -> 'session query':
    """Return query, where provide detaled info about available products for this type."""
    query = select([Products.type_name.label('Type'),
                    Products.serial_number.label('Serial number'),
                    Products.producent.label('Producent'),
                    Products.model.label('Model'),
                    Products.product_condition.label('Condition'),
                    Products.additonal_info.label('Additional info'),
                    Products.appear_in_order.label('Bind to order')])\
        .where(
        and_(
            Products.owner_name == owner_name,
            Products.type_name.in_(type_name)
        )
    )
    return db.session.query(aliased(query))


def create_product(new_product, owner_name):
    """Create new product, from provided dict."""
    if not isinstance(new_product, dict):
        raise ValueError(f"New product {new_product} is not a dict")
    new_instance = Products(
        serial_number=new_product['serial_number'],
        type_name=new_product['type_name'],
        owner_name=owner_name,
        product_condition=new_product['product_condition'] == 'true',
        model=new_product['model'],
        producent=new_product['producent'],
        additonal_info=new_product['additional_info'],
    )
    if not get_critical_level(owner_name, [new_product['type_name']]).all():
        new_critical_entry = CriticalLevels(
            business=owner_name,
            type_name=new_product['type_name']
        )
    else:
        new_critical_entry = None
    return new_instance, new_critical_entry


def businesses_query():
    query = db.session.query(
        Businesses.name,
        Businesses.is_service)
    return query


# Fix. Add owner id check
def get_orders_query(history, business_id):
    """
    Create query object to get all orderrs from storage.

    Return Query
    """
    Clients = aliased(Businesses)
    Suppliers = aliased(Businesses)
    query = db.session.query(
        Orders.order_id.label("Order id"),
        Orders.order_date.label("Order date"),
        Clients.name.label("Client"),
        Suppliers.name.label("Supplier"),
        Orders.order_id)\
        .join(Clients, Clients.name == Orders.client_name)\
        .join(Suppliers, Suppliers.name == Orders.supplier_name)\
        .filter(or_(Orders.supplier_name == business_id, Orders.client_name == business_id))
    if not history:
        query = query.filter(Orders.completion_date == None).order_by(
            Orders.order_date.desc())
    else:
        query = db.session.query(
            Orders.completion_date.label("Completion date"),
            Clients.name.label("Client"),
            Suppliers.name.label("Supplier"),
            Orders.order_id)\
            .join(Clients, Clients.name == Orders.client_name)\
            .join(Suppliers, Suppliers.name == Orders.supplier_name)
        query = query.filter(and_(Orders.completion_date != None,
                                  or_(Orders.supplier_name == business_id,
                                      Orders.client_name == business_id)))\
            .order_by(Orders.completion_date.desc())
    return query


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

    """
    SELECT
        b2b.products.type_name AS b2b_products_type_name,
        specific_orders.quantity,
        count(*) AS number,
        count(CASE WHEN (b2b.products.appear_in_order IS NULL) THEN b2b.products.type_name END) AS available_number
    FROM b2b.products
    JOIN b2b.orders ON b2b.orders.order_id = 12
                    AND b2b.orders.supplier_name = b2b.products.owner_name
    JOIN b2b.specific_orders ON b2b.specific_orders.order_id = b2b.orders.order_id
                             AND b2b.specific_orders.type_name = b2b.products.type_name
    GROUP BY (b2b.products.type_name, specific_orders.quantity);
    """
    order_sides = db.session.query(
        Orders.supplier_name.label('Supplier'),
        Orders.client_name.label('Client')
    ).filter(Orders.order_id == order_id)

    # Select for order stats
    order_stats_query = db.session.query(SpecificOrders.type_name.label('Type'),
                                         SpecificOrders.quantity.label(
                                             'Ordered'),
                                         func.count(
        case(
            [
                (and_(Products.appear_in_order == None,
                      Products.product_condition == True),
                 Products.type_name)
            ],
            else_=None
        )
    ).label('Amount of functional'),
        func.count(Products.type_name).label('Amount on warehouse'),
        func.count(
            case(
                [
                    (Products.appear_in_order == order_id, Products.type_name)
                ],
                else_=None
            )
    ).label('Amount of binded')
    )\
        .select_from(Orders)\
        .join(SpecificOrders, SpecificOrders.order_id == Orders.order_id)\
        .join(Products,
              and_(
                  Products.type_name == SpecificOrders.type_name,
                  Orders.supplier_name == Products.owner_name
              ), isouter=True)\
        .filter(Orders.order_id == order_id)\
        .group_by(SpecificOrders.type_name, SpecificOrders.quantity)

    is_service = db.session.query(
        Businesses.is_service
    )\
        .join(Orders, and_(or_(Orders.supplier_name == Businesses.name,
                               Orders.client_name == Businesses.name),
                           Orders.order_id == order_id)).all()

    any_side_of_order_is_service = any(
        [item.is_service for item in is_service])

    available_products_query = db.session.query(
        Products.type_name.label('Type'),
        Products.producent.label('Producent'),
        Products.model.label('Model'),
        Products.serial_number.label('Serial number'),
        Products.appear_in_order.label('Binded to order'),
        Products.product_condition.label('Condition'),
        Products.additonal_info.label('Additional info'),
    )\
        .join(Orders, and_(Orders.order_id == order_id,
                           Orders.supplier_name == Products.owner_name))\
        .join(Businesses, Orders.client_name == Businesses.name)\
        .join(SpecificOrders, and_(
            SpecificOrders.order_id == Orders.order_id,
            SpecificOrders.type_name == Products.type_name
        )
    )\
        .filter(and_(or_(Products.appear_in_order == None,
                         Products.appear_in_order == order_id),
                     or_(Products.product_condition == True,
                         any_side_of_order_is_service)
                     ))\
        .order_by(Products.product_condition, Products.type_name, Products.appear_in_order.asc())

    return order_sides, order_stats_query, available_products_query


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
        update({Products.owner_name: client
                }, synchronize_session=False)
    db.session.commit()


def change_product_condition(serial_numbers):
    if not serial_numbers:
        return

    db.session.query(Products).filter(Products.serial_number.in_(serial_numbers)).\
        update({Products.product_condition: ~ Products.product_condition
                }, synchronize_session=False)
    db.session.commit()


def unbind_from_order(serial_numbers):
    if not serial_numbers:
        return
    db.session.query(Products).filter(Products.serial_number.in_(serial_numbers)).\
        update({Products.appear_in_order: None
                }, synchronize_session=False)
    db.session.commit()


def unbind_all_from_order(order_id):
    db.session.query(Products).filter_by(appear_in_order=order_id).\
        update({Products.appear_in_order: None
                }, synchronize_session=False)
    db.session.commit()


def bind_to_order(order_id, serial_numbers):
    db.session.query(Products).filter(Products.serial_number.in_(serial_numbers)).\
        update({Products.appear_in_order: order_id
                }, synchronize_session=False)
    db.session.commit()


def modify_specific_orders(order_id, order_stats):
    presented_types = db.session.query(SpecificOrders.type_name)\
        .filter(SpecificOrders.order_id == order_id)\
        .all()

    presented_types = [p_type.type_name for p_type in presented_types]
    deleted_types = set(presented_types)
    for p_type, amount in order_stats:
        deleted_types -= set([p_type])
        if p_type in presented_types:
            db.session.query(SpecificOrders).filter(and_(SpecificOrders.type_name == p_type,
                                                         SpecificOrders.order_id == order_id))\
                .update({SpecificOrders.quantity: amount}, synchronize_session=False)
        else:
            new_specific_order = SpecificOrders(
                order_id=order_id,
                quantity=amount,
                type_name=p_type
            )
            db.session.add(new_specific_order)

    for p_type in deleted_types:
        db.session.query(SpecificOrders)\
            .filter(and_(SpecificOrders.type_name == p_type, SpecificOrders.order_id == order_id))\
            .delete()

    db.session.commit()


def add_history_record(order_id, serial_numbers):
    db.session.query(Orders).filter(Orders.order_id == order_id).\
        update({Orders.completion_date: datetime.now()
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
        history_record = ProductsMovementHistory(
            order_id=order_id,
            serial_number=product.serial_number,
            type_name=product.type_name,
            producent=product.producent,
            model=product.model
        )
        db.session.add(history_record)
    db.session.commit()


def expand_history_order_query(order_id):
    OrderDecription = outerjoin(
        Orders, ProductsMovementHistory, Orders.order_id == ProductsMovementHistory.order_id)

    query = select([
        ProductsMovementHistory.type_name.label('Type'),
        ProductsMovementHistory.producent.label('Producent'),
        ProductsMovementHistory.model.label('Model'),
        ProductsMovementHistory.serial_number.label('Serial number'),
        Orders.supplier_name,
        Orders.client_name,
        ProductsMovementHistory.type_name,
        ProductsMovementHistory.serial_number
    ])\
        .select_from(OrderDecription)\
        .where(ProductsMovementHistory.order_id == order_id)\
        .order_by(ProductsMovementHistory.type_name)

    return db.session.query(aliased(query))


def get_models_query():
    """Return query, with all existing models."""
    query = db.session.query(Products.model).distinct()
    return query


def get_producents_query():
    """Return query, on all existing producents."""
    query = db.session.query(Products.producent).distinct()
    return query


