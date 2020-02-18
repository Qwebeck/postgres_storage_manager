class StorageManager extends Section{
    /**
     * 
     * @param {*} specificOrderArea 
     * @param {*} productsArea 
     * @param {*} toolbar 
     * @param {*} existing_businesses 
     * @param {*} types_on_existing_storage 
     * @param {*} active_business 
     * @param {*} source_dict - dict, where is modified flag is set
     */
    constructor(specificOrderArea, productsArea, toolbar, 
                existing_businesses,
                types_on_existing_storage,
                active_business,
                source_dict){
        super(specificOrderArea, productsArea, toolbar)
        this.existing_businesses = existing_businesses
        this.types_on_existing_storage = types_on_existing_storage
        this.active_business = active_business
        this.global_dict = source_dict
    }
    addNewBusiness(){}
    addProductToBusiness(){}
}