
/**
 * @module StorageManager contain functions that user could to manage his warehouse.
 */
class StorageManager extends Section {
    /**
     * @param {{element:Element,default_class:string,subareas:[{element:Element,hide:function()}]}} productAddingArea 
     * @param {{element:Element,default_class:string,subareas:[{element:Element,hide:function()}]}} productsArea 
     * @param {Element} toolbar 
     * @param {{}} existing_businesses 
     * @param {{}} types_on_existing_storage 
     * @param {string} active_business 
     */
    constructor(productAddingArea,
        productsArea,
        toolbar,
        existing_businesses,
        storage_statistics,
        active_business,
        productTypeManager,
        producents_and_models) {
        super(
            productAddingArea,
            productsArea,
            toolbar)

        this.existing_businesses = existing_businesses
        this.storage_statistics = storage_statistics
        this.existing_types = Array.isArray(storage_statistics.data) ? storage_statistics.data.map(x => x["Type"]) : []
        this.active_business = active_business
        this.producents_and_models = producents_and_models
        this.product_type_manager = productTypeManager

        document.addEventListener(existing_businesses.emit, (e) => this.availableBusinessesUpdate(e.detail), false)
        document.addEventListener(storage_statistics.emit, (e) => this.storageStatisticsUpdate(e.detail), false)
        document.addEventListener(this.producents_and_models.emit, (e) => this.producentAndModelsUpdate(e.detail), false)
    }
    /**
     * Fill type datalists with types availavle on storage and creates 
     * table, which gives brief information about all types that are currently on storages   
     * @param {Object[]} data Actual data about products on storage. grouped by type
     * @param data.Type Type of product
     */
    storageStatisticsUpdate(data) {
        this.existing_types = data && data.map(x => x["Type"])
        updateDatalist(this.storage_statistics.related_list, this.existing_types)

        createTable(data, (row_info, _, rowNode) => this.processStatisticsRow(row_info, _, rowNode),
            this.rightColumn.element,
            false,
            ['owner_name']
        )
    }

    /**
     * Changes business status from and to service center 
     * @param {*} event 
     */
    businessStatusChanged(event) {
        console.log(event.target.checked)
        let url = '/update_business_status'
        let data = {
            'name': sessionStorage.getItem('active_storage'),
            'is_service': event.target.checked
        }
        sendRequest(url, data, "POST")
    }
    /**
     * Called when new product is added and on init
     */
    producentAndModelsUpdate(data) {
        updateDatalist($('existing_models'), data.models)
        updateDatalist($('existing_producents'), data.producents)
    }

    /**
     * Called on update of products. Checks if there appear any
     *  new condition(such as critical level), that should be displayed to user 
     * @param {*} row_info 
     * @param {*} _ 
     * @param {*} rowNode 
     */
    processStatisticsRow(row_info, _, rowNode) {
        let action_btn = createActionButton(row_info,
            rowNode,
            "Type",
            "Expand",
            this.expandForTypes
        )
        if (row_info['Amount of functional'] < row_info['Critical level'] && row_info['Ordered'] == 0) {
            action_btn.className = 'action-button alert-critical'
        }
        if (row_info['Amount of functional'] - row_info['Ordered'] < row_info['Critical level']) {
            action_btn.className = 'action-button alert-warning'
        }

    }

    /**
     * Called on adding new Business. Adds new element to business datalist
     * @param {*} data 
     */
    availableBusinessesUpdate(data) {
        let active_business = sessionStorage.getItem('active_storage')
        updateDatalist(this.existing_businesses.related_list, data, [active_business])
    }

    /**
     * Called when business is switched. 
     * Executes update procedure for every datanode
     * @param {*} e 
     */
    switchBusiness(e) {
        e.preventDefault()
        let form = e.target.parentElement
        let new_business = form.active_storage.value
        if (!new_business) {
            alert("Business wasn't choose")
            return
        }
        if (this.existing_businesses.data.includes(new_business)) {
            sessionStorage.setItem('active_storage', new_business)
            updateHeaders()
            updateDatalist(this.existing_businesses.related_list, this.existing_businesses.data, [new_business])
            for (let item in data_dicts) {
                if (item === 'existing_businesses') continue
                // global variable
                data_dicts[item].is_actual = false
                form.reset()

            }
            document.dispatchEvent(data_item_modified)
        } else {
            this.addNewBusiness(new_business,
                () => {
                    sessionStorage.setItem('active_storage', new_business)
                    updateHeaders()
                    for (let item in data_dicts) data_dicts[item].is_actual = false
                    form.reset()

                })
        }
    }
    /**
     * Deletes business, typed in form
     */
    deleteBusiness(event) {
        event.preventDefault()
        let form = event.target.parentElement
        let new_business = form.active_storage.value
        if (!new_business) {
            alert("Business wasn't choose")
            return
        }

        if (this.existing_businesses.data.includes(new_business)) {
            let url = '/delete_business'
            let data = { id: new_business }
            sendRequest(url, data, "DELETE").then(_ => {
                this.existing_businesses.is_actual = false
                form.reset()
                document.dispatchEvent(data_item_modified)
            })
        } else {
            alert(`Business ${new_business} doesn't exists`)
        }
    }
    /**
     * Called when user press on type expand button. 
     * Hides storage manager and open section with detailed information about product
     */
    expandForTypes(e) {
        e.preventDefault()
        let type = e.target.value
        productTypeManager.update(type)
        productTypeManager.show()
    }

    /**
     * Adding new business to database and triggers business update event 
     * @param {*} new_business 
     * @param {*} callback 
     */
    addNewBusiness(new_business, callback = null) {
        let url = '/add_new_business'
        let data = {
            'name': new_business
        }
        let addBusiness = sendRequest(url, data, 'POST')
        addBusiness.then(
            _ => {
                if (callback) callback()
                data_dicts.existing_businesses.is_actual = false
                document.dispatchEvent(data_item_modified)
            }
        )
    }
    /**
     * Called when user adding prouct to business
     * @param {*} e 
     */
    addProductToBusiness(e) {
        e.preventDefault()
        let form = e.target
        if (validateStorageForm(form) === false) {
            return
        }
        let data = formToDict(form.elements)
        let url = createUrlDependingOnStorage('/add_items_on_storage/id/')
        let post = sendRequest(url, data, "POST")
        Array.from(form.elements).forEach(el => el.className = el.className.replace("error", ""))
        form.reset()
        post.then(_ => {
            this.storage_statistics.is_actual = false
            this.producents_and_models.is_actual = false
            document.dispatchEvent(data_item_modified)
        })
    }

}
