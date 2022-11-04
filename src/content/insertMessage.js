/*
Logic for inserting messages into a text area.
Relies on `vars.js`.
*/

/**
 * Changes the selection inside of a text area to a certain range
 * From https://stackoverflow.com/a/499158
 * @param {HTMLTextAreaElement} input The text area where the selection should be changed
 * @param {number} selectionStart The position where the selection should start
 * @param {number} selectionEnd The position where the selection should end
 */
function setSelectionRange(input, selectionStart, selectionEnd) {
    if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    } else if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    }
}

/**
 * Moves the caret inside of a text area to a certain position
 * From https://stackoverflow.com/a/499158
 * @param {HTMLTextAreaElement} input The text area where the caret should be moved
 * @param {number} pos The position where the caret should be moved
 */
function setCaretToPos(input, pos) {
    setSelectionRange(input, pos, pos);
}

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
async function getExpandedMessage(shortcut, project) {
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

        var clip = '<error: clipboard contents could not be inserted>';
        try {
            clip = await navigator.clipboard.readText();
        } catch (e) {
            console.error(e);
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
 * Check for message shortcuts in the given text area and replace them with the message
 * Only used for the shortcuts, not used for the dropdown.
 * @param {HTMLTextAreaElement} textArea The text area to be checked
 * @param {string} project The project the current ticket is in
 */
async function replaceText(textArea, project) {
    let cursorPos = textArea.selectionStart;

    let text = textArea.value;
    let textChanged = false;

    let replacementStart;
    let replacement;

    for (var shortcut in messages[project]) {
        const toReplace = `${prefix}${shortcut}`;
        const replacePos = text.indexOf(toReplace);

        if (replacePos >= 0) {
            replacementStart = replacePos;
            replacement = await getExpandedMessage(shortcut, project);

            if (replacement === undefined)
                return;

            const insertedText = replacement.insertedText;

            textChanged = true;

            if (cursorPos >= replacementStart) {
                cursorPos = replacementStart + insertedText.length;
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

        // Fix text area not resizing properly
        textArea.dispatchEvent(new KeyboardEvent('keyup'));
    }
}

/**
 * Inserts the given message at the current caret location in the given text area
 * Only used for the dropdown, not used for shortcut replacement.
 * @param {HTMLTextAreaElement} textArea The text area that the message should be added in
 * @param {string} shortcut The shortcut of the message that should be inserted
 * @param {string} project The project the current ticket is in
 */
async function insertText(textArea, shortcut, project) {
    var cursorPos = textArea.selectionStart;
    var cursorPosEnd = textArea.selectionEnd;

    var text = textArea.value;
    var replacement = await getExpandedMessage(shortcut, project);

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
