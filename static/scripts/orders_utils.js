/**
 * Modul contains utils, that could be used only with work with orders 
 */

/**
 * @package order_utils
 * Generates an appropriate order url, based on time inputs and history selection
 */
function createOrderUrl() {
    from = containers_and_elements.show_orders_from_input.value;
    to = containers_and_elements.show_orders_to_input.value;
    if(!validatePeriod(from, to)) {
        url = '/get_orders';
    }else{
        const to = new Date(to)
        to.setDate(to.getDate() + 1)

        url = `/get_orders/from/${from}/to/${to.toISOString().split('T')[0]}`;
    };
    active_storage = sessionStorage.getItem('active_storage')
    url += `/${active_storage}` 
    if(containers_and_elements.is_history.checked){
        url += '?history=true';
    }
    return url;
}
/**
 * @package order_utils
 * Creates expand order url for provided id
 */
function createExpandOrderUrl(){
    var order_id = sessionStorage.getItem('current_order_id')
    return '/expand_order/id/' + order_id
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