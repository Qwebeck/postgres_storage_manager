class Section{
    /**
     * 
     * @param {{element:Element,default_class:string,subareas:[{element:Element,hide:function()}]}} leftColumn 
     * @param {{element:Element,default_class:string,subareas:[{element:Element,hide:function()}]}} rightColumn 
     * @param {{element:Element, default_class: string}} toolbar 
     */
    constructor(leftColumn, rightColumn, toolbar){
        this.leftColumn = leftColumn
        this.rightColumn = rightColumn
        this.subareas = leftColumn.subareas.concat(rightColumn.subareas)
        this.toolbar = toolbar
    }   
    show(){
        if(active_section) active_section.hide()
        active_section = this
        updateData().then(
            () => {
                this.leftColumn.element.className = this.leftColumn.default_class || "active"
                this.rightColumn.element.className = this.rightColumn.default_class || "active"
                if(this.toolbar) this.toolbar.element.className = this.toolbar.default_class || "active-toolbar"
            } 
        )
    }
    hide(){
        for(var element of this.subareas) if(element.hide) element.hide()   
        this.leftColumn.element.className = "hidden"
        this.rightColumn.element.className = "hidden"
        if(this.toolbar) this.toolbar.element.className = "hidden"   
    }
}