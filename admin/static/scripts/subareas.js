/**
 * Definition of all HTML elements as dict's, to manage them easier
 */

function getForms() {
    return {
        storage_selector_form: {
            element: $('storage_name'),
            hide: () => $('storage_name').reset()
        },
        storage_type_completion_form: {
            element: $('add_on_storage_form'),
            hide: () => $('add_on_storage_form').reset()
        },
        orders_order_creation_form: {
            element: $('orders_add'),
            hide: () => {
                let element = $('orders_add')
                element.reset()
                element.className = "hidden"
            },
            show: () => $('orders_add').className = "form-container"
        },
        orders_specific_order_creation_section: {
            element: $('orders_on_specific_products'),
            hide: () => returnToDefaultChildNumber($('orders_on_specific_products'), 2)
        },
        order_lookup: {
            element: $('order_history')
        },
        type_critical_level: {
            element: $('critical_level'),
            hide: () => $('critical_level').reset()
        }
    }
}


function getDatalist() {
    return {
        available_businesses_dl: $('available_businesses'),
        available_types_dl: $('available_types')
    }
}

function getToolbars() {
    return {
        order_lookup_toolbar: {
            element: $('orders_toolbar'),
        },
        concrete_order_toolbar: {
            element: $('concrete_order_toolbar'),
            complete_btn: buttons.complete_order_btn
        },
        order_editing_toolbar: {
            element: $('order_edit_toolbar')
        },
        product_editing_toolbar: {
            element: $('product_type_editing_toolbar')
        }
    }
}

function getSections() {
    return {
        order_sides_section: {
            element: $('order_sides')
        },
        order_statistics_section: {
            element: $('order_statistics')
        },
        order_editing_specific_order_section: {
            element: $('specific_order_editing_order_param'),
            hide: () => returnToDefaultChildNumber($('specific_order_editing_order_param'), 0)
        },
        history_info_section: {
            element: $('history_info_area'),
            show: () => $('history_info_area').className = "active",
            hide: () => $('history_info_area').className = "hidden"
        },
        expanded_type_stats_section: {
            element: $('expanded_type_stats')
        },
        // Fix me
        product_alert_section: {
            element: $('product_alert_area'),
            hide: () => {
                let alerts = $('product_alert_area').querySelectorAll(".alert")
                for (let alert of alerts) {
                    alert.remove()
                }
            }
        },
        order_alert_section: {
            element: $('order_alert_section'),
            hide: () => {
                let alerts = $('order_alert_section').querySelectorAll(".alert")
                for (let alert of alerts) {
                    alert.remove()
                }
            }
        }
    }
}

function getButtons() {
    return {
        complete_order_btn: {
            element: $('complete_order_btn'),
            hide: () => $('complete_order_btn').className = 'hidden',
            show: () => $('complete_order_btn').className = 'tlb-btn order-button'
        }
    }
}