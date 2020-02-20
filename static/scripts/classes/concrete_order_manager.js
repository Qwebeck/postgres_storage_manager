class ConcreteOrderManager extends Section{
    constructor(orderInfoArea,
                productsInOrderArea,
                toolbar,
                orderSidesSection,
                statisticsSection,
                order_description,
                order_sides) {
        super(
            orderInfoArea,
            productsInOrderArea,
            toolbar)
        this.orderStatisticsSection = statisticsSection
        this.orderSidesSection = orderSidesSection
        this.order_description = order_description
        this.current_order_sides = order_sides
        document.addEventListener(this.order_description.emit, (e) => this.describeCurrentOrder(e.detail))
    }

    describeCurrentOrder(data){
        createTable(
            data.order_sides,
            null,
            this.orderSidesSection.element,
        )
        createTable(
            data.order_stats,
            null,
            this.orderStatisticsSection.element
        )
        createTable(
            Object.values(data.available_products),
            null,
            this.rightColumn.element,
            false,
            ['supplier_id','client_id','type_name','quantity','serial_number','number']     
        )
    }
}