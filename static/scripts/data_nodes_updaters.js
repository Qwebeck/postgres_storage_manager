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
    containers_and_elements.output_section.innerHTML = ""
    if (orders.is_modified) {
        getOrders(data => createTable(data,            
                                     createButtonForOrderExpand,
                                     containers_and_elements.output_section,
                                     append = true,
                                     order_ignore_columns))
    } else {
        createTable(orders.data,
                    createButtonForOrderExpand,
                    containers_and_elements.output_section,
                    append = true,
                    order_ignore_columns)
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
        fillSelects([containers_and_elements.available_types_list], available_types.data);
    }
}

/**
* Fill selects in orders with appropriate businesses.
* Wrapper around fillSelects
* @package data_nodes_updaters
* @param {Element[]}  - ids of selects to update 
*/
function fillBusinessSelects(selects) {
    var data = getItemFromStorage(sessionStorage, 'businesses');
    fillSelects(selects, data.data);
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
        data = statistics.data
    } else {
        data = null
    }
    if (statistics.is_modified) {
        getStatistics(id, data => createTable(data, createButtonForTypeExpand))
    }
    else createTable(data, createButtonForTypeExpand)
    updateSelects()
}

/**
 * Wrapper around fill selects, that describe, logic for filling business selects.
 * @package data_nodes_updaters
 */
function updateSelects() {
    var types = getItemFromStorage(sessionStorage, 'types')
    var id = getItemFromStorage(sessionStorage, 'active_storage')
    var selects = document.getElementsByName("type_name")
    activateToolbar()
    if (types.is_modified) {
        const url = '/get_types/id/' + id;
        const getAvailableTypes = sendRequest(url, "", "GET", sessionStorage, 'types');
        getAvailableTypes.then(data => fillSelects(selects, data))
            .catch(console.exception)
    } else {
        fillSelects(selects, types.data)

    }
}

/**
 * Update all data dictionaries, where is_modified flag is set to true 
 * @package data_nodes_updaters
 */
function updateData(){
    for(data_item of Object.values(data_dicts)){
        if(data_item.is_modified){
            var url = data_item.url_creation_handler() 
            waitingAnimation(true)
            var req = sendRequest(url,"","GET")
            req.then(data => {
                if(data_item.on_update) data_item.on_update(data) 
                if(data_item.data_processor) data = data_item.data_processor(data)
                data_item.data = data
                data_item.is_modified = false
                waitingAnimation(false)
            })
        }
    }

}