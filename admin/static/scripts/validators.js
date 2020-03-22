/**
 * Checks if fields have values during order adding
 * @package validators
 * @param {Element} form
 * @returns {boolean} - is valid form
 */
function validateOrderForm(form) {
    var error = false
    message = 'Заполните все необходимые поля'
    if(!form.clients_ids.value){
        error = true
        form.clients_ids.className = "error"
    }
    var product_orders = document.getElementsByName("product_order")
    var order_exists = false
    for(var order_container of product_orders){
        product_type = order_container.querySelector('input[name=product_type]')
        number = order_container.querySelector('input[name=number]')
        if(!product_type.value && number.value != 0){
            error = true
            product_type.className = 'error'
        }
        if(product_type.value  && !number.value){
            error = true
            number.className = 'error'
        }
        if(product_type.value && number.value){
            order_exists = true
        }
    }
    if(!order_exists) {
        message = 'Заказ должен быть сделан на что-то'
        error = true
    }
    if (error) {
        alert(message)
        return false
    }
    return true
}


/**
 * Valeidate form of adding on storage
 * @param {*} e 
 * @param {Element} form - order form to validate  
 */
function validateStorageForm(form) {
    var error = false
    if (!form.producent.value) {
        error = true
        form.producent.className = 'error'
    }
    if (!form.producent.value) {
        error = true
        form.producent.className = 'error'
    }
    if (!form.serial_number.value) {
        error = true
        form.serial_number.className = 'error'
    }
    if (!form.model.value) {
        error = true
        form.model.className = 'error'
    }
    if (form.type_name.value == 'default' || !form.type_name.value) {
        error = true
        form.type_name.className = 'error'
    }
    if (error) {
        alert('Заполните необходимые поля')
        return false
    }
    return true

}


/**
 * Check if during selction, user decided to add new type, and  displays it in case of true
 * @param {*} e 
 * @param {*} input_id 
 */
function isUserInputForType(e, input_id = 'new_type') {
    const select = e.target
    const userInput = $(input_id)
    if (!select.value.localeCompare("new")) {
        userInput.style = "display:block"
        userInput.name = "type_name"
        select.name = "not_type_name"
    } else {
        userInput.style = "display:none"
        userInput.name = "not_type_name"
        select.name = "type_name"
    }
}

/**
 * Hide user input, that allowed you to add your types
 * @param {string} select_id - id of default select
 * @param {string} input_id - id of active input
 */
function hideUserInputForType(select_id, input_id) {
    const select = $(select_id)
    const input = $(input_id)
    select.name = "type_name"
    input.style = "display:none"
    input.name = "not_type_name"

}

/**
 * Checks if preiod is valid
 * @param {string} from 
 * @param {string} to 
 */
function validatePeriod(from, to) {
    if (!from || !to) return false;
    from_date = new Date(from);
    to_date = new Date(to);
    if (to_date < from_date) return false;
    return true;
}

/**
 * Validate if name of business was provided
 */
function validateNewBusiness(form){
    error = false
    field = form.querySelector("[name=new_business_name")
    if(!field.value){
        message="Подайте название бизнеса"
        error = true
    }
    if(error) {
        alert(message)
        return false
    }
    return true
}