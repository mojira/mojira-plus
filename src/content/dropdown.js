/*
Build the message dropdown, the "Add message" button, and modify JIRA text areas to add the button and allow shortcut input
Relies on `insertMessage.js`, `util.js`, and `vars.js`
*/

/**
 * Gets the message dropdown list for a specific project
 * @param {HTMLTextAreaElement} textArea The text area that this dropdown is for
 * @param {string} project The project the current ticket is in
 * 
 * @returns {HTMLUListElement} The dropdown list element
 */
function getDropdownList(textArea, project) {
    /**
     * @type {{
     *  key: string,
     *  element: Element
     * }[]}
     */
    const messageDropdownItems = [];

    for (var shortcut in messages[project]) {
        var message = messages[project][shortcut];

        var shortcutInfo = document.createElement('small');
        shortcutInfo.classList.add('helper-message-shortcut');
        shortcutInfo.setAttribute('data-mojira-helper-message', shortcut);
        shortcutInfo.textContent = `[${prefix}${shortcut}]`;

        var messageItem = document.createElement('a');
        messageItem.classList.add('wiki-edit-operation');
        messageItem.setAttribute('data-mojira-helper-message', shortcut);
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

        messageDropdownItems.push({
            key: message.messageKey,
            element: messageDropdownItem
        });
    }

    messageDropdownItems.sort((a, b) => {
        return a.key.localeCompare(b.key);
    });

    var dropdownList = document.createElement('ul');
    dropdownList.classList.add('aui-list-truncate', 'mojira-helper-messages-dropdown');

    for (item of messageDropdownItems) {
        dropdownList.append(item.element);
    }

    return dropdownList;
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
 * 
 * @returns {boolean} Whether the dropdown could be successfully added
 */
function addDropdownToWikifield(element, textArea, project, editorCount, disabled) {
    if (element.querySelector('.wiki-edit-toolbar') === null || element.querySelector('.wiki-edit-toolbar-last') === null) {
        return false;
    }

    if (!disabled) {
        var dropdownList = getDropdownList(textArea, project);

        var dropdownElement = document.createElement('div');
        dropdownElement.classList.add('aui-dropdown2', 'aui-style-default', 'wiki-edit-dropdown');
        dropdownElement.id = `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`;
        dropdownElement.append(dropdownList);

        element.querySelector('.wiki-edit-toolbar').before(dropdownElement);
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
function modifyWikifield(element, project, editorCount, disabled) {
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
