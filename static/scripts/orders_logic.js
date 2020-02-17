/**
 * Order reborn option
 */

/**
 * Package, describe logic for oredrs. Such as sending requests, 
 * editing order, creating order configuration, etc.
 */

/**
 * Global variable, that columns not to append to created table 
 */
const order_ignore_columns = ['order_id']

/**
 * Function reads information from fields, creates data dict
 * and send information to server
 * @package orders_logic
 * @param e - onclick event on submission button
 */
function addOrder(e) {
    const toDict = elements => [].reduce.call(elements, (data, element) => {
        // console.log(elements)
        type = element.querySelector('[name="product_type"]').value
        number = element.querySelector('[name="number"]').value

        el = {
            'type': type,
            'number': number
        }
        data[type] = el
        return data
    }, {})
    e.preventDefault()
    order_types = document.getElementsByName('product_order')
    specific_orders = toDict(order_types)
    specific_orders['supplier_id'] = e.target.suppliers_ids.value
    specific_orders['client_id'] = e.target.clients_ids.value
    if (!validateOrderForm(e.target)) return
    url = '/add_order'
    req = sendRequest(url, specific_orders, "POST")
    waitingAnimation(true)
    req.then(_ => {
        setModifiedFlagOnItem(sessionStorage, 'pending_orders')
        returnToDefaultChildNumber(containers_and_elements.specific_orders_container)
        updateOrdersInfo(false)
        waitingAnimation(false)
    })
        .catch(console.error)
    containers_and_elements.client_select_in_orders.className = ""
    containers_and_elements.supplier_select_in_orders.className = ""
    e.target.reset()
}

