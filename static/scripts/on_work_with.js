/**
 * Package describes, what actions should be done after activating each section
 *  
 */


/**
 * Call functions, that should be performed while order created.
 * @param {*} is_history 
 */
function on_work_with_orders(is_history = false) {
    clearTemporaryVars();
    activateActionButtons(Object.values(action_buttons))
    switchSection(containers_and_elements.order_modification_section, null)
    switchToolbar(null, null)
    containers_and_elements.is_history.checked = false;
    activateSection(containers_and_elements.orders_form);
    activateToolbar(containers_and_elements.orders_toolbar);
    setCurrentDate(containers_and_elements.date_of_order_creation_input);
    returnToDefaultChildNumber(containers_and_elements.specific_orders_container);
    // Is needed ?
    // switchToolbar(null, containers_and_elements.orders_toolbar);
    updateHeaders();
    fillBusinessSelects([containers_and_elements.client_select_in_orders,
                        containers_and_elements.supplier_select_in_orders]);
    updateTypesInfo();
    updateOrdersInfo(false);

}

function on_work_with_storage() {
    clearTemporaryVars()
    updateHeaders()
    switchToolbar(null, null)
    containers_and_elements.query_section.style = "display:block"
    containers_and_elements.output_section.style = "width:65%"
    active_storage = sessionStorage.getItem('active_storage')
    var options = getItemFromStorage(sessionStorage, 'businesses')
    var business_select = document.getElementById('active_storage')
    fillSelects([business_select], options.data)
    setSelectedElementOnSelects([business_select], active_storage)
    activateSection(containers_and_elements.work_with_storage_section)
    // if (active_section != containers_and_elements.work_with_storage_section) activateSection(containers_and_elements.work_with_storage_section)
    updateStorageInfo()

}

