class OrderManager extends Section {
    constructor(productAddingArea,
        ordersDiplayArea,
        toolbar,
        history_section,
        order_modification_section,
        pending_orders,
        order_sides,
        order_description,
        concrete_order_manager) {
        super(
            productAddingArea,
            ordersDiplayArea,
            toolbar)
        this.history_area = history_section 
        this.order_creation_area = order_modification_section

        this.pending_orders = pending_orders
        this.order_description = order_description
        this.concrete_order_manager = concrete_order_manager

        // this.order_expand_handler = (e) => this.expandForOrder(e.target.value)
        this.current_layout = this.order_creation_area

        document.addEventListener('pending_orders_update',(e) =>  this.pendingOrdersUpdate(e.detail))
    }
        
    pendingOrdersUpdate(data) {
        createTable(
            data,
            (row_info, _, rowNode) =>
                createActionButton(row_info,
                    rowNode,
                    'order_id',
                    'Подробнее',
                    (e) => this.expandForOrder(e.target.value)),
            this.rightColumn.element,
            false,
            ['order_id']
        )
    }
    show(){
        super.show()
        this.current_layout.show()
    }
    expandForOrder(order_id){
        sessionStorage.setItem('current_order_id', order_id)
        this.order_description.is_actual = false
        this.concrete_order_manager.show()
        document.dispatchEvent(data_item_modified)
    }
    
    addOrder(e){
        const toDict = elements => [].reduce.call(elements, (data, element) => {
            let type = element.querySelector('[name="product_type"]').value
            let number = element.querySelector('[name="number"]').value    
            let el = {
                'type': type,
                'number': number
            }
            data[type] = el
            return data
        }, {})
        e.preventDefault()
        let active_storage = sessionStorage.getItem('active_storage')
        let form = e.target
        let order_types = document.getElementsByName('product_order')
        let specific_orders = toDict(order_types)
        specific_orders['supplier_id'] = active_storage
        specific_orders['client_id'] = form.clients_ids.value
        if (!validateOrderForm(form)) return
        var url = '/add_order'
        var addOrder = sendRequest(url, specific_orders, "POST")
        waitingAnimation(true)
        addOrder.then(_ => {
            this.pending_orders.is_actual = false
            document.dispatchEvent(data_item_modified)
        })
        .catch(console.error)
        this.show()
    }

    switchMode(){
        this.current_layout.hide()
        if(this.current_layout === this.history_area) this.current_layout = this.order_creation_area
        else this.current_layout = this.history_area
        this.current_layout.show()
    }

    toggleOrders(e){
        let history_checkbox = e.target
        sessionStorage.setItem('is_history', history_checkbox.checked)
        this.pending_orders.is_actual = false
        this.switchMode()
        document.dispatchEvent(data_item_modified)
    }

    showForPeriod(e){
        e.preventDefault()
        this.pending_orders.is_actual = false
        document.dispatchEvent(data_item_modified)        
    }
}




