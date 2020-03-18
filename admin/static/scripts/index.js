var active_section = null
var active_toolbar = null

/*
Code convetions:
1. snake case for values ( main_storage_id, json_output, url ...)
2. camel case for functions and objects
*/

function init() {
    main_storage_id = localStorage.getItem('active_storage') || 'No storage selected'
    document.getElementById('is_history').checked = false
    sessionStorage.setItem('is_history', false)
    sessionStorage.setItem('active_storage', main_storage_id)
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
        main_storage_id,
        productTypeManager)

    storageManager.hide()
    updateData().then(
        () => {
            waitingAnimation(false)

        }
    )
    updateHeaders()

    // getInfoAboutStorage(main_storage_id);

}
