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
    var st_name = getItemFromStorage(sessionStorage, 'active_storage')
    for (var header of elements.existing_headers) {
        header.innerHTML = ""
        header.innerHTML = st_name
    }
}

/**
 * @depracated
 * @param {Element} toolbar - toolbar to activate.
 *  If not provided function deactivate current toolbar
 */
function activateToolbar(toolbar) {

    if (active_toolbar) active_toolbar.className = "hidden";
    if (toolbar) {
        toolbar.className = "toolbar";
        active_toolbar = toolbar;
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
 * @param {Element} section - id of section to activare 
 */
function activateSection(new_active_section) {
    if (active_section) active_section.style = "display:none;"
    active_section = new_active_section;
    // ---------------  ??
    elements.order_statistics.style = "display:none"
    // ----------------
    new_active_section.style = "display:flex";
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
 * @param {Element} from - toolbar to hide
 * @param {Element} to - toolbar to show
 */
function switchToolbar(from, to) {
    if (from) from.className = "hidden";
    else {
        for (tb of elements.existing_toolbars) {
            tb.className = "hidden"
        }
    }
    if (to) to.className = "active-toolbar"
}

/**
 * Change section that currently works as query section.
 * @package gui_updaters
 * @param {Element} from - id of element to switch from
 * @param {Element} to - id of element to switch on
 */
function switchSection(from, to){
    if(from) from.style = "display:none"
    if(to) to.style = "display:block"
    from.style = "display:none;";
    to.style = "display:block;";
}

/**
 * Remove elements, that was added to container dynamically
 * @param {Element} container - container, where chil will be cleared
 * @param {int} default_number - number of children to left
 */
function returnToDefaultChildNumber(container, default_number=2){
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

/**
 * Set's current date in date field
 * @package gui_updaters 
 * @param {Element} date_input - id of date input
 */
function setCurrentDate(date_input) {
    var today = new Date();
    date_input.valueAsDate = today;
}
