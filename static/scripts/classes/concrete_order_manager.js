class ConcreteOrderManager extends Section {
    constructor(orderInfoArea,
        productsInOrderArea,
        toolbar,
        orderSidesSection,
        statisticsSection,
        order_description,
        pending_orders) {
        super(
            orderInfoArea,
            productsInOrderArea,
            toolbar)
        this.orderStatisticsSection = statisticsSection
        this.orderSidesSection = orderSidesSection
        this.order_description = order_description
        this.pending_orders = pending_orders

        document.addEventListener(this.order_description.emit, (e) => this.describeCurrentOrder(e.detail))
    }

    describeCurrentOrder(data) {
        createTable(
            data.order_sides,
            null,
            this.orderSidesSection.element,
        )
        createTable(
            data.order_stats,
            null,
            this.orderStatisticsSection.element
        )
        createTable(
            Object.values(data.available_products),
            null,
            this.rightColumn.element,
            false,
            ['supplier_id', 'client_id', 'type_name', 'quantity', 'serial_number', 'number']
        )
    }

    editOrder() {
        let order_id = sessionStorage.getItem('current_order_id')
        orderEditor.show()
    }
    completeOrder() {
        let order_id = sessionStorage.getItem('current_order_id')
        let assignedProductsSerialNumbers = Object.keys(this.order_description.data.available_products)
        let client_id = data_dicts.current_actual_order_description.data.order_sides[0]["Клиент"]
        let data = {
            customer: client_id,
            products: assignedProductsSerialNumbers
        }
        let url = '/complete_order/id/' + order_id
        sendRequest(url, data, "POST").then(_ => {
            data_dicts.current_storage_statistics.is_actual = false
            data_dicts.orders_with_current_storage.is_actual = false
            document.dispatchEvent(data_item_modified)
            orderManager.show()
        })

    }
    deleteOrder() {
        let order_id = sessionStorage.getItem('current_order_id')
        let url = '/delete_order/id/' + order_id
        sendRequest(url, '', "DELETE").then(_ => {
            this.pending_orders.is_actual = false
            document.dispatchEvent(data_item_modified)
        }
        )
    }
}