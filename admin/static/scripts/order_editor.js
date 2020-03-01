class OrderEditor extends Section {
    constructor(orderInfoArea,
        availableProductsArea,
        toolbar,
        order_description) {
        super(
            orderInfoArea,
            availableProductsArea,
            toolbar)
        this.order_description = order_description
        this.available_products_for_assigment = {}
        this.specific_order_section = sections.order_editing_specific_order_section.element
    }

    show() {
        waitingAnimation(true)
        let active_storage = sessionStorage.getItem('active_storage')
        let current_order_id = sessionStorage.getItem('current_order_id')
        let order_types = Object.keys(this.order_description.data.order_types)
        let url = '/expand_types/id/' + active_storage + '/types/' + order_types.join(',') + '/for_order/' + current_order_id
        let getFreeProductsOnStorage = sendRequest(url, '', 'GET')
        getFreeProductsOnStorage.then(data => {
            this.available_products_for_assigment = convertToObject("Серийный номер", data)
            this.createLayoutForSpecificOrderEditing()
            createTable(data,
                this.markAssigned,
                this.rightColumn.element)
            waitingAnimation(false)
        })
        super.show()
    }

    toggleAssigment(e) {
        this.order_description.is_actual = false
        var current_order = this.order_description.data
        var serial_number = e.target.value
        var current_order_products = current_order.binded_products
        var is_assigned = current_order_products.has(serial_number)

        if (is_assigned) {
            e.target.innerHTML = "Привязать"
            current_order_products.delete(serial_number)
            current_order.unbinded_products.add(serial_number)
            e.target.parentElement.className = ""
        }
        else {
            current_order.unbinded_products.delete(serial_number)
            e.target.innerHTML = "Отвязать"
            current_order_products.add(serial_number)
            e.target.parentElement.className = "assigned"
        }
    }

    addDeleteBtn(select, quantity_input, container, type, number) {
        let delete_btns = container.querySelectorAll(".action-button")
        if(delete_btns.length) return
        if (type && select) select.value = type
        if (number && quantity_input) quantity_input.value = number
        if (!type) return
        let button = createElement('button', { 'class': 'action-button', 'value': type, 'innerHTML': 'Удалить' })
        button.onclick = (e) => this.deleteSpecificOrder(e)
        container.appendChild(button)
    }


    createLayoutForSpecificOrderEditing() {
        for (let [type, number] of Object.entries(this.order_description.data.order_types)) {
            addProductField(this.specific_order_section,
                (select, quantity_input, container) => this.addDeleteBtn(select, quantity_input, container, type, number),
                1,
                (e) => this.orderParamsChanged(e))
        }

        addProductField(this.specific_order_section,
            (type_input, num_input, container) => this.addDeleteBtn(type_input, num_input, container),
            2,
            (e) => this.orderParamsChanged(e))
    }

    deleteSpecificOrder(e) {
        e.preventDefault()
        e.target.parentElement.remove()
        delete this.order_description.data.order_types[e.target.value]
        // delete this.order_description.data.order_stats[e.target.value]
        data_dicts.current_storage_statistics.is_actual = false
        this.order_description.is_actual = false
    }

    markAssigned(data, _, element) {
        var current_order_id = sessionStorage.getItem('current_order_id')
        var is_assigned = data['Привязан к заказу']
        var is_assigned_to_current = is_assigned && data['Привязан к заказу'] == current_order_id 
        var action_name = "Привязать"
        if (is_assigned_to_current) {
            element.className = "assigned"
            var action_name = "Отвязать"
            data_dicts.current_actual_order_description.data.binded_products.add(data["Серийный номер"])
        }
        else if(is_assigned){
            element.className = "assigned_to_other"
        }
        // find another solution
        createActionButton(data, element, 'Серийный номер', action_name, (e) => orderEditor.toggleAssigment(e))
    }

    orderParamsChanged(e) {
        this.order_description.is_actual = false
        // 
        data_dicts.current_storage_statistics.is_actual = false

        var q_input = e.target
        var new_quantity = parseInt(e.target.value)
        var parent = q_input.parentElement
        var type_input = parent.querySelector("[name=product_type]")
        var modified_type = type_input.value
        if (!modified_type) {
            alert('Укажите тип')
            return
        }
        this.order_description.data.order_types[modified_type] = new_quantity
        this.addDeleteBtn(null,q_input,parent,q_input.value)
        addProductField(this.specific_order_section,
            null,
            2,
            (e) => this.orderParamsChanged(e))
    }
    saveModifiedOrder(e){
        this.order_description.is_actual = false
        let order_id = sessionStorage.getItem("current_order_id")
        var url = "/edit_order/id/" + order_id
        let tmp = this.order_description.pack()
        waitingAnimation(true)
        sendRequest(url, tmp, "POST").then(
            _ => {
                document.dispatchEvent(data_item_modified)
                concreteOrderManager.show()
                waitingAnimation(false)
            }
        )
    }
}