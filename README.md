# Short description
The application is designed to simplify the administration of a large network of warehouses with technical goods. It is designed to provide the user with information about the movement of his products, how many goods need to be delivered to other warehouses in the network and what goods are in these warehouses. The functionality is described in more details below.
# Technical overview
The application was written as a browser client, that provides access to a database in the cloud. 
The database was designed to provide information about such things as the number of products in the warehouse, product condition,
active orders, completed orders, product critical level. Script for database creation was written using SqlAlchemy, so it will be compatible with: MySql, PostgreSQL, Oracle, Microsoft SQL Server, SQLite engines. Relational entity diagram for database looks as follows:
![Database diagram](/images/db_diagram.png)
Database diagram

# How to run
Recommended browser is Firefox 68.4.1.
To run the application clone it to your local machine, install all dependecies with command `pip install -r requirements.txt` and execute script `db_admin.py` with command `python db_admin.py`.

# Functionality
## Save information about products on warehouse
The application allows you to view statistics about goods in stock. It allows you to see such things as the total number, number of ordered products, number of broken, assigned critical levels.
The critical level is a configurable parameter that serves to notify the user if the number of items in stock is not enough to complete all orders.
In the image below, we see this situation for headphones, iphones and laptops.

![Products overview](/images/products_overview.png)
Products overview

## Add and monitor orders from your clients
You can add and monitor orders related to your warehouse. 
You are adding orders by providing a number of products of each ordered type and client name in the left column. After that record will appear in the right column, with a brief description, needed to identify this order among others. 
Each order from the right column can be expanded. This action will cause the program to try to generate the goods needed to fulfill the order from the goods available in the warehouse and offer this solution to you. 

It is important to note that such an action does not cause products to be bound to the order, but only generates a possible set for its completion.  
Also database will inform you in case if there will be not enough products to complete as order.
![Order creation](/images/order_creation.png)
Order creation and overview
![Order creation](/images/notification.png)
Informing you about required products 




## Edit your orders
Each order is also could be changed. During this procedure, you can add a specific type to the order, increase the number of already ordered products, as well as link a specific product to that order. Such binding will result in the product not appearing in the list of offered products when other orders are automatically generated. 
![Order editing](/images/order_editing.png)
Order editing

## Manage your products
You can unbind products from orders, to which they were bound and toggle condition of these products from functional to broken and otherwise.
![Product managment](/images/product_managment_overview.png)
Product managment

## Complete your orders
Orders that can be fulfilled. Such action will move the goods from the current warehouse to the customer's warehouse (you can switch to it from the tab `Work with warehouse` by entering the customer's name and clicking the button `go to`). The record of the order itself will be moved to the history, that will be visible only to the customer and the client.

![Before](/images/before.jpg)
Before order
![During](/images/during.png)
During order
![After](/images/after.png)
After order
