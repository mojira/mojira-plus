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