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
    }

    checkForWarnings(data, type) {
        this.alert_area.hide()
        let critical_level = data.critical_level
        let amount_on_st = data.type_stats['Количество на складе']
        let ordered_amount = data.type_stats['Всего заказов на тип']
        if (amount_on_st < critical_level) {
            let am_alert = createElement('div', { 'class': 'alert alert-critical', 'innerHTML': `Количество ${type} меньше критического уровня. Не хватает ${critical_level - amount_on_st} ${type}ов` })
            // Fix me
            this.alert_area.element.appendChild(am_alert)
        }
        else if (amount_on_st - ordered_amount < critical_level) {
            let am_alert = createElement('div', { 'class': 'alert alert-warning', 'innerHTML': `Количество ${type} будет меньше критического уровня после реализации всех заказов. Не хватает ${critical_level - amount_on_st + ordered_amount} ${type}ов` })
            // Fix me
            this.alert_area.element.appendChild(am_alert)
        }
    }

    update(type) {
        this.current_type = type
        let storage_id = sessionStorage.getItem('active_storage')
        let url = '/expand_types/id/' + storage_id + '/types/' + type
        let query = sendRequest(url, "", "GET")
        query.then(data => {
            forms.type_critical_level.element.new_cl.value = data.critical_level
            this.checkForWarnings(data, type)
            this.current_type_data = data

            updateHeaders('type_name', () => type)
            let available_products = data.available_products
            let type_stats = [data.type_stats]

            createTable(available_products,
                (row_info, _, rowNode) =>
                    createActionButton(row_info,
                        rowNode,
                        "Серийный номер",
                        "Удалить",
                        this.deleteProduct),
                this.rightColumn.element
            )

            createTable(type_stats,
                null,
                sections.expanded_type_stats_section.element)
        })
    }

    setCriticalLevel(e) {
        e.preventDefault()
        let form = e.target
        let url = '/modify_critical_level'
        // Fix me
        let amount = form.new_cl.value
        let data = {
            owner: sessionStorage.getItem('active_storage'),
            type_name: this.current_type,
            amount: amount
        }
        sendRequest(url, data, "POST").then(_ => {
            this.current_type_data.critical_level = amount
            this.checkForWarnings(this.current_type_data, this.current_type)
        }
        )
    }

    deleteProduct(e) {
        let serial_number = e.target.value;
        let url = '/delete_product'
        let data = {
            'serial_number': serial_number
        }
        let post = sendRequest(url, data, "DELETE")
        e.target.parentElement.remove()
        post.then(_ => {
            productTypeManager.current_storage_stats.is_actual = false
        })
    }

    hide() {
        super.hide()
        document.dispatchEvent(data_item_modified)
    }
}


