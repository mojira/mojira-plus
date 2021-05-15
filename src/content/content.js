/*
The main content script modifying the JIRA page.
Relies on all the other files in `src/content`.
*/

function init() {
    var editorCount = 0;
    setInterval(() => {
        document.querySelectorAll('.jira-wikifield:not(.mojira-helper-messages-field)').forEach(async element => {
            try {
                modifyWikifield(
                    element,
                    element.getAttribute('issue-key').split('-')[0].toLowerCase(),
                    editorCount++,
                    !isVolunteerUser()
                );
            } catch (error) {
                await sendErrorMessage(error);
            }
        });

        try {
            handlePostponeButton();
        } catch (error) {
            sendErrorMessage(error);
        }
    }, 1000);
    
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

function isVolunteerUser() {
    let opsbar = document.querySelector('div#opsbar-opsbar-transitions');
    return opsbar && opsbar.children.length > 0;
}

(async () => {
    try {
        const messagesReply = await browser.runtime.sendMessage({id: 'messages-request'});
        variables = messagesReply.variables;
        messages = messagesReply.messages;

        prefix = await browser.runtime.sendMessage({id: 'prefix-request'});

        postponeAction = await browser.runtime.sendMessage({id: 'postponeaction-request'});

        init();
    } catch (error) {
        await sendErrorMessage(error);
    }
})();
