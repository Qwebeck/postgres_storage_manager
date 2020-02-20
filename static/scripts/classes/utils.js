
/**
 * Update values of headers, with name of actively selected storage 
 * @package classes/utils
 */
function updateHeaders() {
    // var st_name = se(sessionStorage, 'active_storage')
    var st_name = sessionStorage.getItem('active_storage')
    for (var header of containers_and_elements.existing_headers) {
        header.innerHTML = ""
        header.innerHTML = st_name
    }
}


/**
 * Creates Promise, that will send request given url.
 * @package classes/utils
 * @param {string} url - endpoint
 * @param {dict} data - json data. Leve empty if send a POST request
 * @param {string} method - request method
 * @param {string} storage - storage, where will be stored new data 
 * @param {string} storage_key - key, under which data will be stored
 * @returns new Promise
 */
function sendRequest(url, data, method) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.timeout = 5000;
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                if (method == "GET") {
                    result = JSON.parse(xhr.responseText)
                    resolve(result)
                } else {
                    resolve();
                }
            }
            else if (xhr.readyState == XMLHttpRequest.DONE) {
                var response = JSON.parse(xhr.responseText)
                alert(response.message)
            }
        };
        xhr.ontimeout = function () {
            reject('Слишком долгое время соединения')
        }
        xhr.send(JSON.stringify(data))
    }
    )
}


/**
 * Update all data dictionaries, where is_modified flag is set to true.
 * @package classes/utils
 * @returns {Promise} - promise, that resolves only after all data was updated
 */
function updateData() {
    waitingAnimation(true)
    var itemUpdators = []
    for (let data_item of Object.values(data_dicts)) {
        if (!data_item.is_actual) {
            var url = data_item.url_creation_handler()
            var req = sendRequest(url, "", "GET")
            let toUpdate = req.then(data => {
                if (data_item.on_update) data_item.on_update(data)
                if (data_item.data_processor) data = data_item.data_processor(data)
                if (data_item.emit) {
                    let event = new CustomEvent(data_item.emit, { detail: data })
                    document.dispatchEvent(event)
                }
                data_item.data = data
                data_item.is_actual = true
                return Promise.resolve()
            })
            itemUpdators.push(toUpdate)
        }
    }
    waitingAnimation(false)
    return Promise.all(itemUpdators)
}

/**
 * Turns on/off waiting animation. 
 * @package classes/utils
 * @param {boolean} condition 
 * @param {int} parent_id - id of element, that called waiting section
 */
function waitingAnimation(condition, parent_id) {
    if (condition == true) {
        waiting_section_parent_id = parent_id
        containers_and_elements.block_with_waiting_anim.style = "display:block;"
    }
    else {
        containers_and_elements.block_with_waiting_anim.style = "display:none;"
    }
}


/**
 * Covenrt array of objects to object of objects with `key_name` as key
 * @package classs/utils
 * @param {string} key_name - field, that will be used as key
 * @param {{}} data - data, that should be converted
 * @returns {{}} Object
 */
function convertToObject(key_name, data) {
    var converted = {}
    data.forEach(element => {
        var key = element[key_name]
        converted[key] = element
    });
    return converted
}


/**
 * Util for filling select with values. Work with assumption, that options are list 
 * of Objects with one key and one value:  {key:value} 
 * @package element_creators
 * @param {Element[]} list_of_selects - list of selects, to fill with new options, provided in data
 * @param {string[]} options - list of new options
 * @param {string[]} ignore - options, that should be ignored
 * @param
 */
function updateDatalist(datalist, options, ignore = []) {
    if (!options) {
        console.log('fillSelects: No options provided.')
        return
    }
    for (let item of options) {
        // Object.values(item) - makes fill select independent from item key
        let value = null
        if (typeof item === 'object') value = Object.values(item)[0]
        else value = item

        if (optionExists(datalist, value) || ignore.includes(value)) continue;
        let new_option = createElement('option', { 'innerHTML': value, 'value': value })
        datalist.appendChild(new_option)
    }

}


/**
 * Wrapper around `document.createElement` that after creation assign options to this element
 * @package
 * @param {string} type - type of object to be created 
 * @param {{key:value}} options - options, that will be assigned to element
 * @returns {Element} created element.
 */
