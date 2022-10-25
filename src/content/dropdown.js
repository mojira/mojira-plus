/*
Build the message dropdown, the "Add message" button, and modify JIRA text areas to add the button and allow shortcut input
Relies on `insertMessage.js`, `util.js`, and `vars.js`
*/

/**
 * Gathers all shortcuts that don't belong to a category or whose category is invalid
 * @param {string} project The project the current ticket is in
 * 
 * @returns {[Message]} All relevant messages
 */
function getOtherMessages(project) {
    const validCategories = categories.map(cat => cat.category);
    const projectMessages = messages[project];

    if (!projectMessages) return [];

    return Object.values(projectMessages).filter(
        ({ category }) => !category || !validCategories.includes(category)
    ).sort(
        (a, b) => a.messageKey.localeCompare(b.messageKey)
    );
}

/**
 * Gathers all shortcuts for the given category
 * @param {string} category The category to gather the shortcuts for; undefined 
 * @param {string} project The project the current ticket is in
 * 
 * @returns {[Message]} All relevant messages
 */
function getMessagesForCategory(category, project) {
    const projectMessages = messages[project];

    if (!projectMessages) return [];

    return Object.values(projectMessages).filter(
        message => message.category && message.category === category
    ).sort(
        (a, b) => a.messageKey.localeCompare(b.messageKey)
    );
}

/**
 * Build a list item element for a message
 * @param {string} shortcut The shortcut of the message
 * @param {Message} message The message to get the list item for
 * @param {HTMLTextAreaElement} textArea The text are that this dropdown is for
 * @param {string} project The project the current ticket is in
 * 
 * @returns {HTMLLIElement}
 */
function getListItemForMessage(message, textArea, project) {
    var shortcutInfo = document.createElement('small');
    shortcutInfo.classList.add('helper-message-shortcut');
    shortcutInfo.setAttribute('data-mojira-helper-message', message.shortcut);
    shortcutInfo.textContent = `[${prefix}${message.shortcut}]`;

    var messageItem = document.createElement('a');
    messageItem.classList.add('wiki-edit-operation');
    messageItem.setAttribute('data-mojira-helper-message', message.shortcut);
    messageItem.textContent = `${message.name} `;
    messageItem.append(shortcutInfo);

    messageItem.addEventListener('click', async event => {
        try {
            var shortcut = event.target.getAttribute('data-mojira-helper-message');
            await insertText(textArea, shortcut, project);
        } catch (error) {
            sendErrorMessage(error);
        }
    });

    var messageDropdownItem = document.createElement('li');
    messageDropdownItem.append(messageItem);

    return messageDropdownItem;
}

/**
 * Creates the HTML element for a category of messages
 * 
 * @param {string} name The name of the section
 * @param {[Message]} messages The messages in the section
 * @param {HTMLTextAreaElement} textArea The text area that this dropdown is for
 * @param {string} project The project the current ticket is in
 * 
 * @returns {HTMLDivElement} The section element
 */
function getSection(name, messages, textArea, project) {
    const section = document.createElement('div');
    section.classList.add('aui-dropdown2-section');

    const header = document.createElement('div');
    header.classList.add('aui-dropdown2-heading');
    header.innerText = name;
    section.append(header);

    const sectionList = document.createElement('ul');
    section.append(sectionList);
    // dropdownList.classList.add('aui-list-truncate', 'mojira-helper-messages-dropdown');

    for (const message of messages) {
        sectionList.append(getListItemForMessage(message, textArea, project));
    }
    return section;
}

/**
 * Gets the message dropdown list for a specific project
 * @param {number} editorCount ID of the editor
 * @param {HTMLTextAreaElement} textArea The text area that this dropdown is for
 * @param {string} project The project the current ticket is in
 * 
 * @returns {HTMLDivElement} The dropdown list element
 */
