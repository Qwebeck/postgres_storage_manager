/*
Code convetions:
1. snake case for values ( main_storage_id, json_output, url ...)
2. camel case for functions and objects
*/

/*TODO
1. Add new types and delete old types in order editing. 


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

var active_section = null
var active_toolbar = null
// Change on query
var main_storage_id = "Головний склад, Вінниця";



function init() {
    elements = get_elements()
    elements.storage_form.reset()
    elements.orders_form.reset()
    getInfoAboutStorage(main_storage_id);
    sessionStorage.setItem('active_storage', main_storage_id)
    updateHeaders()
}


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
        orders_edit_toolbar: document.getElementById('order_edit_toolbar'),
        existing_toolbars: document.getElementsByName('toolbar'),
        work_with_storage_section: document.getElementById('work_with_storage'),
        order_statistics_section: document.getElementById('order_statistics'),
        order_modification_section: document.getElementById('order_modification_section'),
        specific_orders_container: document.getElementById('orders_on_specific_products'),
        date_of_order_creation_input: document.getElementById('order_date')
    }
}

