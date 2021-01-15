import { showErrorBadge } from '../util/badge.js';
import { getMessages, triggerMessageUpdate } from '../util/messages.js';
import { getAutoUpdateInterval, getPostponeAction, getPrefix, setPopupMessage } from '../util/storage.js';

(async () => {
    await setPopupMessage(undefined);

    browser.browserAction.onClicked.addListener(() => {
        browser.runtime.openOptionsPage();
    });

    try {
        const periodInMinutes = await getAutoUpdateInterval();
        browser.alarms.create('check-for-message-updates', { periodInMinutes });
    } catch (error) {
        reportError(error);
    }

    browser.alarms.onAlarm.addListener(async alarm => {
        try {
            if (alarm.name === 'check-for-message-updates') {
                await triggerMessageUpdate();
            }
        } catch (error) {
            reportError(error);
        }
    });
    
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
        reportError(error);
    }
})();

async function reportError(error) {
    console.error(error);
    try {
        let errorMessage = `*${ error.message }*`;
        if (error.stack) {
            errorMessage += '\n```\n' + error.stack + '\n```';
        }
        await showErrorBadge(errorMessage);
    } catch (err) {
        console.error('Error while reporting error message:', err);
    }
}