function saveOrder(e) {
    e.target.innerHTML = "Изменить"
    e.target.onclick = editOrder
    disableEditing()
    // returnToDefaultChildNumber(containers_and_elements.order_modification_specific_order_section, 0)
    // activateActionButtons([action_buttons.complete_order_btn, 
    //                        action_buttons.delete_order_btn])
    // deactivateActionButtons([action_buttons.save_new_specific_orders_btn,
    //                         action_buttons.save_binded_products_btn,
    //                         action_buttons.disable_editing_btn])
    // switchSection(containers_and_elements.order_modification_section, 
    //              containers_and_elements.order_statistics_section)
    var current_order_data = getItemFromStorage(sessionStorage, 'current_order')
    /**
     * Here should be creation of table with order sides
     */

    if (data_dicts.current_order_description.is_modified == true) {
        var order_id = sessionStorage.getItem("current_order_id")
        var url = "/edit_order/id/" + order_id
        console.log('Sending ', data_dicts.current_order_description.data)
        sendRequest(url, data_dicts.current_order_description.pack(), "POST").then(
            _ => {
                document.dispatchEvent(data_item_modified)
            }
        )
    } else {
        createTable(Object.values(data_dicts.current_order_description.data.available_products),
            null,
            containers_and_elements.output_section,
            false,
            ['type_name', 'quantity', 'serial_number', 'number'])

        createTable(Object.values(data_dicts.current_order_description.data.order_stats),
            null,
            containers_and_elements.order_statistics_section)

    }
}
function editOrder(e) {
    waitingAnimation(true)
    e.target.innerHTML = "Сохранить всё"
    e.target.onclick = saveOrder
    switchSection(containers_and_elements.order_statistics_section, containers_and_elements.order_modification_section)
    if (containers_and_elements.order_sides_section.firstChild)
        containers_and_elements.order_sides_section.removeChild(containers_and_elements.order_sides_section.firstChild)

    var current_order_data = getItemFromStorage(sessionStorage, 'current_order')
    // var order_types = current_order_data.data.types
    var order_types = Object.keys(data_dicts.current_order_types.data)
    var assigned_products = current_order_data.data.products
    var active_storage_id = sessionStorage.getItem('active_storage')
    var current_order_id = sessionStorage.getItem('current_order_id')
    var url = '/expand_types/id/' + active_storage_id + '/types/' + order_types.join(',') + '/for_order/' + current_order_id
    var data = { 'types': order_types }
    sendRequest(url, data, "GET")
        .then(data => {
            var avaiable_products = convertToObject('Серийный номер', data)
            createLayoutForsSpecificOrderEditing()
            saveItemInStorage(sessionStorage, 'available_products_for_assigment', avaiable_products)
            createTable(data, markAssignedAndAddToggles)
            waitingAnimation(false)
        })

    function createLayoutForsSpecificOrderEditing() {
        // fillSelects([containers_and_elements.available_types_list],
        //     Object.keys(data_dicts.current_order_description.data.order_types))
        for ([type, number] of Object.entries(data_dicts.current_order_description.data.order_types)) {

            addProductField(containers_and_elements.order_modification_specific_order_section,
                (select, quantityInput, container) => {
                    select.value = type
                    quantityInput.value = number
                    button = createElement('button', { 'class': 'action-button', 'value': type, 'innerHTML': 'Удалить' })
                    button.onclick = deleteSpecificOrder
                    container.appendChild(button)
                },
                null,
                orderParamsChanged)
        }
        
        addProductField(containers_and_elements.order_modification_specific_order_section,
            (type_input, _, container) => {
                type_input.onchange = () => {
                    button = createElement('button', { 'class': 'action-button', 'value': type_input.value, 'innerHTML': 'Удалить' })
                    button.onclick = deleteSpecificOrder
                    container.appendChild(button)
                }
            },
            2,
            orderParamsChanged)
        function deleteSpecificOrder(e) {
            e.preventDefault()
            var specific_order = e.target.parentElement
            var container = specific_order.parentElement
            delete data_dicts.current_order_description.data.order_types[e.target.value]
            delete data_dicts.current_order_description.data.order_stats[e.target.value]
            data_dicts.current_order_description.is_modified = true
            container.removeChild(specific_order)
        }
    }

    function markAssignedAndAddToggles(data, _, element) {
        var is_assigned = data['Привязан к заказу']
        // var serial_number = data['Серийный номер']
        var action_name = "Привязать"
        if (is_assigned) {
            element.className = "assigned"
            var action_name = "Отвязать"
        }
        createActionButton(data, element, 'Серийный номер', action_name, toggleAssigment)

    }
    function toggleAssigment(e) {
        data_dicts.current_order_description.is_modified = true
        //  new actual vars
        var current_order = data_dicts.current_order_description.data
        var serial_number = e.target.value
        var available_products_for_assigment = getItemFromStorage(sessionStorage, 'available_products_for_assigment').data
        var current_order_products = current_order.available_products

        // to remove
        // var current_order = getItemFromStorage(sessionStorage, 'current_order')
        // var assigned_products = current_order.data.products
        // 
        var is_assigned = Object.keys(current_order.available_products).includes(serial_number)
        if (is_assigned) {
            e.target.innerHTML = "Привязать"
            delete current_order_products[serial_number]
            current_order.unbinded_products.add(serial_number)
            e.target.parentElement.className = ""
        }
        else {
            current_order.unbinded_products.delete(serial_number)
            e.target.innerHTML = "Отвязать"
            current_order_products[serial_number] = available_products_for_assigment[serial_number]
            e.target.parentElement.className = "assigned"
        }

        // 
        // var is_assigned = Object.keys(assigned_products).includes(serial_number)
        // if (is_assigned) {
        //     e.target.innerHTML = "Привязать"
        //     delete assigned_products[serial_number]
        //     e.target.parentElement.className = ""
        // }
        // else {
        //     e.target.innerHTML = "Отвязать"
        //     assigned_products[serial_number] = available_products_for_assigment[serial_number]
        //     e.target.parentElement.className = "assigned"
        // }
        data = {
            products: current_order.avaiable_products,
            types: Object.keys(current_order.order_stats)
        }
        saveItemInStorage(sessionStorage, 'current_order', data)
    }

    function orderParamsChanged(e) {
        data_dicts.current_order_description.is_modified = true
        var q_input = e.target
        var new_quantity = parseInt(e.target.value)
        var parent = q_input.parentElement
        var modified_type = parent.querySelector("[name=product_type]").value
        if (!modified_type) {
            alert('Укажите тип')
            return
        }
        var type_dict = data_dicts.current_order_description.data.order_stats[modified_type] || {}
        type_dict['Требуеться'] = new_quantity
        data_dicts.current_order_description.data.order_stats[modified_type] = type_dict
        if (!(modified_type in data_dicts.current_order_description.data.order_types)) {
            data_dicts.current_order_description.data.order_types[modified_type] = new_quantity
        } else {
            data_dicts.current_order_description.data.order_types[modified_type] = new_quantity
        }

        addProductField(containers_and_elements.order_modification_specific_order_section, null, 2, orderParamsChanged)
    }
    deactivateActionButtons([action_buttons.complete_order_btn,
    action_buttons.delete_order_btn])
    activateActionButtons([action_buttons.save_new_specific_orders_btn,
    action_buttons.save_binded_products_btn,
    action_buttons.disable_editing_btn])


}

