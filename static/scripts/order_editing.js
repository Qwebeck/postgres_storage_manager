
class OrderEditor extends Section{
    constructor(specificOrderArea, productsArea, toolbar, data){
        super(specificOrderArea, productsArea, toolbar)
    }
    updateData(){}
    addNewTypeToOrder(){}
    deleteTypeFromOrder(){}
    bindProductToOrder(){}
}


class OrderCreator extends Section{
    constructor(specificOrderArea, productsArea, toolbar, data){
        super(specificOrderArea, productsArea, toolbar)
    }
    supplierChanged(){}
    createNewOrder(){}        
}

class OrderViewer extends Section{
    constructor(specificOrderArea, productsArea, toolbar, data){
        super(specificOrderArea, productsArea, toolbar)
    }
    completeOrder(){}
    deleteOrder(){}
}

class ProductViewer extends Section{
    constructor(specificOrderArea, productsArea, toolbar, data){
        super(specificOrderArea, productsArea, toolbar)
    }
    setCriticalLevel(){}
    deleteProduct(){}    
}