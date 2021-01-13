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
 * Sends an error message to background.js, so that it can be displayed to the user.
 * @param {Error} error The error that should be sent
 */
async function sendErrorMessage(error) {
    console.error(error);
    try {
        let errorMessage = `*${ error.message }*`;
        if (error.stack) {
            errorMessage += '\n```\n' + error.stack + '\n```';
        }
        await browser.runtime.sendMessage({id: 'show-error', errorMessage});
    } catch (err) {
        console.error('Error while reporting error message:', err);
    }
}