function createElement(type, options = {}) {
    var element = document.createElement(type)
    for (const [key, val] of Object.entries(options)) {
        if (key.localeCompare("innerHTML") == 0) {
            element.innerHTML = val
            continue
        }
        element.setAttribute(key, val)
    }
    return element
}

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
 * Create table for data. During table creation executes action for each row
 * @package element_creators
 * @param {string[][]} data - Data for table creation
 * @param {function({},[],Element)} action - handler, that that performs some action on current row. 
 * createTable passes in it three params: data(dict), headers(array), newly created table element.
 * @param {Element} outputSection - id of section where new table will be created
 * @param {boolean} append - append information to output section
 * @param {string[]} ignore_columns - columns from data, that shouldn't be added to table
 */
function createTable(data, action, outputSection = containers_and_elements.output_section, append = false, ignore_columns = []) {
    if (!append) outputSection.innerHTML = ""
    if (!data || data.length == 0) {
        var empty = document.createElement('h3')
        empty.innerHTML = "Не найдено результатов"
        outputSection.appendChild(empty)
        return
    }
    const newTable = document.createElement('table')
    createHeader(data, ignore_columns, newTable)
    for (var row of data) {
        const newRow = document.createElement('tr')
        newRow.className = "data-row"
        for (var cell in row) {
            if (ignore_columns.includes(cell)) continue;
            const newCell = document.createElement('td');
            newCell.innerHTML = row[cell]
            newCell.className = "data-cell"
            newRow.appendChild(newCell)
        }
        if (action !== null) action(row, headers, newRow)
        newTable.appendChild(newRow)
    }
    outputSection.appendChild(newTable)
}

/**
 * Creates button for provided action and bind it with object
 * @package element_creators
 * @param {*} row_info - inforamtion in current row 
 * @param {*} node - html node, to append button
 * @param {*} identifier_name - name of field in `row_info` which value, that will be assigned to button
 * @param {*} action_name - text, that will be displayed on button
 * @param {*} callback - callback for action
 */
function createActionButton(row_info, node, identifier_name, action_name, callback) {
    var button = document.createElement('button')
    button.value = row_info[identifier_name]
    button.innerHTML = action_name
    button.onclick = callback
    button.className = "action-button"
    node.appendChild(button)
}


/**
 *  Creates row with headers for table 
 * @package element_creators
 * @param {string[][]} data - elements headers will be parsed from 
 * @param {string[]} ignore_columns - columns in data, that will be ignored
 * @param {ObjectConstructor} table - table, to append headers
 */
function createHeader(data, ignore_columns, table) {
    const headers = parseHeadersFromDataRow(data[0], ignore_columns);
    var headerRow = document.createElement('tr');
    for (var header of headers) {
        const newCell = document.createElement('th')
        newCell.innerHTML = header
        headerRow.appendChild(newCell)
    }
    table.appendChild(headerRow);
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
 * Remove elements, that was added to container dynamically
 * @param {Element} container - container, where chil will be cleared
 * @param {int} default_number - number of children to left
 */
function returnToDefaultChildNumber(container, default_number = 2) {
    while (container.children.length > default_number) {
        container.removeChild(container.firstChild)
    }
    number_inputs = container.querySelectorAll("input[name=number]")
    type_inputs = container.querySelectorAll("input[name=product_type]")
    for (const input of number_inputs) {
        input.value = ""
    }
    for (const input of type_inputs) {
        input.value = ""
    }

}

/**
 * Add new section with select in text input for type selection. Executed during order performing.
 * @package element_creators
 * @param {Element} container - container where to add new product fields
 * @param {function(select, input, container)} new_el_processor - action, to which will be passed newly created element.
 * @param {function()} onchange - will be executed on element change
 */
function addProductField(container, new_el_processor = null, last_entered_val_from_end_pos = 2, onchange = null) {
    var quantityInputs = container.querySelectorAll("[name=number]");
    // var available_types = getItemFromStorage(sessionStorage,'types');
    if (last_entered_val_from_end_pos && quantityInputs[quantityInputs.length - last_entered_val_from_end_pos] && !quantityInputs[quantityInputs.length - last_entered_val_from_end_pos].value) return
    var prod_ord = createElement('div', { 'class': 'product_order', 'name': 'product_order' })
    var data_input = createElement('input', { 'type': 'text', 'name': 'product_type', 'list': 'available_types', 'placeholder': 'Тип', 'autocomplete': 'off' })
    var quantity_input = createElement('input', { 'type': 'text', 'name': 'number', 'placeholder': 'Количество', 'autocomplete': 'off' })
    if (!onchange) {
        quantity_input.onchange = _ => {
            addProductField(container, null, 1)
        }
    } else {
        quantity_input.onchange = onchange
    }
    prod_ord.appendChild(data_input);
    prod_ord.appendChild(quantity_input);
    container.appendChild(prod_ord);
    if (new_el_processor) new_el_processor(data_input, quantity_input, prod_ord);

}
