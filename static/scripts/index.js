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

var active_page_id = "";
var active_toolbar_id = ""
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
        client_form_in_orders: document.getElementById('clients_ids'),
        supplier_form_in_orders: document.getElementById('suppliers_ids'),
        is_history: document.getElementById('is_history'),
        query_section: document.getElementById('query_section'),
        output_section: document.getElementById('output_section'),
        order_statistics: document.getElementById('order_statistics'),
        block_with_waiting_anim: document.getElementById('waiting'),
        show_orders_from_input: document.getElementById('from_date'),
        show_orders_to_input: document.getElementById('to_date'),
        storage_form: document.getElementById("add_on_storage_form"),
        orders_form: document.getElementById("orders_add")
    }
}
