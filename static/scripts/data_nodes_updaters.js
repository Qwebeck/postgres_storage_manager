/**
 * Update info about orders on current storage
 * @package data_nodes_updaters
 * @param {boolean} history - indicates if history section is active now  
 */
function updateOrdersInfo(history) {
    if (history) var handler = expandForHistoryOrders
    else var handler = expandForOrders
    const createButtonForOrderExpand = (row_info, _, rowNode) => {
        createActionButton(row_info,
            rowNode,
            "order_id",
            "Подробнее",
            handler
        )
    };
    if (history) key = 'history';
    else key = 'pending_orders'
    var orders = getItemFromStorage(sessionStorage, key);
    elements.output_section.innerHTML = ""
    if (orders.is_modified) {
        getOrders(data => createTable(coalesce(data, null, 'result'), createButtonForOrderExpand, 'output_section', append = true, order_ignore_columns))
    } else {
        createTable(coalesce(orders.data, null, 'result'), createButtonForOrderExpand, 'output_section', append = true, order_ignore_columns)
    }
}

/**
 * Fill selects with appropriate product_type.
 * @package data_nodes_updaters
 */
function updateTypesInfo() {
    available_types = getItemFromStorage(sessionStorage, 'types');
    if (available_types.is_modified) {
        getNewTypes = sendRequest('/get_types/id/' + main_storage_id, "", "GET", sessionStorage, 'types')
        getNewTypes.then(_ => updateTypesInfo())
    } else {
        selects = document.getElementsByName('product_type');
        fillSelects(selects, coalesce(available_types.data, null, 'result'));
    }
}

/**
* Fill selects in orders with appropriate businesses
* @package data_nodes_updaters
* @param {string[]} select_ids - ids of selects to update 
*/
function fillBusinessSelects(select_ids) {
    var to_update = []
    for (const id of select_ids) {
        select_element = document.getElementById(id)
        to_update.push(select_element)
    }
    var data = getItemFromStorage(sessionStorage, 'businesses');
    fillSelects(to_update, data.data.result);
}

/**
 * Update statistics table and type list. Cheks is_modified flag on each item. If no - took items from localStorage. 
 * If yes - senRequest on server and update values
 * @package data_nodes_updaters
 */
function updateStorageInfo() {
    const createButtonForTypeExpand = (row_info, _, rowNode) => {
        createActionButton(row_info,
            rowNode,
            "Tип",
            "Подробнее",
            expandForTypes
        )
    };
    var id = getItemFromStorage(sessionStorage, 'active_storage')
    statistics = getItemFromStorage(sessionStorage, 'storage_stats')
    if (statistics.data) {
        data = statistics.data.result
    } else {
        data = null
    }
    if (statistics.is_modified) {
        getStatistics(id, data => createTable(data.result, createButtonForTypeExpand))
    }
    else createTable(data, createButtonForTypeExpand)
    updateSelects()
}

/**
 * Wrapper around fill selects, that describe, logic for filling business selects.
 * @package data_nodes_updaters
 */
function updateSelects(){
    var types = getItemFromStorage(sessionStorage,'types')
    var id = getItemFromStorage(sessionStorage,'active_storage')
    var selects = document.getElementsByName("type_name")
    activateToolbar()
    if (types.is_modified) {
        const url = '/get_types/id/' + id;
        const getAvailableTypes = sendRequest(url, "", "GET", sessionStorage,'types');
        getAvailableTypes.then(data => fillSelects(selects,coalesce(data,null,data['result'])))
        .catch(console.exception)
    } else {
        options = coalesce(types.data,null,'result')
        fillSelects(selects, options)

    }
}