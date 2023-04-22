import { hideBadge, showErrorBadge, showLoadingBadge, showSuccessBadge } from './badge.js';
import { updateChangelog } from './changelog.js';
import { loadMessageDefinitions } from './convertMessages.js';
import {
    getAutoUpdate,
    getAutoUpdateInterval,
    getLastUpdateCheck,
    setLastUpdateCheck,
    getLastCachedMessages,
    setLastCachedMessages,
    getUrl,
    setLastUpdate,
    getMessageSource,
    getCustomMessages,
    getLastCommit
} from './storage.js';

/**
 * Process the received message update
 * @param {string} response The response returned by the server
 */
async function processMessageUpdate(response) {
    try {
        loadMessageDefinitions(response);
        await setLastUpdate();
        await setLastCachedMessages(response);

        let successMessage = 'Helper messages have been updated.\n'
            + 'You may need to reload open tabs in order for the change to take effect.';

        const previousCommit = await getLastCommit();

        await updateChangelog();

        const lastCommit = await getLastCommit();

        if (previousCommit !== 'none' && lastCommit !== 'none' && previousCommit !== lastCommit) {
            successMessage += '\n\n*Changes since the last update:*\n%commits%';
        }

        await showSuccessBadge(successMessage);
    } catch (err) {
        console.error(err);
        await showErrorBadge(
            'An error occurred because the messages are invalid JSON.'
        );
    }
}

/**
 * Check for updated messages
 * @param {boolean} silent Whether the update should be executed silently (without a badge)
 */
async function checkForMessageUpdates(silent = false) {
    await setLastUpdateCheck();

    if (!silent) await showLoadingBadge();

    const response = await fetch(await getUrl());
    const text = await response.text();
    
    if (response.ok) {
        if (text !== await getLastCachedMessages()) {
            await processMessageUpdate(text);
        } else {
            await hideBadge(!silent);
        }
    } else {
        await showErrorBadge(
            'An error occurred while trying to check whether the helper messages were updated.\n'
            + `The server returned status code ${response.status} ${text}.`
        );
    }
}

/**
 * Update messages if necessary
 * @param {boolean} force Whether the update check is forced or not
 * @param {boolean} silent Whether the update should be executed silently (without a badge)
 */
export async function triggerMessageUpdate(force = false, silent = false) {
    const autoUpdate = await getAutoUpdate();

    if (force || autoUpdate) {
        const autoUpdateInterval = await getAutoUpdateInterval();
        const lastUpdateCheck = await getLastUpdateCheck();

        if (force || new Date() - lastUpdateCheck >= autoUpdateInterval * 1000 * 60) {
            return await checkForMessageUpdates(silent);
        }
    }
}

/**
 * Get current message definitions
 */
export async function getMessages() {
    switch (await getMessageSource()) {
        case 'remote':
            return loadMessageDefinitions(await getLastCachedMessages());
        case 'custom':
            return loadMessageDefinitions(await getCustomMessages());
    }
}
