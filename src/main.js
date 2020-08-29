let variables = {};
let messages = {};
let prefix = 'mji-';

/**
 * Resolves all variables in the given string up to a certain point
 * @param {string} text The text where the variables should be resolved
 * @param {{[key: string]: string}} vars A collection of variables
 * @param {number} limit The limit for the amount of resolved variables
 */
function resolveVariables(text, vars, limit = 10) {
    if (limit == 0) {
        return text;
    }

    for (var variable in vars) {
        var varReplacement = vars[variable];
        if (varReplacement && text.includes(`%${variable}%`)) {
            text = text.split(`%${variable}%`).join(
                resolveVariables(varReplacement, vars, limit - 1)
            );
        }
    }

    return text;
}

/**
 * Gets the corresponding message for the given project from a shortcut
 * @param {string} shortcut The shortcut of the message
 * @param {string} project The project the current ticket is in
 */
async function getReplacementResult(shortcut, project) {
    var insertedText = messages[project][shortcut].message;

    if (insertedText === undefined)
        return;

    insertedText = resolveVariables(insertedText, variables[project]);

    var includesClip = false;
    var clipStart = undefined;
    var clipEnd = undefined;

    if (insertedText.indexOf('%s%') >= 0) {
        includesClip = true;
        clipStart = insertedText.indexOf('%s%');

        var clip = '';
        try {
            clip = await navigator.clipboard.readText();
        } catch (e) {
            clip = e;
        }

        insertedText = insertedText.split('%s%').join(clip.trim());
        clipEnd = clipStart + clip.trim().length;
    }

    return {
        insertedText,
        includesClip,
        clipStart,
        clipEnd
    };
}

/**
 * Modifies a wikifield so that you can add messages to it
 * @param {Element} element The wikifield to be modified
 * @param {string} project The project the current ticket is in
 * @param {number} editorCount A unique identifier for this wikifield
 */
function modifyWikifield(element, project, editorCount) {
    element.classList.add('mojira-helper-messages-field');

    var textArea = element.querySelector('textarea');
    textArea.classList.add('mojira-helper-messages-textarea');
    textArea.setAttribute('helper-messages-project', project);

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

        messageItem.addEventListener('click', event => {
            var shortcut = event.target.getAttribute('data-mojira-helper-message');
            insertText(textArea, shortcut, project);
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
    dropdownList.classList.add('aui-list-truncate', 'helper-messages-dropdown');

    for (item of messageDropdownItems) {
        dropdownList.append(item.element);
    }

    var dropdownElement = document.createElement('div');
    dropdownElement.classList.add('aui-dropdown2', 'aui-style-default', 'wiki-edit-dropdown');
    dropdownElement.id = `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`;
    dropdownElement.append(dropdownList);

    element.querySelector('.wiki-edit-toolbar').before(dropdownElement);

    var messageButtonIcon = document.createElement('span');
    messageButtonIcon.classList.add('aui-icon', 'aui-icon-small', 'aui-iconfont-add-comment');
    messageButtonIcon.textContent = 'Add Message';

    var messageButton = document.createElement('a');
    messageButton.classList.add(
        'aui-button',
        'aui-button-subtle',
        'aui-dropdown2-trigger',
        'wiki-edit-operation-dropdown',
        'wiki-edit-messages-trigger',
        'wiki-edit-tooltip'
    );
    messageButton.href = '#';
    messageButton.title = 'Add Message';
    messageButton.tabIndex = -1;
    messageButton.setAttribute('aria-controls', `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`);
    messageButton.setAttribute('aria-expanded', false);
    messageButton.setAttribute('aria-haspopup', true);
    messageButton.setAttribute('aria-owns', `wiki-edit-dropdown2-messages-wikiEdit${editorCount}`);
    messageButton.setAttribute('original-title', 'Add Message')
    messageButton.append(messageButtonIcon);

    var messageButtonGroup = document.createElement('div');
    messageButtonGroup.classList.add('aui-buttons');
    messageButtonGroup.append(messageButton);

    element.querySelector('.wiki-edit-toolbar-last').before(messageButtonGroup);
}

/**
 * Inserts the given message at the current caret location in the given text area
 * @param {HTMLTextAreaElement} textArea The text area that the message should be added in
 * @param {string} shortcut The shortcut of the message that should be inserted
 * @param {string} project The project the current ticket is in
 */
async function insertText(textArea, shortcut, project) {
    var cursorPos = textArea.selectionStart;
    var cursorPosEnd = textArea.selectionEnd;

    var text = textArea.value;
    var replacement = await getReplacementResult(shortcut, project);

    if (replacement === undefined)
        return;
    
    var insertedText = replacement.insertedText;
    
    text = text.substr(0, cursorPos) + insertedText + text.substr(cursorPosEnd);

    textArea.value = text;

    if (replacement.includesClip) {
        setSelectionRange(textArea, cursorPos + replacement.clipStart, cursorPos + replacement.clipEnd);
    } else {
        cursorPos += insertedText.length;
        setCaretToPos(textArea, cursorPos);
    }

    textArea.dispatchEvent(new Event('input', {
        bubbles: true,
        cancelable: true,
    }));
}

/**
 * Check for message shortcuts in the given text area and replace them with the message
 * @param {HTMLTextAreaElement} textArea The text area to be checked
 * @param {string} project The project the current ticket is in
 */
async function replaceText(textArea, project) {
    var cursorPos = textArea.selectionStart;
    var replacementStart = cursorPos;

    var text = textArea.value;
    var textChanged = false;

    var replacement;

    for (var shortcut in messages[project]) {
        var toReplace = `${prefix}${shortcut}`;
        var pos = text.indexOf(toReplace);

        if (pos >= 0) {
            replacement = await getReplacementResult(shortcut, project);
            
            if (replacement === undefined)
                return;

            replacementStart = cursorPos - toReplace.length;

            var insertedText = replacement.insertedText;

            textChanged = true;

            if (cursorPos > pos) {
                cursorPos += (insertedText.length - toReplace.length);
            }

            text = text.replace(toReplace, insertedText);
        }
    }

    if (textChanged) {
        textArea.value = text;
        if (replacement.includesClip) {
            setSelectionRange(textArea, replacementStart + replacement.clipStart, replacementStart + replacement.clipEnd);
        } else {
            setCaretToPos(textArea, cursorPos);
        }
    }
}

function init() {
    var editorCount = 0;
    setInterval(function() {
        document.querySelectorAll('.jira-wikifield:not(.mojira-helper-messages-field)').forEach(element => {
            modifyWikifield(
                element,
                element.getAttribute('issue-key').split('-')[0].toLowerCase(),
                editorCount++
            );
        });
    }, 1000);
    
    document.addEventListener('keyup', function(event) {
        var element = event.target;
        if (element instanceof HTMLTextAreaElement && element.classList.contains('mojira-helper-messages-textarea')) {
            replaceText(element, element.getAttribute('helper-messages-project'));
        }
    });
}

(async () => {
    const messagesReply = await browser.runtime.sendMessage('messages-request');
    variables = messagesReply.variables;
    messages = messagesReply.messages;

    prefix = await browser.runtime.sendMessage('prefix-request');

    init();
});
