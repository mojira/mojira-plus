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
var messageDefinitions = {
    variables: {},
    messages: {}
};

function showSuccessBadge() {
    browser.browserAction.setPopup({popup: '/src/popup/popup.html'});
    browser.browserAction.setBadgeBackgroundColor({color: '#222288'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: 'i'});
}

function showLoadingBadge() {
    browser.browserAction.setBadgeBackgroundColor({color: '#228822'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: '?'});
}

function hideBadge() {
    browser.browserAction.setBadgeText({text: ''});
}

function showErrorBadge() {
    browser.browserAction.setPopup({popup: '/src/popup/popup-error.html'});
    browser.browserAction.setBadgeBackgroundColor({color: '#882222'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: '!'});
}

function showJSONErrorBadge() {
    showErrorBadge();
    browser.browserAction.setPopup({popup: '/src/popup/popup-error-invalid-json.html'});
}

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

                showLoadingBadge();

                const httpRequest = new XMLHttpRequest();
                httpRequest.onreadystatechange = async () => {
                    if (httpRequest.readyState === XMLHttpRequest.DONE) {
                        if (httpRequest.status === 200) {
                            if (httpRequest.responseText !== await getLastCachedMessages()) {
                                try {
                                    loadMessages(httpRequest.responseText);
                                    await setLastUpdate();
                                    await setLastCachedMessages(httpRequest.responseText);
                                    showSuccessBadge();
                                    await initMessages();
                                } catch (err) {
                                    showJSONErrorBadge();
                                }
                            } else {
                                setTimeout(hideBadge, 1000);
                            }
                        } else {
                            showErrorBadge();
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
        showJSONErrorBadge();
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