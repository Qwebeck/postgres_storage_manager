/**
 * @package url_creators 
 * Package describes logic of url creation for available endpoints
 */

function createUrlDependingOnOrder(endpoint){
    var order_id = sessionStorage.getItem('current_order_id')
    if(!order_id) return '/mock'
    return endpoint + order_id
}

function createUrlDependingOnStorage(endpoint){
    var current_storage = sessionStorage.getItem('active_storage')
    return endpoint + current_storage
}


/**
 * @package order_utils
 * Generates an appropriate order url, based on time inputs and history selection
 */
function createOrderUrl() {
    let form = forms.order_lookup.element
    const from = form.from.value;
    let to = form.to.value;
    if(!validatePeriod(from, to)) {
        var url = '/get_orders';
    }else{
        to = new Date(to)
        to.setDate(to.getDate() + 1)

        var url = `/get_orders/from/${from}/to/${to.toISOString().split('T')[0]}`;
    };
    let active_storage = sessionStorage.getItem('active_storage')
    let is_history = sessionStorage.getItem('is_history')
    url += `/${active_storage}` 
    if(JSON.parse(is_history)){
        url += '?history=true';
    }
    return url;
}

function createExpandOrderUrl(){
    let is_history = JSON.parse(sessionStorage.getItem('is_history'))
    let endpoint = is_history ? '/expand_history_order/id/' : '/expand_order/id/'  
    return createUrlDependingOnOrder(endpoint)
}


/**
 * tmp handler to not break things
 */
function mockUrl() {
    return '/mock'
}
