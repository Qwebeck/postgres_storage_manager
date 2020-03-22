
// change subareas on dicts
function getAreas() {
    return {
        control_panel_for_storage_manager: {
            element: $('work_with_storage'),
            subareas: [
                forms.storage_selector_form,
                forms.storage_type_completion_form
            ],
        },
        product_managing_area: {
            element: $('product_managing_area'),
            subareas: [
                sections.expanded_type_stats_section,
                forms.type_critical_level,
                sections.product_alert_section
            ]
        },
        order_completion_area: {
            element: $('order_creation'),
            subareas: [
                forms.orders_order_creation_form,
                forms.orders_specific_order_creation_section
                
            ]
        },
        concrete_order_description_area: {
            element: $('concrete_order_description_area'),
            subareas: [
                sections.order_sides_section,
                sections.order_statistics_section,
                sections.order_alert_section
            ]
        },
        order_editing_section: {
            element: $('specific_order_editing_area'),
            subareas: [
                sections.order_editing_specific_order_section
            ]
        },
        order_editing_output_section: {
            element: $('editing_output_area'),
            default_class: "output_section",
            subareas: []
        },
        storage_output_area: {
            element: $('storage_output_section'),
            default_class: "output_section",
            subareas: []
        },
        product_output_area: {
            element: $('product_output_area'),
            default_class: "output_section",
            subareas: []
        },
        order_output_area: {
            element: $('order_output_area'),
            default_class: "output_section",
            subareas: []
        },
        products_in_order_output_area: {
            element: $('product_in_order_area'),
            default_class: "output_section",
            subareas: []
        }

    }
}
