class OrderManager extends Section {
    constructor(productAddingArea,
        ordersDiplayArea,
        toolbar,
        pending_orders,
        order_sides,
        order_description) {
        super(
            productAddingArea,
            ordersDiplayArea,
            toolbar)
        this.pending_orders = pending_orders
        this.order_sides = order_sides 
        this.order_description = order_description 


        document.addEventListener('pending_orders_update', poUpdate)
    }

    pendingOrdersUpdate(data) {
        createTable(
            data,
            (row_info, _, rowNode) =>
                createActionButton(row_info,
                    rowNode,
                    "Ид заказа",
                    "Подробнее",
                    expandForOrder),
            this.rightColumn.element,
            false,
            ['order_id']
        )
    }
    /**Change here, because this. refers to button */
    expandForOrder(order_id){
        sessionStorage.setItem('current_order_id', order_id)
        this.order_sides.is_actual = false
        this.order_description.is_actual = false
        document.dispatchEvent(data_item_modified)
    }
}

function poUpdate(e){
    orderManager.pendingOrdersUpdate(e.detail)
}

function expandForOrder(e){
    let order_id = e.target.value
    orderManager.expandForOrder(order_id)
}