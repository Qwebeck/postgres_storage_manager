/**
 * @deprecated Is still in usage ?
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
 * Create table for data. During table creation executes action for each row
 * @package element_creators
 * @param {string[][]} data - Data for table creation
 * @param {function({},[],Element)} action - handler, that that performs some action on current row. 
 * createTable passes in it three params: data(dict), headers(array), newly created table element.
 * @param {Element} outputSection - id of section where new table will be created
 * @param {boolean} append - append information to output section
 * @param {string[]} ignore_columns - columns from data, that shouldn't be added to table
 */
function createTable(data, action, outputSection = customElements.output_section, append = false, ignore_columns = []) {
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
 * Util for filling select with values. Work with assumption, that options are list 
 * of Objects with one key and one value:  {key:value} 
 * @package element_creators
 * @param {Element[]} list_of_selects - list of selects, to fill with new options, provided in data
 * @param {[{}]} options - list of new options
 * @param
 */
function fillSelects(list_of_selects, options, never_delete = 'new') {
    for (var select of list_of_selects) {
        cleared_children = []
        // try to find smarter solution
        for (var child of select.children) {
            if (child.value == never_delete || child.value == 'default') {
                cleared_children.push(child)
            }

        }
        var child = select.lastElementChild;
        while (child) {
            select.removeChild(child);
            child = select.lastElementChild;
        }
        for (child of cleared_children) {
            select.appendChild(child)
        }
        if (!options) {
            console.log('fillSelects: No options provided.')
            continue
        }
        for (item of options) {
            // Object.values(item) - makes fill select independent from item key
            var value = Object.values(item)[0]
            if (optionExists(select, value)) continue;
            var new_option = createElement('option',{'innerHTML':value, 'value':value})
            select.appendChild(new_option)
        }
    }
}


/**
 * Wrapper around `document.createElement` that after creation assign options to this element
 * @package
 * @param {string} type - type of object to be created 
 * @param {{key:value}} options - options, that will be assigned to element
 * @returns {Element} created element.
 */
function createElement(type, options = {}){
    var element = document.createElement(type)
    for (const [key, val] of Object.entries(options)){
        if (key.localeCompare("innerHTML") == 0) {
            element.innerHTML = val
            continue
        }
        element.setAttribute(key, val)
    }
    return element
}
/**
 * Add new section with select in text input for type selection. Executed during order performing.
 * @param {string} container_id - id of container element
 */
function addProductField(container_id){
    var quantityInputs = document.getElementsByName("number");
    var available_types = getItemFromStorage(sessionStorage,'types');
    if(!quantityInputs[quantityInputs.length - 2].value) return
    const container = document.getElementById(container_id);
    var prod_ord = createElement('div', {'class':'product_order', 'name':'product_order'})
    var select = createElement('select',{'name':'product_type'})
    var default_option = createElement('option',{'selected':'selected', 'value': 'default', 'innerHTML':'Тип'})
    var quantityInput = createElement('input',{'type':'text','name':'number','placeholder':'Количество', 'onchange':_=> addProductField(container_id)})
    select.appendChild(default_option);
    fillSelects([select],available_types.data.result);
    prod_ord.appendChild(select);
    prod_ord.appendChild(quantityInput);
    container.appendChild(prod_ord);
}
