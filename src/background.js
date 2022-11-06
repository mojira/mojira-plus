import '../lib/browser-polyfill.js';

import { initAutoupdate } from './util/autoupdate.js';
import { showErrorBadge } from './util/badge.js';
import { reportError } from './util/errorReporting.js';
import { getMessages, triggerMessageUpdate } from './util/messages.js';
import { getCustomSortIndex, getPostponeAction, getPrefix, setCustomSortIndex, setPopupMessage } from './util/storage.js';

/**
 * @type {{
 *      user?: string;
 *      value: boolean;
 * }}
 */
let permissionCache = {
    user: undefined,
    value: false,
};

(async () => {
    await setPopupMessage(undefined);

    browser.action.onClicked.addListener(() => {
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
            case 'custom-sort-index-request':
                return await getCustomSortIndex();
            case 'set-custom-sort-index':
                await setCustomSortIndex(message.index);
                return;
            case 'get-permission-cache':
                return permissionCache;
            case 'set-permission-cache':
                permissionCache = {
                    user: message.user,
                    value: message.value
                };
                return;
            case 'show-error':
                console.error(`Received error message: ${message.errorMessage}`);
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
