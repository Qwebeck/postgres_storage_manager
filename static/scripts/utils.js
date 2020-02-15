/**
 * Check if option exists in select
 * @param {*} select 
 * @param {*} value 
 */
function optionExists(select, value) {
    if (!select.options) return false;
    for (i = 0; i < select.options.length; ++i) {
        if (select.options[i].value == value) {
            return true;
        }
    }
    return false;
}

/**
 * Creates Promise, that will send request given url.
 * @package utils
 * @param {string} url - endpoint
 * @param {dict} data - json data. Leve empty if send a POST request
 * @param {string} method - request method
 * @param {string} storage - storage, where will be stored new data 
 * @param {string} storage_key - key, under which data will be stored
 * @returns new Promise
 */
function sendRequest(url, data, method, storage = null, storage_key = null) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.timeout = 2000;
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                if (method == "GET") {
                    result = JSON.parse(xhr.responseText)
                    if (storage) saveItemInStorage(storage, storage_key, result)
                    resolve(result)
                } else {
                    resolve();
                }
            }
            else if(xhr.readyState == XMLHttpRequest.DONE){
                var response = JSON.parse(xhr.responseText)
                alert(response.message)
            }
        };
        xhr.ontimeout = function () {
            reject('timeout')
        }
        xhr.send(JSON.stringify(data))
    }
    )
}



/**
 * Return element by name.  
 * @param {Array<String>} labels - possible labels
 * @param {Array} values - data from which you need to get the element
 * @param {string} name - name of element you want get
 * @returns {*} value
 */
function getByName(labels, values, name) {
    return values[labels.indexOf(name)]
}


/**
 * Checks if given element, be packed to jsono bject
 * @param {*} element 
 */
const isValidElement = element => {
    return element.name && element.value
}

/**
 * Converts form output to dictionary 
 * @param {*} elements - list of form elements 
 */
const formToDict = elements => [].reduce.call(elements, (data, element) => {
    if (isValidElement(element)) data[element.name] = element.value
    return data
}, {})



/**
 * Save data in given storage. Sets flag is_modified to false,
 *  indicating by this that data is up to date
 * @package utils.js
 * @param storage - local or session sotrage
 * @param data - data to store
 * @param key - key to assign a value 
 */
function saveItemInStorage(storage, key, data, flag = false) {
    var dict = {
        is_modified: flag,
        data: data
    };
    dict = JSON.stringify(dict)
    storage.setItem(key, dict)
}

/**
 * Set is_modified on true in storage
 * @param {*} storage 
 * @param {*} key 
 */
function setModifiedFlagOnItem(storage, key) {
    console.log(key)
    i = getItemFromStorage(storage, key)
    saveItemInStorage(storage, key, i.data, true)
}
/**
 * Converts item from storage from Json String to dict
 * @param {*} storage 
 * @param {string} key
 * @returns dict
 */
function getItemFromStorage(storage, key) {
    var data = storage.getItem(key)
    try {
        data = JSON.parse(data)
    } catch (e) {
    }
    return data
}

/**
 * Return values zipped with headers
 * @package utils
 * @param {{}} header - keys
 * @param {string[]} values - values
 */
function zip_in_dict(header, values) {
    dict = {}
    header.map((element, i) => dict[element] = values[i])
    return dict
}

function catch_error(error) {
    console.log("Exit status code is: ", error);
}

/**
 * Parse headers from dictionary to array of strings
 * @package utils
 * @param {{}} data_row - row, to parse headers from
 * @param {string[]} ignore_columns - names of columns to ignore during header parsing 
 * @returns {string[]} array of headers 
 */
function parseHeadersFromDataRow(data_row, ignore_columns) {
    keys = Object.keys(data_row);
    headers = keys.filter(key => (ignore_columns.indexOf(key) === -1));
    return headers
}


/**
 * Checks if value is object or null. If object - returns if_not_null field from his object 
 * @param {*} value - elemnt to check is null
 * @param {*} if_null - value if null
 * @param {*} if_not_null - field of object if value is not null
 */
function coalesce(value, if_null, if_not_null) {
    if (value) {
        return value[if_not_null]
    }
    else {
        return if_null
    }
}


/**
 * Covert array of objects to object of objects
 * @param {string} key_name - field, that will be used as key
 * @param {{}} data - data, that should be converted
 * @returns {{}} Object
 */
function convertToObject(key_name, data){
    var converted = {}
    data.forEach(element => {
        var key = element[key_name]
        converted[key] = element
    });
    return converted
}