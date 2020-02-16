// change this function

function activeStorageChanged(event){
    event.preventDefault()
    if(!toggleUserInput(event, 'new_storage_name', 'new_storage')){
        var val = event.target.value
        var addingStorageConatiner = document.getElementById('new_storage_name')
        sessionStorage.setItem('active_storage', val)
        
        addingStorageConatiner.style = "display:none";
        updateHeaders()

        getInfoAboutStorage(val, on_work_with_storage)
    }
    // means that it is submit on button
    else{
        // Here in case if user chosed to add new business
        newStorageInput = document.getElementById('new_storage')
        var val = newStorageInput.value
        var addingStorageConatiner = document.getElementById('new_storage_name')
    }
}

function addStorage(e){
    e.preventDefault()
    if(!validateNewBusiness(containers_and_elements.business_addition_form)) return
    var addingStorageContainer = document.getElementById('new_storage_name')
    var newStorageInput = document.getElementById('new_storage')
    var newStorageName = newStorageInput.value
    newStorageInput.value = "";
    data = {
        'name':newStorageName
    }
    var addBusiness = sendRequest('/add_new_business',data,"POST")
    addBusiness.then(
        _ => {
            sessionStorage.setItem('active_storage', newStorageName)
            getInfoAboutStorage(newStorageName, on_work_with_storage)
        }        
    )
    

    addingStorageContainer.style = "display:none;"
    
}




/**
 * Add product on storage
 * @param {*} e 
 * @param {*} storage_id 
 */
function addProduct(e) {
    e.preventDefault()
    storage_id = sessionStorage.getItem('active_storage')
    // console.log('Storage id ' + storage_id)
    let form = e.target
    if (validateStorageForm(form) == false ) {
        alert('Bad validation')
        return
    }
    let data = formToDict(form.elements)
    let url = '/add_items_on_storage/id/' + storage_id
    let post = sendRequest(url, data, "POST")
    // id = 
   
    // on_work_with_storage()
    post.then(_=>{
            setModifiedFlagOnItem(sessionStorage,'storage_stats')
            setModifiedFlagOnItem(sessionStorage,'types')
            hideUserInputForType('default_select_for_type','new_type')
            updateStorageInfo()
        }
        )
        .catch(console.error)
    form.reset()
    
}

/**
//  * @deprecated
//  * Returns business by his id
//  * @package storage.js
//  * @param {*} id 
//  * @returns business in case of succes. Null in case of failure.
//  */
// function getStorageById(id){
//     businesses = getItemFromStorage(localStorage,'businesses').data
//     // console.log(businesses)
//     for(var business of businesses){
//         b_id = getByName(businesses.headers,business,"id")
//         if (b_id == id) {
//             b = zip_in_dict(businesses.headers, business)
//             return b; 
//         }
//     }
//     return null
// }

/**
 * Fill ouput section with info about statistics
 * @package - storage.js
 * @param {*} owner_id - id of business, we want to get statistics for 
 * @param {*} callback - function, that will be executed after we get statistics
 */

function getStatistics(owner_id, callback) {
    url = '/get_statistics/id/' + owner_id;

    query = sendRequest(url, "", "GET",sessionStorage,'storage_stats')
    query.then(callback)
        .catch(console.error)
}



/**
 * Util function for delete elements from storage
 * @param {*} e - onclick event 
 */
function deleteProduct(e) {
    var serial_number = e.target.value;
    // console.log(e.target)
    var url = '/delete_product'
    var data = {
        'serial_number': serial_number
    }
    
    post = sendRequest(url, data, "DELETE")
    post.then(_ => {
        e.target.parentElement.style = "display:none;"
        setModifiedFlagOnItem(sessionStorage,'storage_stats')
        setModifiedFlagOnItem(sessionStorage,'types')
        updateSelects()
    })
        
        .catch(console.error)
}

/**
 * Shows, what products of this type are available on storage
 * @param {*} e 
 */
function expandForTypes(e) {
    storage_id = sessionStorage.getItem('active_storage')
    url = '/expand_types/id/' + storage_id + '/types/' + event.target.value
    query = sendRequest(url, "", "GET");    
    
    query.then(data => createTable(data, createButtonForProductDelete))
        .catch(console.error)

    const createButtonForProductDelete = (row_info, _, rowNode) => {
        createActionButton(row_info,
            rowNode,
            "Серийный номер",
            "Удалить",
            deleteProduct
        )
    };
}




/**
 * Get all information from storage. 
 * @package storage
 * @param {*} storage_id - active storage id 
 */

function getInfoAboutStorage(storage_id, callback = null){
    waitingAnimation(true)
    sendRequest('/info_about_businesses',"","GET",sessionStorage,'businesses')
    .then(
       _ => sendRequest('/get_statistics/id/' + storage_id,"","GET",sessionStorage,'storage_stats')
    )
    .then(
        _ => sendRequest('/get_orders/'+storage_id,"","GET",sessionStorage,'pending_orders')
    )
    .then(
        _ =>  sendRequest('/get_orders/'+storage_id+"?history=true","","GET",sessionStorage,'history')
    )
    .then(
        _ =>  sendRequest('/get_types/id/'+storage_id,"","GET",sessionStorage,'types')
    ).then(
        _ => {
            if(callback){
                callback()
            }
            waitingAnimation(false)
        }
    )
}
