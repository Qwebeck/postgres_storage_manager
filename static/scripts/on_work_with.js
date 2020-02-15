/**
 * Package describes, what actions should be done after activating each section
 *  
 */

/**
 * Clear variables, that specific for some session.
 */
function clearTemporaryVars() {
    sessionStorage.setItem('customer_id', "")
    saveItemInStorage(sessionStorage, 'serial_numbers_for_current_order', [])

}


/**
 * Call functions, that should be performed while order created.
 * @param {*} is_history 
 */
function on_work_with_orders(is_history = false) {
    clearTemporaryVars();
    elements.is_history.checked = false;
    activateSection('orders_add');
    activateToolbar('orders_toolbar');
    setCurrentDate('order_date');
    returnToDefaultChildNumber('orders_on_specific_products');
    switchToolbar(null, 'orders_toolbar');
    updateHeaders();
    fillBusinessSelects(['clients_ids','suppliers_ids']);
    updateTypesInfo();
    updateOrdersInfo(false);

}

function on_work_with_storage() {
    clearTemporaryVars();
    updateHeaders();
    elements.query_section.style = "display:block";
    elements.output_section.style = "width:65%";
    switchToolbar(null, null)
    active_storage = sessionStorage.getItem('active_storage')
    var options = getItemFromStorage(sessionStorage, 'businesses')
    var business_select = document.getElementById('active_storage')
    console.log(options.data)
    fillSelects([business_select], options.data.result)
    setSelectedElementOnSelects([business_select], active_storage)

    if (active_page_id != 'work_with_storage') activateSection('work_with_storage')
    updateStorageInfo()

}