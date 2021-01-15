import { initAutoupdate } from '../util/autoupdate.js';
import { showErrorBadge } from '../util/badge.js';
import { reportError } from '../util/errorReporting.js';
import { getMessages, triggerMessageUpdate } from '../util/messages.js';
import { getPostponeAction, getPrefix, setPopupMessage } from '../util/storage.js';

(async () => {
    await setPopupMessage(undefined);

    browser.browserAction.onClicked.addListener(() => {
        browser.runtime.openOptionsPage();
    });

    await initAutoupdate();
    
    browser.runtime.onMessage.addListener(async message => {
        switch (message.id) {
            case 'messages-request':
                return await getMessages();
            case 'prefix-request':
                return await getPrefix();
            case 'postponeaction-request':
                return await getPostponeAction();
            case 'show-error':
                console.error(`Received error message: ${ message.errorMessage }`);
                await showErrorBadge(message.errorMessage);
                return;
        }
    });

    try {
        await triggerMessageUpdate();
    } catch (error) {
        await reportError(error);
    }
})();