function getDropdownList(editorCount, textArea, project) {
    const dropdown = document.createElement('div');
    dropdown.classList.add('aui-dropdown2', 'aui-style-default', 'wiki-edit-dropdown');
    dropdown.id = `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`;

    const dropdownList = document.createElement('div');
    dropdownList.classList.add('mojira-helper-messages-dropdown');
    dropdown.append(dropdownList);

    for (const category of categories) {
        const messages = getMessagesForCategory(category.category, project);
        dropdownList.append(getSection(category.name, messages, textArea, project));
    }

    const otherMessages = getOtherMessages(project);
    if (otherMessages.length > 0) {
        dropdownList.append(getSection("Other", otherMessages, textArea, project));
    }

    return dropdown;
}

/**
 * Gets the message dropdown button
 * @param {number} editorCount A unique identifier for this wikifield
 * 
 * @returns {HTMLAnchorElement} The button element
 */
function getMessageButton(editorCount, disabled) {
    var messageButtonIcon = document.createElement('span');
    messageButtonIcon.classList.add('aui-icon', 'aui-icon-small', 'aui-iconfont-add-comment');
    const title = disabled ? 'Sorry, you cannot use this here' : 'Add Message';
    messageButtonIcon.textContent = title;

    var messageButton = document.createElement('a');
    messageButton.classList.add(
        'aui-button',
        'aui-button-subtle',
        'aui-dropdown2-trigger',
        'wiki-edit-operation-dropdown',
        'wiki-edit-messages-trigger',
        'wiki-edit-tooltip'
    );
    if (disabled) {
        messageButton.setAttribute('disabled', true);
        messageButton.classList.add('mojira-helper-messages-button-disabled');
    }
    messageButton.href = '#';
    messageButton.title = title;
    messageButton.tabIndex = -1;
    messageButton.setAttribute('aria-controls', `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`);
    messageButton.setAttribute('aria-expanded', false);
    messageButton.setAttribute('aria-haspopup', true);
    messageButton.setAttribute('aria-owns', `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`);
    messageButton.setAttribute('original-title', 'Add Message')
    messageButton.append(messageButtonIcon);

    return messageButton;
}

/**
 * Adds a dropdown for selecting a message to the wikifield
 * @param {Element} element The wikifield to be modified
 * @param {HTMLTextAreaElement} textArea The text area that this dropdown is for
 * @param {string} project The project the current ticket is in
 * @param {number} editorCount A unique identifier for this wikifield
 * @param {disabled} disabled Whether the dropdown button is disabled
 * 
 * @returns {boolean} Whether the dropdown could be successfully added
 */
function addDropdownToWikifield(element, textArea, project, editorCount, disabled) {
    if (element.querySelector('.wiki-edit-toolbar') === null || element.querySelector('.wiki-edit-toolbar-last') === null) {
        return false;
    }

    if (!disabled) {
        var dropdownList = getDropdownList(editorCount, textArea, project);
        element.querySelector('.wiki-edit-toolbar').before(dropdownList);
    }

    var messageButton = getMessageButton(editorCount, disabled);

    var messageButtonGroup = document.createElement('div');
    messageButtonGroup.classList.add('aui-buttons');
    messageButtonGroup.append(messageButton);

    element.querySelector('.wiki-edit-toolbar-last').before(messageButtonGroup);

    return true;
}

/**
 * Modifies a wikifield so that you can add messages to it
 * @param {Element} element The wikifield to be modified
 * @param {string} project The project the current ticket is in
 * @param {number} editorCount A unique identifier for this wikifield
 */
function modifyWikifield(element, project, editorCount) {
    const disabled = !userIsVolunteer;

    element.classList.add('mojira-helper-messages-field');

    var textArea = element.querySelector('textarea');
    textArea.classList.add(disabled ? 'mojira-helper-messages-textarea-disabled' : 'mojira-helper-messages-textarea');
    textArea.setAttribute('helper-messages-project', project);

    if (!addDropdownToWikifield(element, textArea, project, editorCount, disabled)) {
        textArea.classList.add('mojira-helper-messages-textarea-shortcut-only');

        setTimeout(() => {
            try {
                if (addDropdownToWikifield(element, textArea, project, editorCount, disabled)) {
                    textArea.classList.remove('mojira-helper-messages-textarea-shortcut-only');
                }
            } catch (error) {
                sendErrorMessage(error);
            }
        }, 1000);
    }
}
