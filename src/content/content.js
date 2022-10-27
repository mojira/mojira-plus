/*
The main content script modifying the JIRA page.
Relies on all the other files in `src/content`.
*/

let editorCount = 0;

/**
 * Initializes the textfield modifications
 */
function initWikifields() {
    const wikifields = document.querySelectorAll('.jira-wikifield:not(.mojira-helper-messages-field)');

    wikifields.forEach(async element => {
        try {
            modifyWikifield(
                element,
                element.getAttribute('issue-key').split('-')[0].toLowerCase(),
                editorCount++
            );
        } catch (error) {
            await sendErrorMessage(error);
        }
    });
}

/**
 * Initializes the activity module modifications
 */
function initActivityModules() {
    const activityModules = document.querySelectorAll('#activitymodule .mod-content:not(.mojira-activitymodule-initialized)');

    activityModules.forEach(element => {
        const observer = new window.MutationObserver(async () => {
            try {
                modifyActivityModule(element);
            } catch (error) {
                await sendErrorMessage(error);
            }
        });

        observer.observe(element, { childList: true })

        modifyActivityModule(element);
    });
}

function init() {
    initWikifields();
    initActivityModules();

    setInterval(() => {
        initWikifields();
        initActivityModules();

        try {
            handlePostponeButton();
        } catch (error) {
            sendErrorMessage(error);
        }
    }, 1000);

    // Re-initialize activity module in search view when switching to another ticket
    document.querySelectorAll('.issue-container').forEach(element => {
        const observer = new window.MutationObserver(async () => {
            initActivityModules();
        });

        observer.observe(element, { attributes: true });
    });

    document.addEventListener('keyup', async event => {
        var element = event.target;
        try {
            if (element instanceof HTMLTextAreaElement && element.classList.contains('mojira-helper-messages-textarea')) {
                await replaceText(element, element.getAttribute('helper-messages-project'));
            }
        } catch (error) {
            await sendErrorMessage(error);
        }
    });

    handlePostponeButton();
}

(async () => {
    try {
        userIsVolunteer = await queryPermissions();
    } catch (error) {
        await sendErrorMessage(error);
    }

    try {
        const messagesReply = await browser.runtime.sendMessage({ id: 'messages-request' });
        categories = messagesReply.categories;
        variables = messagesReply.variables;
        messages = messagesReply.messages;

        prefix = await browser.runtime.sendMessage({ id: 'prefix-request' });

        postponeAction = await browser.runtime.sendMessage({ id: 'postponeaction-request' });

        customSortIndex = await browser.runtime.sendMessage({ id: 'custom-sort-index-request' });

        init();
    } catch (error) {
        await sendErrorMessage(error);
    }
})();
