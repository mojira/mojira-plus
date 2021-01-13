import { hideBadge, showErrorBadge, showLoadingBadge, showSuccessBadge } from './badge.js';
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
    getCustomMessages
} from './settings.js';

/**
 * @type {{
 *      variables: {
 *          [project: string]: {
 *              [variable: string]: string;
 *          };
 *      };
 *      messages: {
 *          [project: string]: {
 *              [shortcut: string]: {
 *                  name: string;
 *                  message: string;
 *                  messageKey: string;
 *              };
 *          };
 *      };
 *  }}
 */
let messageDefinitions = {
    variables: {},
    messages: {}
};

/**
 * Check for updated messages
 * @param {boolean} force Whether the update check is forced or not
 */
export function checkForUpdates(force = false) {
    return new Promise(async resolve => {
        const autoUpdate = await getAutoUpdate();

        if (force || autoUpdate) {
            const autoUpdateInterval = await getAutoUpdateInterval();
            const lastUpdateCheck = await getLastUpdateCheck();

            if (force || new Date() - lastUpdateCheck >= autoUpdateInterval * 1000 * 60 ) {
                await setLastUpdateCheck();

                await showLoadingBadge();

                const httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = async () => {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            if (httpRequest.responseText !== await getLastCachedMessages()) {
                                try {
                                    loadMessages(httpRequest.responseText);
                                    await setLastUpdate();
                                    await setLastCachedMessages(httpRequest.responseText);
                                    await showSuccessBadge(
                                        'Helper messages have been updated.\n'
                                        + 'You may need to reload open tabs in order for the change to take effect.'
                                    );
                                    await initMessages();
                                } catch (err) {
                                    await showErrorBadge(
                                        'An error occurred because the messages are invalid JSON.'
                                    );
                                }
                            } else {
                                setTimeout(async () => await hideBadge(), 1000);
                            }
                        } else {
                            await showErrorBadge(
                                'An error occurred while trying to check whether the helper messages were updated.\n'
                                + `The server returned status code ${httpRequest.status} ${httpRequest.statusText}.`
                            );
                        }
                        resolve();
                    }
                };

                httpRequest.open('GET', await getUrl());
                httpRequest.send();
            }
        }
    });
}

export async function initMessages() {
    switch (await getMessageSource()) {
        case 'remote':
            loadMessages(await getLastCachedMessages());
            return;
        case 'custom':
            loadMessages(await getCustomMessages());
            return;
    }
}

export async function getMessages() {
    try {
        await initMessages();
    } catch {
        await showErrorBadge(
            'An error occurred because the messages are invalid JSON.'
        );
    }
    return messageDefinitions;
}

/**
 * Load message definitions from a JSON string
 * @param {string} messageJson The message object in JSON format.
 */
function loadMessages(messageJson) {
    let rawDefinition;

    try {
        rawDefinition = JSON.parse(messageJson);
    } catch {
        throw new Error('Invalid JSON format');
    }

    if (rawDefinition.variables === undefined || rawDefinition.messages === undefined) {
        throw new Error('JSON does not contain `variables` or `messages`');
    }

    const variables = {};
    for (var variable in rawDefinition.variables) {
        for (var varVariant of rawDefinition.variables[variable]) {
            if (typeof varVariant.project == 'string') {
                if (!variables[varVariant.project]) variables[varVariant.project] = {};
                variables[varVariant.project][variable] = varVariant.value;
            } else {
                for (var project of varVariant.project) {
                    if (!variables[project]) variables[project] = {};
                    variables[project][variable] = varVariant.value;
                }
            }
        }
    }
    
    const messages = {};
    for (var messageKey in rawDefinition.messages) {
        var message = rawDefinition.messages[messageKey];
        for (var msgVariant of message) {
            if (typeof msgVariant.project == 'string') {
                if (!messages[msgVariant.project]) messages[msgVariant.project] = {};
                messages[msgVariant.project][msgVariant.shortcut] = {
                    name: msgVariant.name,
                    message: msgVariant.message,
                    messageKey: messageKey
                };
            } else {
                for (var project of msgVariant.project) {
                    if (!messages[project]) messages[project] = {};
                    messages[project][msgVariant.shortcut] = {
                        name: msgVariant.name,
                        message: msgVariant.message,
                        messageKey: messageKey
                    };
                }
            }
        }
    }

    messageDefinitions = {
        variables,
        messages
    };
}