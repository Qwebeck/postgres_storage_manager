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
        this.current_type = null
    }
    update(type) {
        this.current_type = type
        let storage_id = sessionStorage.getItem('active_storage')
        let url = '/expand_types/id/' + storage_id + '/types/' + type
        let query = sendRequest(url, "", "GET")
        query.then(data => {
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

    setCriticalLevel(e){
        e.preventDefault()
        let form = e.target
        let url = '/modify_critical_level'
        let data = {
            owner: sessionStorage.getItem('active_storage'),
            type_name: this.current_type,
            amount: form.new_cl.value
        }
        sendRequest(url, data, "POST")
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


