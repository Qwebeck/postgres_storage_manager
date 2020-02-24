

function getForms() {
    return {
        storage_selector_form: {
            element: document.getElementById('storage_name'),
            hide: () => document.getElementById('storage_name').reset()
        },
        storage_type_completion_form: {
            element: document.getElementById('add_on_storage_form'),
            hide: () => document.getElementById('add_on_storage_form').reset()
        },
        orders_order_creation_form: {
            element: document.getElementById('orders_add'),
            hide: () => {
                let element = document.getElementById('orders_add')
                element.reset()
                element.className = "hidden"
            },
            show: () => document.getElementById('orders_add').className = "form-container"
        },
        orders_specific_order_creation_section: {
            element: document.getElementById('orders_on_specific_products'),
            hide: () => returnToDefaultChildNumber(document.getElementById('orders_on_specific_products'), 2)
        },
        order_lookup: {
            element: document.getElementById('order_history')
        },
        type_critical_level: {
            element: document.getElementById('critical_level'),
            hide: () => document.getElementById('critical_level').reset()
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
        order_lookup_toolbar: {
            element: document.getElementById('orders_toolbar'),
        },
        concrete_order_toolbar: {
            element: document.getElementById('concrete_order_toolbar'),
            complete_btn: buttons.complete_order_btn
        },
        order_editing_toolbar: {
            element: document.getElementById('order_edit_toolbar')
        }
    }
}

function getSections() {
    return {
        order_sides_section: {
            element: document.getElementById('order_sides')
        },
        order_statistics_section: {
            element: document.getElementById('order_statistics')
        },
        order_editing_specific_order_section: {
            element: document.getElementById('specific_order_editing_order_param'),
            hide: () => returnToDefaultChildNumber(document.getElementById('specific_order_editing_order_param'), 0)
        },
        history_info_section: {
            element: document.getElementById('history_info_area'),
            show: () => document.getElementById('history_info_area').className = "active",
            hide: () => document.getElementById('history_info_area').className = "hidden"
        },
        expanded_type_stats_section: {
            element: document.getElementById('expanded_type_stats')
        },
        // Fix me
        product_alert_section: {
            element: document.getElementById('product_alert_area'),
            hide: () => {
                let alerts = document.getElementById('product_alert_area').querySelectorAll(".alert")
                for (let alert of alerts) {
                    alert.remove()
                }
            }
        },
        order_alert_section: {
            element: document.getElementById('order_alert_section'),
            hide: () => {
                let alerts = document.getElementById('order_alert_section').querySelectorAll(".alert")
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
            element: document.getElementById('complete_order_btn'),
            hide: () => document.getElementById('complete_order_btn').className = 'hidden',
            show: () => document.getElementById('complete_order_btn').className = 'tlb-btn order-button'
        }
    }
}