function expandForHistoryOrders(e) {
    waitingAnimation(true)
    containers_and_elements.query_section.style = 'display:block;'
    containers_and_elements.output_section.style = 'width:65%;'
    order_id = e.target.value;
    url = '/expand_history_order/id/' + order_id
    get_sides_url = '/sides_in_order/id/' + order_id
    getOrderSides = sendRequest(get_sides_url, "", "GET")
    getSpecificProducts = sendRequest(url, "", "GET")
    getOrderSides.then(data => {
        
        createTable(data,
            null,
            containers_and_elements.order_sides_section,
            false)
        return getSpecificProducts
    }
    ).then(createLayoutForExpandedObjects)
        .catch(console.error)

    function createLayoutForExpandedObjects(data) {
        createTable(data,
            null,
            containers_and_elements.output_section,
        )
        waitingAnimation(false)
        switchToolbar(false, false)
        switchSection(containers_and_elements.orders_form, containers_and_elements.order_statistics_section)

    }

}

/**
 * @package orders logic
 * Shows detailed info about order 
 * @param {*} e 
 */
function expandForOrders(e = null) {
    if (e) {
        var order_id = e.target.value;
        sessionStorage.setItem('current_order_id', order_id)
        data_dicts.current_order_description.is_modified = true
        updateData()
    } else {
        order_id = sessionStorage.getItem('current_order_id')
    }
    waitingAnimation(true)
    var order_url = '/expand_order/id/' + order_id
    var get_sides_url = '/sides_in_order/id/' + order_id
    var getOrderSides = sendRequest(get_sides_url, "", "GET")
    var getSpecificOrders = sendRequest(order_url, "", "GET")
    getOrderSides.then(data => {
        data_dicts.current_order_sides.data = data
        createTable(data,
            (data_row, _unused1, _unused) => sessionStorage.setItem('customer_id', data_row['Клиент']),
            containers_and_elements.order_sides_section,
            false)
        return getSpecificOrders
    }
    ).then(createLayoutForExpandedObjects)
        .catch(console.error)

    function createLayoutForExpandedObjects(data) {
        /**
         * Executed on each data row, when user decided to expand order
         * @param {{}} data - data in row
         * @param {*} _ 
         * @param {*} _ 
         */

        function saveDataAboutOrder(data, _, _) {
            var current_order = getItemFromStorage(sessionStorage, 'current_order')
            var product_serial = data['Серийный номер']
            var product_type = data['Тип']
            current_order.data['products'][product_serial] = data
            // if (!current_order.data['types'].includes(product_type)) current_order.data['types'].push(product_type)
            saveItemInStorage(sessionStorage, 'current_order', current_order.data)
            if (product_type in data_dicts.current_order_types) {
                data_dicts.current_order_types.data[product_type] += 1
            }
            else {
                data_dicts.current_order_types.data[product_type] = 1
            }

        }
        deactivateActionButtons([action_buttons.save_new_specific_orders_btn,
        action_buttons.save_binded_products_btn,
        action_buttons.disable_editing_btn])
        saveItemInStorage(sessionStorage, 'current_order', { 'products': {}, 'types': [] })
        ignore_columns = ['type_name', 'quantity', 'serial_number', 'number','appear_in_order']
        createTable(data.available_products,
            saveDataAboutOrder,
            containers_and_elements.output_section,
            false,
            ignore_columns)
        createTable(data.order_stats,
            null,
            containers_and_elements.order_statistics_section,
            append = false)
        switchToolbar(containers_and_elements.orders_toolbar, containers_and_elements.order_edit_toolbar)
        switchSection(containers_and_elements.orders_form, containers_and_elements.order_statistics_section)
        assignOrderIdToButtons(order_id)
        waitingAnimation(false)
    }

}


