import { getMessages, checkForUpdates } from './util/messages.js';
import { getAutoUpdateInterval, getPrefix } from './util/settings.js';

(async () => {
    browser.browserAction.onClicked.addListener(() => {
        browser.runtime.openOptionsPage();
    });

    await checkForUpdates();

    browser.alarms.create('check-for-message-updates', {
        periodInMinutes: await getAutoUpdateInterval()
    });
    
    browser.alarms.onAlarm.addListener(async alarm => {
        if (alarm.name === 'check-for-message-updates') {
            await checkForUpdates();
        }
    });
    
    browser.runtime.onMessage.addListener(message => {
        switch (message) {
            case 'messages-request':
                return getMessages();
            case 'prefix-request':
                return getPrefix();
        }
    });
})();