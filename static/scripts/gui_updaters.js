/**
 * Turns on/off waiting animation. 
 * @package gui_updaters
 * @param {boolean} condition 
 */
function waitingAnimation(condition) {
    if (condition == true) {
        elements.block_with_waiting_anim.style = "display:block;"
    }
    else {
        elements.block_with_waiting_anim.style = "display:none;"
    }
}

/**
 * Update values of headers, with name of actively selected storage 
 * @package gui_updaters
 */
function updateHeaders() {
    var headers = document.getElementsByName('storage_header')
    var st_name = getItemFromStorage(sessionStorage, 'active_storage')
    for (var header of headers) {
        header.innerHTML = ""
        header.innerHTML = st_name
    }
}

/**
 * @depracated
 * @param {string} toolbar_id - id of toolbar to activate.
 *  If not provided function deactivate current toolbar
 */
function activateToolbar(toolbar_id) {

    if (active_toolbar_id != "") document.getElementById(active_toolbar_id).className = "hidden";
    if (toolbar_id) {
        document.getElementById(toolbar_id).className = "toolbar";
        active_toolbar_id = toolbar_id;
    }
}


/**
 * Set default selected element on select
 * @package gui_updaters
 * @param {Element[]} list_of_selects - selects, where default value should be set  
 * @param {string} default_value - value, that should be set as default
 */
function setSelectedElementOnSelects(list_of_selects, default_value) {
    for (select of list_of_selects) {
        for (item of select.children) {
            if (item.innerHTML.localeCompare(default_value) === 0) {
                item.selected = "selected"
            }
        }
    }
}

/** 
 * Activate section with given id, and deactivate active section
 * @param {string} id - id of section to activare 
 */
function activateSection(id) {
    if (!(active_page_id === "")) document.getElementById(active_page_id).style = "display:none;"
    active_page_id = id;
    elements.order_statistics.style = "display:none"
    document.getElementById(active_page_id).style = "display:flex";
}

/**
 * Show or hide section for user. Executed on toggle change
 * @package gui_updaters
 * @param {*} e 
 */

function showHistory(e) {
    if (e.target.checked) {
        elements.output_section.style = "width:100%";
        elements.query_section.style = "display:none";
        updateOrdersInfo(history = true);
    } else {
        elements.query_section.style = "display:block";
        elements.output_section.style = "width:65%";
        updateOrdersInfo(history = false);
    }
}

/**
 * Change current `from` toolbar `to`. If no `from`, `to` specified - hides current toolbar 
 * @package gui_updaters
 * @param {string|boolean} from - toolbar to hide
 * @param {string|boolean} to - toolbar to show
 */
function switchToolbar(from, to) {
    if (from) document.getElementById(from).className = "hidden";
    else {
        var toolbars = document.getElementsByName('toolbar')
        for (tb of toolbars) {
            tb.className = "hidden"
        }
    }
    if (to) document.getElementById(to).className = "active-toolbar"
}

/**
 * Change section that currently works as query section.
 * @package gui_updaters
 * @param {*} from - id of element to switch from
 * @param {*} to - id of element to switch on
 */
function switchQuerySection(from, to){
    document.getElementById(from).style = "display:none;";
    document.getElementById(to).style = "display:block;";
}

/**
 * Remove elements, that was added to container dynamically
 * @param {string} container_id - container, where chil will be cleared
 * @param {int} default_number - number of children to left
 */
function returnToDefaultChildNumber(container_id, default_number=2){
    const container = document.getElementById(container_id);
    while (container.children.length>default_number){
         container.removeChild(container.firstChild)
    }
}

/**
 * @deprecated - ?
 * previously - switchUserInput
 * Display or hide user input depending on selected value
 * @param {*} e - ? 
 * @param {string} from - id of element to switch from 
 * @param {string} input_id - id of element to delete text from
 * @param {string} based_on - id of element, which value decides about input toggling
 * @param {string} when - value, that should be, to display text input
 */
function toggleUserInput(e, from, input_id, based_on = 'active_storage', when="new"){
    var newVal = document.getElementById(based_on).value;
    if( newVal.localeCompare(when) === 0){
        document.getElementById(from).style = "display:block;"
        return true
    }
    else{
        document.getElementById(from).style = "display:none;"        
        document.getElementById(input_id).value= "";
        return false
    }
    
}

