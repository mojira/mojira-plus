import { showErrorBadge } from './util/badge.js';
import { getMessages, checkForUpdates } from './util/messages.js';
import { getAutoUpdateInterval, getPostponeAction, getPrefix, setPopupMessage } from './util/settings.js';

(async () => {
    await setPopupMessage(undefined);

    browser.browserAction.onClicked.addListener(() => {
        browser.runtime.openOptionsPage();
    });

    try {
        const periodInMinutes = await getAutoUpdateInterval();
        browser.alarms.create('check-for-message-updates', { periodInMinutes });
    } catch (err) {
        console.error(err);
    }

    browser.alarms.onAlarm.addListener(async alarm => {
        if (alarm.name === 'check-for-message-updates') {
            await checkForUpdates();
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
        await checkForUpdates();
    } catch (err) {
        console.error(err);
    }
})();