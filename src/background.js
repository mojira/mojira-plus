import { showErrorBadge } from './util/badge.js';
import { getMessages, checkForUpdates } from './util/messages.js';
import { getAutoUpdateInterval, getPrefix, setPopupMessage } from './util/settings.js';

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
                return getMessages();
            case 'prefix-request':
                return getPrefix();
            case 'show-error':
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