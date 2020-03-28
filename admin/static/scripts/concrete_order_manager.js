/**
 * @module ConcreteManager Contains functions that allows user to manage one concrete order. 
 */
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
        this.actual_order_toolbar = toolbar
        this.alert_area = sections.order_alert_section

        document.addEventListener(this.order_description.emit, (e) => this.describeCurrentOrder(e.detail))
    }
    show(){
        this.enterProperMode()
        super.show()
    }
    enterProperMode(){
        let is_history = JSON.parse(sessionStorage.getItem('is_history'))
        this.toolbar = is_history ? null : this.actual_order_toolbar

    }

    showAlerts(data){
        this.alert_area.hide()
        for(let item of data){
            let type = item['Type']
            let left = ((item['Amount of functional'] + item['Amount of binded']) - item['Ordered'])
            if(left < 0){
                let am_alert = createElement('div', { 'class': 'alert alert-critical', 'innerHTML': `Amount of ${type} is not enough to complete order. You need ${-left} more units of ${type}s` })
                // Fix me
                this.alert_area.element.appendChild(am_alert)
            }
        }

    }

    describeCurrentOrder(data) {
        if(!data) return
        let stats_ignore_columns = []        
        // Fix me
        if(data.order_sides[0]['Supplier'] != sessionStorage.getItem('active_storage')) {
            this.actual_order_toolbar.complete_btn.hide()
            stats_ignore_columns =  ['Amount of functional', 'Amount on warehouse']
        }
        else{
            this.showAlerts(data.order_stats)
            this.actual_order_toolbar.complete_btn.show()
        } 
        createTable(
            data.order_sides,
            null,
            this.orderSidesSection.element,
        )
        createTable(
            data.order_stats,
            null,
            this.orderStatisticsSection.element,
            false,
            stats_ignore_columns
        )
        createTable(
            Object.values(data.available_products),
            null,
            this.rightColumn.element,
            false,
            ['supplier_name', 'client_name', 'type_name', 'quantity', 'serial_number', 'number', 'available_number']
        )
    }

    editOrder() {
        orderEditor.show()
    }
    completeOrder() {
        let order_id = sessionStorage.getItem('current_order_id')
        let assignedProductsSerialNumbers = Object.keys(this.order_description.data.available_products)
        let client_id = data_dicts.current_actual_order_description.data.order_sides[0]["Client"]
        let data = {
            customer: client_id,
            products: assignedProductsSerialNumbers
        }
        let url = '/complete_order/id/' + order_id
        sendRequest(url, data, "POST").then(_ => {
            this.update()
            orderManager.show()
        })

    }
    deleteOrder() {
        let order_id = sessionStorage.getItem('current_order_id')
        let url = '/delete_order/id/' + order_id
        sendRequest(url, '', "DELETE").then(_ => {
            this.update()
            orderManager.show()
        }
        )
    }
    update(){
        this.pending_orders.is_actual = false
        data_dicts.current_storage_statistics.is_actual = false
        document.dispatchEvent(data_item_modified)
    
    }
}