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

