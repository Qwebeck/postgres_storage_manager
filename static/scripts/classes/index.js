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
var main_storage_id = "Головний офіс, Вінниця";

/*
Code convetions:
1. snake case for values ( main_storage_id, json_output, url ...)
2. camel case for functions and objects
*/

/*TODO
1. Allow user to create order on types, that aren't available on storage

/**
 * Keys with data
 * businesses - business name + id
 * storage_stats - statistics of current storage
 * pending_orders - active orders
 * history - orders in history
 * current_storage 
 * types - types on storage
 * active_storage - active storage
 */



function init() {
    sessionStorage.setItem('active_storage', main_storage_id)

    data_item_modified = new Event('data_item_modified')
    document.addEventListener('data_item_modified', updateData)

    // to remove
    containers_and_elements = get_elements()

    // action_buttons = get_action_btn_description()
    forms = getForms()
    datalists = getDatalist()
    sections = getSections()
    toolbars = getToolbars()
    areas = getAreas()
    data_dicts = getDataDicts()
    
    concreteOrderManager = new ConcreteOrderManager(
        areas.concrete_order_description_area,
        areas.products_in_order_output_area,
        toolbars.concrete_order_toolbar,
        sections.order_sides_section,
        sections.order_statistics_section,
        data_dicts.current_actual_order_description
    )

    orderManager = new OrderManager(
        areas.order_completion_area,
        areas.order_output_area,
        toolbars.order_lookup_toolbar,
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
        main_storage_id,
        productTypeManager)

    storageManager.hide()
    // activateActionButtons(Object.values(action_buttons))
    containers_and_elements.storage_form.reset()
    containers_and_elements.orders_form.reset()
    updateData().then(
        () => {
            waitingAnimation(false)

        }
    )
    updateHeaders()

    // getInfoAboutStorage(main_storage_id);

}


/**Should be deleted */



function get_elements() {
    return {
        client_select_in_orders: document.getElementById('clients_ids'),
        supplier_select_in_orders: document.getElementById('suppliers_ids'),
        is_history: document.getElementById('is_history'),
        query_section: document.getElementById('query_section'),
        output_section: document.getElementById('output_section'),
        order_statistics: document.getElementById('order_statistics'),
        block_with_waiting_anim: document.getElementById('waiting'),
        show_orders_from_input: document.getElementById('from_date'),
        show_orders_to_input: document.getElementById('to_date'),
        storage_form: document.getElementById('add_on_storage_form'),
        orders_form: document.getElementById('orders_add'),
        existing_headers: document.getElementsByName('storage_header'),
        orders_toolbar: document.getElementById('orders_toolbar'),
        order_edit_toolbar: document.getElementById('order_edit_toolbar'),
        existing_toolbars: document.getElementsByName('toolbar'),
        work_with_storage_section: document.getElementById('work_with_storage'),
        order_statistics_section: document.getElementById('order_statistics'),
        order_modification_section: document.getElementById('order_modification_section'),
        specific_orders_container: document.getElementById('orders_on_specific_products'),
        date_of_order_creation_input: document.getElementById('order_date'),
        specific_orders_modification_container: document.getElementById('specific_orders_modification'),
        order_creation_specific_order_section: document.getElementById('orders_on_specific_products'),
        order_modification_specific_order_section: document.getElementById('specific_order_modification'),
        available_types_list: document.getElementById('available_types'),
        business_addition_form: document.getElementById('storage_name'),
        order_sides_section: document.getElementById('order_sides')
    }
}

// function get_action_btn_description() {
//     return {
//         complete_order_btn: {
//             button: document.getElementById('complete_order_btn'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "disabled",
//             handler: completeOrder,
//             text: "Выполнить"
//         },
//         delete_order_btn: {
//             button: document.getElementById('delete_order_btn'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "disabled",
//             handler: deleteOrder,
//             text: "Удалить"
//         },
//         edit_order_btn: {
//             button: document.getElementById('edit_order_btn'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "disabled",
//             handler: editOrder,
//             text: "Изменить"
//         },
//         save_new_specific_orders_btn: {
//             button: document.getElementById('save_new_specific_orders'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "hidden",
//             handler: saveSpecificOrders,
//             text: "Сохранить измененный заказ"
//         },
//         save_binded_products_btn: {
//             button: document.getElementById('save_binded_products'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "hidden",
//             handler: saveBindedProducts,
//             text: "Сохранить привязанные продукты"
//         },
//         disable_editing_btn: {
//             button: document.getElementById('disable_editing_btn'),
//             classname: "tlb-btn order-button",
//             hidden_classname: "hidden",
//             handler: disableEditing,
//             text: "Отменить"
//         }
//     }
// }


/**
 * tmp handler to not break things
 */
function mockUrl() {
    return '/mock'
}
function on_work_with_storage() {
    console.log('storage')
}
function on_work_with_orders() {
    console.log('orders')
}

