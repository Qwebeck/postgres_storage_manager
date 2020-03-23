/**
 * Two problems:
 * 1. No. 1 - different library version. 
 * Solution:
 *      1. Create wrappers everywhere
 *      2. Create setup.py
 *      3. Docker image
 * 2. Problem with encodings in database 
 */

var active_section = null
var active_toolbar = null
// Change on query
// var main_storage_id = "Головний офіс, Вінниця";

/*
Code convetions:
1. snake case for values ( main_storage_id, json_output, url ...)
2. camel case for functions and objects
*/

/*TODO
1. Allow user to create order on types, that aren't available on storage

/**
 * Keys in session storage
 * is_history - indicates if last history mode where turned on in orders
 * active_storage - stores informatoin about current storage
 */



function init() {
    $('is_history').checked = false
    sessionStorage.setItem('is_history', false)
    if (!sessionStorage.getItem('active_storage')) {
        sessionStorage.setItem('active_storage', '')
    }
    sessionStorage.removeItem('current_order_id')
    data_item_modified = new Event('data_item_modified')
    document.addEventListener('data_item_modified', updateData)

    buttons = getButtons()
    forms = getForms()
    datalists = getDatalist()
    sections = getSections()
    toolbars = getToolbars()
    areas = getAreas()
    data_dicts = getDataDicts()

    orderEditor = new OrderEditor(
        areas.order_editing_section,
        areas.order_editing_output_section,
        toolbars.order_editing_toolbar,
        data_dicts.current_actual_order_description
    )

    concreteOrderManager = new ConcreteOrderManager(
        areas.concrete_order_description_area,
        areas.products_in_order_output_area,
        toolbars.concrete_order_toolbar,
        sections.order_sides_section,
        sections.order_statistics_section,
        data_dicts.current_actual_order_description,
        data_dicts.orders_with_current_storage
    )

    orderManager = new OrderManager(
        areas.order_completion_area,
        areas.order_output_area,
        toolbars.order_lookup_toolbar,
        sections.history_info_section,
        forms.orders_order_creation_form,
        data_dicts.orders_with_current_storage,
        data_dicts.current_order_sides,
        data_dicts.current_actual_order_description,
        concreteOrderManager
    )


    productTypeManager = new ProductTypeManager(
        areas.product_managing_area,
        areas.product_output_area,
        null,
        data_dicts.current_storage_statistics
    )

    storageManager = new StorageManager(
        areas.control_panel_for_storage_manager,
        areas.storage_output_area,
        null,
        data_dicts.existing_businesses,
        data_dicts.current_storage_statistics,
        sessionStorage.getItem('active_storage'),
        productTypeManager,
        data_dicts.producents_and_models)

    storageManager.hide()
    if (sessionStorage.getItem('active_storage')) {
        updateData().then(
            () => {
                // waitingAnimation(false)

            }
        )
        updateHeaders()

    } else {
        // waitingAnimation(false)
    }
}
