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
    activateSection(elements.orders_form);
    activateToolbar(elements.orders_toolbar);
    setCurrentDate(elements.date_of_order_creation_input);
    returnToDefaultChildNumber(elements.specific_orders_container);
    // Is needed ?
    // switchToolbar(null, elements.orders_toolbar);
    updateHeaders();
    fillBusinessSelects([elements.client_select_in_orders,
                        elements.supplier_select_in_orders]);
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
    fillSelects([business_select], options.data)
    setSelectedElementOnSelects([business_select], active_storage)
    // could be replaced with ?
    // activateSection(elements.work_with_storage_section)
    if (active_section != elements.work_with_storage_section) activateSection(elements.work_with_storage_section)
    updateStorageInfo()

}