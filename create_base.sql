BEGIN;
CREATE SCHEMA b2b;

CREATE DOMAIN condition AS varchar(10)
CONSTRAINT check_product_condition CHECK (VALUE IN ('исправное','плохое','удовлетворительное'));
-- TODO Add user defined types
CREATE DOMAIN product_name AS varchar(30)
CONSTRAINT check_product_name CHECK (VALUE IN ('ipad','смартфон','ноутбук','принтер'));

CREATE TABLE b2b.businesses(
        id    serial PRIMARY KEY,
        location       varchar(30),
        is_supplier    boolean DEFAULT FALSE,
        is_client      boolean DEFAULT TRUE,
        business_name  varchar(30)
);

CREATE TABLE b2b.orders(
        order_id    serial PRIMARY KEY,
        order_date  date DEFAULT CURRENT_DATE,
        details     varchar(30),
        client_id   integer REFERENCES b2b.businesses(business_id) NOT NULL,
        supplier_id integer REFERENCES b2b.businesses(business_id) NOT NULL,
        CONSTRAINT  different_businesses CHECK (client_id != supplier_id)
);

CREATE TABLE b2b.shippings(
        order_id     integer REFERENCES b2b.orders(order_id) NOT NULL,
        send_data    date
);

CREATE TABLE b2b.product_types(
        type_name  product_name,
        owner_id   integer, 
        quantity   integer DEFAULT 0,
        CONSTRAINT pk PRIMARY KEY (type_name, owner_id),
        CONSTRAINT fk FOREIGN KEY(owner_id) REFERENCES b2b.businesses(business_id) ON DELETE CASCADE
);

CREATE TABLE b2b.products(
        serial_number     varchar(20) PRIMARY KEY,
        type_name         product_name     NOT NULL,
        owner_id          integer     NOT NULL,
        product_condition condition,
        model             varchar(10),     
        cable             boolean,
        cartridge         boolean,
        cover             boolean,
        software          boolean,
        charger           boolean,
        additional_info   varchar(50),
        CONSTRAINT fk FOREIGN KEY (type_name, owner_id) REFERENCES b2b.product_types(type_name, owner_id)
);

CREATE TABLE b2b.specific_orders(
        global_order_id integer REFERENCES b2b.orders(order_id) NOT NULL,
        quantity        integer DEFAULT 1,
        type_name       product_name,
        supplier_id     integer,
        CONSTRAINT fk FOREIGN KEY (type_name, supplier_id) REFERENCES b2b.product_types(type_name, owner_id)
);

CREATE VIEW b2b.printers 
AS SELECT product_condition, serial_number, owner_id, model, cartridge, software, additional_info FROM b2b.products;

CREATE VIEW b2b.ipads AS 
SELECT product_condition, serial_number, owner_id, model, charger, cover, additional_info FROM b2b.products;

CREATE FUNCTION b2b.increase_product_number()
RETURNS TRIGGER AS 
$$
begin
   update b2b.product_types set quantity = quantity + 1
   where  type_name = new.type_name and owner_id = new.owner_id;
return null;
end;
$$
language plpgsql;

CREATE FUNCTION b2b.decrease_product_number()
RETURNS TRIGGER AS 
$$
begin
   update b2b.product_types set quantity = quantity - 1
   where  type_name = old.type_name and owner_id = old.owner_id;
return null;
end;
$$
language plpgsql;

CREATE FUNCTION b2b.check_if_enough_products()
RETURNS TRIGGER AS 
$$
declare 
  req integer;
  on_st integer;
begin
   SELECT INTO req new.quantity;
   SELECT INTO on_st quantity FROM product_types 
   WHERE type_name = new.type_name AND owner_id = new.supplier_id; 
   if (on_st - req) < 0 then raise notice 'Not enough %. on storage.', new.type_name;
   end if;
return null;
end;
$$
language plpgsql;


CREATE TRIGGER check_storage AFTER INSERT ON b2b.specific_orders
FOR EACH ROW EXECUTE PROCEDURE b2b.check_if_enough_products();


CREATE TRIGGER incr_products_nr AFTER DELETE ON b2b.products
FOR EACH ROW EXECUTE PROCEDURE b2b.decrease_product_number();

CREATE TRIGGER decr_products_nr AFTER INSERT ON b2b.products
FOR EACH ROW EXECUTE PROCEDURE b2b.increase_product_number();

COMMIT;



