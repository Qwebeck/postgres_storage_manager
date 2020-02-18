class Section{
    /**
     * 
     * @param {{element:Element, defaultClass: string}} leftColumn 
     * @param {{element:Element, defaultClass: string}} rightColumn 
     * @param {{element:Element, defaultClass: string}} toolbar 
     */
    constructor(leftColumn, rightColumn, toolbar){
        this.leftColumn = leftColumn
        this.rightColumn = rightColumn
        this.toolbar = toolbar
    }   
    show(){ 
        this.leftColumn.element.className = this.leftColumn.defaultClass
        this.rightColumn.element.className = this.rightColumn.defaultClass
        this.toolbar.element.className = this.toolbar.defaultClass    
    }
    hide(){
        this.leftColumn.element.style = "display:none;"
        this.rightColumn.element.style = "display:none;"
        this.toolbar.element.style = "display:none;"   
    }
}