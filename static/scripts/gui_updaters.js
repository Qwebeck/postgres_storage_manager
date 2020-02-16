/**
 * Turns on/off waiting animation. 
 * @package gui_updaters
 * @param {boolean} condition 
 */
function waitingAnimation(condition) {
    if (condition == true) {
        containers_and_elements.block_with_waiting_anim.style = "display:block;"
    }
    else {
        containers_and_elements.block_with_waiting_anim.style = "display:none;"
    }
}

/**
 * Update values of headers, with name of actively selected storage 
 * @package gui_updaters
 */
function updateHeaders() {
    var st_name = getItemFromStorage(sessionStorage, 'active_storage')
    for (var header of containers_and_elements.existing_headers) {
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
        toolbar.className = "active-toolbar";
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
 * @param {Element} section - id of section to activate 
 */
function activateSection(new_active_section) {
    if (active_section) active_section.style = "display:none;"
    active_section = new_active_section;
    // ---------------  ??
    containers_and_elements.order_statistics.style = "display:none"
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
        containers_and_elements.output_section.style = "width:100%";
        containers_and_elements.query_section.style = "display:none";
        updateOrdersInfo(history = true);
    } else {
        containers_and_elements.query_section.style = "display:block";
        containers_and_elements.output_section.style = "width:65%";
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
        for (tb of containers_and_elements.existing_toolbars) {
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
function switchSection(from, to) {
    if (from) from.style = "display:none"
    if (to) to.style = "display:block"
}

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
 * @deprecated - ?
 * previously - switchUserInput
 * Display or hide user input depending on selected value
 * @param {*} e - ? 
 * @param {string} from - id of element to switch from 
 * @param {string} input_id - id of element to delete text from
 * @param {string} based_on - id of element, which value decides about input toggling
 * @param {string} when - value, that should be, to display text input
 */
function toggleUserInput(e, from, input_id, based_on = 'active_storage', when = "new") {
    var newVal = document.getElementById(based_on).value;
    if (newVal.localeCompare(when) === 0) {
        document.getElementById(from).style = "display:block;"
        return true
    }
    else {
        document.getElementById(from).style = "display:none;"
        document.getElementById(input_id).value = "";
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

/**
 * Unibind handlers from provided buttons, and changes their style to inactive 
 * @package gui_updaters
 *  @param {{button:Element,
    classname:string
    handler: Function,
    ....}[]} buttons - array of button descriptions - buttons, to deactivate
 * @returns none
 */
function deactivateActionButtons(buttons) {
    for (button_desription of buttons) {

        button_desription.button.onclick = _ => (alert('Недоступно во время изменения заказа'))
        button_desription.button.className = "disabled"
    }
}
/**
 * Bind buttons to corresponding handlers and corresponding classes
 * @package gui_updaters
 * @param {{button:Element,
            classname:string
            handler: Function,
            text:string}[]} buttons - array of button descriptions
 */
function activateActionButtons(buttons) {
    for (button_desription of buttons) {
        if (!('button' in button_desription) || !('classname' in button_desription) || !('handler' in button_desription)) {
            console.log('Wrong format for ' + button_desription)
            continue
        }
        button_desription.button.onclick = button_desription.handler
        button_desription.button.className = button_desription.classname
        button_desription.button.innerHTML = button_desription.text

    }
}