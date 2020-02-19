var active_section = null
var active_toolbar = null
// Change on query
var main_storage_id = "Головний склад, Вінниця";

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

var active_section = null
var active_toolbar = null
// Change on query
var main_storage_id = "Головний офіс, Вінниця";



function init() {
    sessionStorage.setItem('active_storage', main_storage_id)

    data_item_modified = new Event('data_item_modified')
    document.addEventListener('data_item_modified', updateData)

    // to remove
    containers_and_elements = get_elements()

    // action_buttons = get_action_btn_description()
    forms = getForms()
    datalists = getDatalist()
    toolbars = getToolbars()
    areas = getAreas()
    data_dicts = getDataDicts()

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

/**
 * Return data used by application in dict format
 */
function getDataDicts() {
    return {
        existing_businesses: {
            is_actual: false,
            url_creation_handler: () => '/info_about_businesses',
            data_processor: (data) => data.map(x => x['name']),
            data: {},
            related_list: datalists.available_businesses_dl,
            emit: 'bussines_update'
        },
        current_storage_statistics: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnStorage('/get_statistics/id/'),
            related_list: datalists.available_types_dl,
            emit: 'statistics_update',
            data: {}
        },
        orders_with_current_storage: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnStorage('/get_orders/'),
            data: {}
        },
        current_order_sides: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnOrder('/sides_in_order/id/'),
            data: {}
        },
        current_actual_order_description: {
            is_actual: false,
            data: {},
            url_creation_handler: () => createUrlDependingOnOrder('/expand_order/id/'),
            data_processor: (data) => {
                if (!data) return null
                available_products = convertToObject('serial_number', data.available_products)
                order_stats = convertToObject("Тип", data.order_stats)
                return {
                    available_products: available_products,
                    order_stats: order_stats,
                    order_types: data.order_stats.reduce((accumulator, el) => {
                        accumulator[el['Тип']] = el['Требуеться']
                        return accumulator
                    }, {}),
                    unbinded_products: new Set()
                }
            },
            pack: () => {
                return {
                    available_products: data_dicts.current_order_description.data.available_products,
                    order_stats: data_dicts.current_order_description.data.order_stats,
                    order_types: data_dicts.current_order_description.data.order_types,
                    unbinded_products: Array.from(data_dicts.current_order_description.data.unbinded_products)
                }
            }
        },
        current_history_order_description: {
            is_actual: false,
            url_creation_handler: () => createUrlDependingOnOrder('/expand_history_order/id'),
            data: {}
        }
    }
}


function getForms() {
    return {
        storage_selector_form: {
            element: document.getElementById('storage_name'),
            hide: () => document.getElementById('storage_name').reset()
        },
        storage_order_creator_form: {
            element: document.getElementById('add_on_storage_form'),
            hide: () => document.getElementById('add_on_storage_form').reset()
        }
    }
}


function getAreas() {
    return {
        control_panel_for_storage_manager: {
            element: document.getElementById('work_with_storage'),
            subareas: [
                forms.storage_selector_form,
                forms.storage_order_creator_form
            ]
        },
        product_managing_area: {
            element: document.getElementById('product_managing_area'),
            subareas: []
        },        
        storage_output_area: {
            element: document.getElementById('storage_output_section'),
            default_class: "output_section",
            subareas: []
        },
        product_output_area: {
            element: document.getElementById('product_output_area'),
            default_class: "output_section",
            subareas: []
        }

    }
}

function getDatalist() {
    return {
        available_businesses_dl: document.getElementById('available_businesses'),
        available_types_dl: document.getElementById('available_types')
    }
}

function getToolbars() {
    return {

    }
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

