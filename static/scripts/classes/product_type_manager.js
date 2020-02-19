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
    }
    update(type) {
        let storage_id = sessionStorage.getItem('active_storage')
        let url = '/expand_types/id/' + storage_id + '/types/' + type
        let query = sendRequest(url, "", "GET")
        query.then(data => createTable(data,
            (row_info, _, rowNode) =>
                createActionButton(row_info,
                    rowNode,
                    "Серийный номер",
                    "Удалить",
                    this.deleteProduct),
            this.rightColumn.element
        ))
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

    hide(){
        super.hide()
        document.dispatchEvent(data_item_modified)
    }
}


