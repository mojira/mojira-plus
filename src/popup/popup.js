import { getCommitUpdatesEnabled, getPopupMessage, getLastCommits } from '../util/settings.js';

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
    const popupMessageHtml = await htmlifyLineBreaks(popupMessage);
    popupMessageHtml.forEach(
        elem => document.querySelector('#popupMessage').append(elem)
    );
})();

/**
 * Splits up a string into multiple paragraphs (along line breaks \n).
 * @param {string} input The string that should be split up
 */
async function htmlifyLineBreaks(input) {
    const lines = input.split('\n');
    const elements = [];

    const commitUpdatesEnabled = await getCommitUpdatesEnabled();
    const commits = commitUpdatesEnabled ? await getCommits() : document.createTextNode('');

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
        } else if (elem === '\%commits%' && commitUpdatesEnabled) {
            elements.push(commits);
        } else {
            elements.push(document.createTextNode(elem))
        }
        if (i < lines.length - 1 && !inBlock) {
            elements.push(document.createElement('br'));
        }
    });
    return elements;
}

/**
 * @param {{message: string; url: string}[]} commits The commits to be displayed
 */
async function getCommits() {
    try {
        const commits = JSON.parse(await getLastCommits());
        console.debug(commits);
        const list = document.createElement('ul');
        for (const commit of commits) {
            const elem = document.createElement('li');
            const link = document.createElement('a');
            link.textContent = commit.message;
            link.setAttribute('href', commit.url);
            elem.append(link);
            list.append(elem);
        }
        return list;
    } catch (error) {
        const block = document.createElement('pre');
        block.textContent = `Error while retrieving latest commits:\n${ error.message }`;
        return block;
    }
}