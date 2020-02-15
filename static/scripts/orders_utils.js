/**
 * Modul contains utils, that could be used only with work with orders 
 */

/**
 * @package order_utils
 * Generates an appropriate order url, based on time inputs and history selection
 */
function createOrderUrl() {
    from = elements.show_orders_from_input.value;
    to = elements.show_orders_to_input.value;
    if(!validatePeriod(from, to)) {
        url = '/get_orders';
    }else{
        const to = new Date(to)
        to.setDate(to.getDate() + 1)

        url = `/get_orders/from/${from}/to/${to.toISOString().split('T')[0]}`;
    };
    active_storage = sessionStorage.getItem('active_storage')
    url += `/${active_storage}` 
    if(elements.is_history.checked){
        url += '?history=true';
    }
    return url;
}

/**
 * Assign order_id to every button, that have order-button class
 *@param order_id 
 */
function assignOrderIdToButtons(order_id){
    btns = document.getElementsByClassName('order-button');
    for(btn of btns){
        btn.value = order_id;
    }
}