/**
 * Function, to get orders for current storage 
 * @package orders_logic
 * @param {*} callback 
 */
function getOrders(callback) {
    url = createOrderUrl();
    getOrdersInfo = sendRequest(url, "", "GET")
    getOrdersInfo.then(callback)
        .catch(console.error)
}




function showForPeriod(e) {
    e.preventDefault()
    setModifiedFlagOnItem(sessionStorage, 'history')
    updateOrdersInfo(history = true)

}

/**
 * @package orders_logic
 * @param {*} e 
 */
function completeOrder(e) {
    var order_id = e.target.value
    var assignedProducts = getItemFromStorage(sessionStorage, 'current_order').data.products
    assignedProductsSerialNumbers = Object.keys(assignedProducts)
    customer_id = sessionStorage.getItem('customer_id')
    data = {
        customer: customer_id,
        products: assignedProductsSerialNumbers
    }
    setModifiedFlagOnItem(sessionStorage, 'history')
    setModifiedFlagOnItem(sessionStorage, 'pending_orders')
    setModifiedFlagOnItem(sessionStorage, 'storage_stats')
    setModifiedFlagOnItem(sessionStorage, 'types')
    sendRequest('/complete_order/id/' + order_id, data, "POST").then(
        _ => on_work_with_orders()
    )
}

function deleteOrder(e) {
    var order_id = e.target.value
    var url = '/delete_order/id/' + order_id
    sendRequest(url, '', "DELETE").then(
        _ => {
            setModifiedFlagOnItem(sessionStorage, 'pending_orders')
            on_work_with_orders()
        }
    )
}


/**
 * @package orders_logic
 * Clear variables, that for order session.
 */
function clearTemporaryVars() {
    sessionStorage.setItem('customer_id', "")
    saveItemInStorage(sessionStorage, 'serial_numbers_for_current_order', [])
    data_dicts.current_order_types.data = {}
}


function saveSpecificOrders() {
    if (data_dicts.current_order_description.is_modified) {
        var data = { types: data_dicts.current_order_description.data.order_types }
        var order_id = sessionStorage.getItem('current_order_id')
        var url = `/edit_order/id/${order_id}/modify_specific_orders`
        waitingAnimation(true)
        sendRequest(url, data, "POST").then(
            waitingAnimation(false)
        )
    }

}
function saveBindedProducts() {
    if (data_dicts.current_order_description.is_modified) {
        var data = { available_products: data_dicts.current_order_description.data.available_products }
        var order_id = sessionStorage.getItem('current_order_id')
        var url = `/edit_order/id/${order_id}/modify_binded_products`
        waitingAnimation(true)
        sendRequest(url, data, "POST").then(
            waitingAnimation(false)
        )
    }
}
function disableEditing() {
    var order_sides = data_dicts.current_order_sides.data
    createTable(order_sides,
        null,
        containers_and_elements.order_sides_section,
        false)

    returnToDefaultChildNumber(containers_and_elements.order_modification_specific_order_section, 0)
    activateActionButtons([action_buttons.complete_order_btn,
    action_buttons.delete_order_btn,
    action_buttons.edit_order_btn])
    deactivateActionButtons([action_buttons.save_new_specific_orders_btn,
    action_buttons.save_binded_products_btn,
    action_buttons.disable_editing_btn])
    switchSection(containers_and_elements.order_modification_section,
        containers_and_elements.order_statistics_section)

}