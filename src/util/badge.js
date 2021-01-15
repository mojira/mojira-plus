import { setPopupMessage } from './storage.js';

/**
 * @type {'error' | 'loading' | 'success' | 'none'}
 */
let currentBadge = 'none';

/**
 * Shows a success badge on the extension icon
 * @param {string} message The message that should be shown on the popup
 */
export async function showSuccessBadge(message) {
    browser.browserAction.setPopup({popup: '/src/popup/popup.html'});
    await setPopupMessage(message);

    browser.browserAction.setBadgeBackgroundColor({color: '#222288'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: 'i'});

    currentBadge = 'success';
}

/**
 * Shows a loading badge on the extension icon
 */
export async function showLoadingBadge() {
    if (currentBadge === 'error') return;

    browser.browserAction.setBadgeBackgroundColor({color: '#228822'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: '?'});

    currentBadge = 'loading';
}

/**
 * Shows an error badge on the extension icon
 * @param {string} message The message that should be shown on the popup
 */
export async function showErrorBadge(message) {
    browser.browserAction.setPopup({popup: '/src/popup/popup.html'});
    await setPopupMessage(message);

    browser.browserAction.setBadgeBackgroundColor({color: '#882222'});
    if (browser.browserAction.setBadgeTextColor) {
        browser.browserAction.setBadgeTextColor({color: '#ffffff'});
    }
    browser.browserAction.setBadgeText({text: '!'});

    currentBadge = 'error';
}

export async function hideBadge(delay = false) {
    if (delay) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    browser.browserAction.setPopup({popup: ''});
    
    browser.browserAction.setBadgeText({text: ''});

    currentBadge = 'none';
}
