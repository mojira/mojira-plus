import { getPopupMessage } from '../util/settings.js';

document.querySelector('.dismiss-button').addEventListener('click', () => {
    browser.browserAction.setPopup({popup: ''});
    browser.browserAction.setBadgeText({text: ''});
    window.close();
});

const defaultPopupMessage = '*Error: Could not retreive popup message.*\n'
    + 'Internal extension communication is not possible! Try disabling the extension and enabling it again.\n'
    + 'If the issue persists, try restarting your browser.';

(async () => {
    let popupMessage = '';

    try {
        popupMessage = await getPopupMessage();
    } catch (err) {
        popupMessage = defaultPopupMessage + '\n' + err.message;
        console.error(err);
    }

    document.querySelector('#popupMessage').textContent = '';
    htmlifyLineBreaks(popupMessage).forEach(
        elem => document.querySelector('#popupMessage').append(elem)
    );
})();

/**
 * Splits up a string into multiple paragraphs (along line breaks \n).
 * @param {string} input The string that should be split up
 */
function htmlifyLineBreaks(input) {
    const lines = input.split('\n');
    const elements = [];
    let inBlock = false;
    lines.forEach((elem, i) => {
        if (/^\*(.+)\*$/.test(elem)) {
            const element = document.createElement('b');
            element.textContent = elem.match(/^\*(.+)\*$/)[1];
            elements.push(element);
        } else if (/^```$/.test(elem)) {
            inBlock = !inBlock;
            if (inBlock) {
                const element = document.createElement('pre');
                elements.push(element);
            } else {
                /** @type {HTMLPreElement} */
                const block = elements[elements.length - 1];
                block.textContent = block.textContent.replace(/\n+$/, '');
            }
        } else if (inBlock) {
            /** @type {HTMLPreElement} */
            const block = elements[elements.length - 1];
            block.textContent += elem + '\n';
        } else {
            elements.push(document.createTextNode(elem))
        }
        if (i < lines.length - 1 && !inBlock) {
            elements.push(document.createElement('br'));
        }
    });
    return elements;
}
