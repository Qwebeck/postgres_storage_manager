class ProductTypeManager extends Section {
    constructor(productManagingArea,
        productsArea,
        toolbar,
        current_storage_stats) {
        super(
            productManagingArea,
            productsArea,
            toolbar)
        this.current_storage_stats = current_storage_stats
        this.alert_area = sections.product_alert_section
        this.current_type = null
        this.current_type_data = null
        this.products_change = {}
        this.unbind_from_order_buttons = []
    }

    checkForWarnings(data, type) {
        this.alert_area.hide()
        let critical_level = data.critical_level
        let amount_on_st = data.type_stats['Amount of functional']
        let ordered_amount = data.type_stats['Total ordered amount']
        if (amount_on_st < critical_level && ordered_amount == 0) {
            let am_alert = createElement('div', { 'class': 'alert alert-critical', 'innerHTML': `Amount of functional ${type}s is lower then critical level. You need ${critical_level - amount_on_st} more ${type}s` })

            this.alert_area.element.appendChild(am_alert)
        }
        else if (amount_on_st - ordered_amount < critical_level) {
            let am_alert = createElement('div', { 'class': 'alert alert-warning', 'innerHTML': `Amount of functional ${type}s will be lower then criticall level after all orders completion. You need ${critical_level - (amount_on_st - ordered_amount)} more ${type}s` })

            this.alert_area.element.appendChild(am_alert)
        }
    }

    update(type) {
        this.current_type = type
        let storage_id = sessionStorage.getItem('active_storage')
        let url = '/expand_types/id/' + storage_id + '/types/' + type
        waitingAnimation(true)
        let query = sendRequest(url, "", "GET")
        query.then(data => {
            waitingAnimation(false)
            forms.type_critical_level.element.new_cl.value = data.critical_level
            this.checkForWarnings(data, type)
            this.current_type_data = data

            updateHeaders('type_name', () => type)
            let available_products = data.available_products
            let type_stats = [data.type_stats]

            createTable(available_products,
                (row_info, _, rowNode) => {
                    let actions = {
                        'unbind': {
                            'accessKey': "Serial number",
                            'callback': (e) => this.changeCondition(e.target, 'unbind', 'assigned_to_other', 'Cancell order unbinding'),
                            'actionName': "Unbind from order",
                            'predicate': (rowInfo) => rowInfo["Bind to order"]
                        },
                        'change_state': {
                            'accessKey': "Serial number",
                            'callback': (e) => this.changeCondition(e.target, 'change_condition', 'assigned', "Cancell condition change"),
                            'actionName': "Mark for condition change"
                        },
                        'delete': {
                            'accessKey': "Serial number",
                            'callback': (e) => this.deleteProduct(e.target),
                            'actionName': "Delete"
                        }
                    }
                    createDropdownList(row_info, rowNode, actions)
                },
                this.rightColumn.element
            )

            createTable(type_stats,
                null,
                sections.expanded_type_stats_section.element)
        })
    }

    /**
     * Mark product as product, that should change it's condition
     * @param {Element} button Pressed button 
     * @param {string} changeName Key that indicates what should happend with this product
     * @param {string} className Classname, that will be assigned to row with product after change this change
     * @param {string} newName Text that will appear on button after change
     */
    changeCondition(button, changeName, className, newName = null) {
        let serial_number = button.value
        if (changeName in this.products_change) this.products_change[changeName].push(serial_number)
        else this.products_change[changeName] = [serial_number]
        getContainingRow(button).className = className
        let standardName = button.innerHTML
        button.onclick = (e) => this.cancellChange(e.target, changeName, className, standardName)
        if (newName) button.innerHTML = newName
    }

    cancellChange(button, changeName, className, standardName) {
        let serial_number = button.value
        let serial_number_index = this.products_change[changeName].indexOf(serial_number)
        delete this.products_change[changeName][serial_number_index]
        let alternativeName = button.innerHTML
        button.onclick = (e) => this.changeCondition(e.target, changeName, className, alternativeName)
        button.innerHTML = standardName

        getContainingRow(button).className = getContainingRow(button).className.replace(className, "")
    }

    setCriticalLevel(e) {
        e.preventDefault()
        let form = e.target
        let url = '/modify_critical_level'

        let amount = form.new_cl.value
        let data = {
            owner: sessionStorage.getItem('active_storage'),
            type_name: this.current_type,
            amount: amount
        }
        sendRequest(url, data, "POST").then(_ => {
            productTypeManager.current_storage_stats.is_actual = false
            this.current_type_data.critical_level = amount
            this.checkForWarnings(this.current_type_data, this.current_type)
        }
        )
    }
    /**
     * Replace with method, which will be called only on hide
     * @param {*} e 
     */
    deleteProduct(button) {
        let serial_number = button.value;
        let url = '/delete_product'
        let data = {
            'serial_number': serial_number
        }
        let post = sendRequest(url, data, "DELETE")
        getContainingRow(button).remove()
        post.then(_ => {
            productTypeManager.current_storage_stats.is_actual = false
        })
    }

    applyChanges() {
        if (Object.values(this.products_change)) {
            waitingAnimation(true)
            let url = "/change_products_state"
            data_dicts.current_storage_statistics.is_actual = false
            sendRequest(url, this.products_change, "POST").then(
                (_) => {
                    this.products_change = {}
                    this.update(this.current_type)
                }
            )
        }
    }

    hide() {
        super.hide()
        document.dispatchEvent(data_item_modified)
    }
}


