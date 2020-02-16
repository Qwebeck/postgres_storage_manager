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
    activateActionButtons([action_buttons.complete_order_btn, action_buttons.delete_order_btn])
    switchSection(containers_and_elements.order_modification_section, containers_and_elements.order_statistics_section)
    var current_order_data = getItemFromStorage(sessionStorage, 'current_order')
    console.log(current_order_data)
    createTable(Object.values(current_order_data.data.products), null)
    data_dicts.current_order_stats.is_modified = true
    document.dispatchEvent(data_item_modified)

}
function editOrder(e) {
    e.target.innerHTML = "Сохранить"
    e.target.onclick = saveOrder
    switchSection(containers_and_elements.order_statistics_section, containers_and_elements.order_modification_section)
    var current_order_data = getItemFromStorage(sessionStorage, 'current_order')
    // var order_types = current_order_data.data.types
    var order_types = Object.keys(data_dicts.current_order_types.data)
    var assigned_products = current_order_data.data.products
    var active_storage_id = sessionStorage.getItem('active_storage')
    var url = '/expand_types/id/' + active_storage_id + '/types/' + order_types.join(',')
    var data = { 'types': order_types }
    sendRequest(url, data, "GET")
        .then(data => {
            var avaiable_products = convertToObject('Серийный номер', data)
            createLayoutForsSpecificOrderEditing()
            saveItemInStorage(sessionStorage, 'available_products_for_assigment', avaiable_products)
            createTable(data, markAssignedAndAddToggles)
        })

    function createLayoutForsSpecificOrderEditing() {
        console.log(data_dicts.current_order_types.data)
        fillSelects([containers_and_elements.available_types_list],
            Object.keys(data_dicts.current_order_types.data))
        for ([type, number] of Object.entries(data_dicts.current_order_types.data)) {

            addProductField(containers_and_elements.order_modification_specific_order_section,
                (select, quantityInput) => {
                    select.value = type
                    quantityInput.value = number
                },
                null)
        }
        addProductField(containers_and_elements.order_modification_specific_order_section, null, 2)
    }

    function markAssignedAndAddToggles(data, _, element) {
        var serial_number = data['Серийный номер']
        var action_name = "Привязать"
        if (Object.keys(assigned_products).includes(serial_number)) {
            element.className = "assigned"
            var action_name = "Отвязать"
        }
        createActionButton(data, element, 'Серийный номер', action_name, toggleAssigment)

    }
    function toggleAssigment(e) {
        var serial_number = e.target.value
        var current_order = getItemFromStorage(sessionStorage, 'current_order')
        var available_products_for_assigment = getItemFromStorage(sessionStorage, 'available_products_for_assigment').data
        var assigned_products = current_order.data.products
        var is_assigned = Object.keys(assigned_products).includes(serial_number)
        if (is_assigned) {
            e.target.innerHTML = "Привязать"
            delete assigned_products[serial_number]
            e.target.parentElement.className = ""
        }
        else {
            e.target.innerHTML = "Отвязать"
            assigned_products[serial_number] = available_products_for_assigment[serial_number]
            e.target.parentElement.className = "assigned"
        }
        data = {
            products: assigned_products,
            types: Object.keys(data_dicts.current_order_types.data)
        }
        saveItemInStorage(sessionStorage, 'current_order', data)
    }
    deactivateActionButtons([action_buttons.complete_order_btn, action_buttons.delete_order_btn])

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
            containers_and_elements.order_statistics_section,
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
function expandForOrders(e) {
    var order_id = e.target.value;

    sessionStorage.setItem('current_order_id', order_id)

    var order_url = '/expand_order/id/' + order_id
    var get_sides_url = '/sides_in_order/id/' + order_id
    var getOrderSides = sendRequest(get_sides_url, "", "GET")
    var getSpecificOrders = sendRequest(order_url, "", "GET")
    getOrderSides.then(data => {
        createTable(data,
            (data_row, _unused1, _unused) => sessionStorage.setItem('customer_id', data_row['Клиент']),
            containers_and_elements.order_statistics_section,
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
        saveItemInStorage(sessionStorage, 'current_order', { 'products': {}, 'types': [] })
        ignore_columns = ['type_name', 'quantity', 'serial_number', 'number']
        createTable(data.available_products,
            saveDataAboutOrder,
            containers_and_elements.output_section,
            false,
            ignore_columns)
        createTable(data.order_stats,
            null,
            containers_and_elements.order_statistics_section,
            append = true)
        switchToolbar(containers_and_elements.orders_toolbar, containers_and_elements.order_edit_toolbar)
        switchSection(containers_and_elements.orders_form, containers_and_elements.order_statistics_section)
        assignOrderIdToButtons(order_id)

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

