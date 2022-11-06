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
    browser.action.setPopup({ popup: '/src/popup/popup.html' });
    await setPopupMessage(message);

    browser.action.setBadgeBackgroundColor({ color: '#222288' });
    if (browser.action.setBadgeTextColor) {
        browser.action.setBadgeTextColor({ color: '#ffffff' });
    }
    browser.action.setBadgeText({ text: 'i' });

    currentBadge = 'success';
}

/**
 * Shows a loading badge on the extension icon
 */
export async function showLoadingBadge() {
    if (currentBadge === 'error') return;

    browser.action.setBadgeBackgroundColor({ color: '#228822' });
    if (browser.action.setBadgeTextColor) {
        browser.action.setBadgeTextColor({ color: '#ffffff' });
    }
    browser.action.setBadgeText({ text: '?' });

    currentBadge = 'loading';
}

/**
 * Shows an error badge on the extension icon
 * @param {string} message The message that should be shown on the popup
 */
export async function showErrorBadge(message) {
    browser.action.setPopup({ popup: '/src/popup/popup.html' });
    await setPopupMessage(message);

    browser.action.setBadgeBackgroundColor({ color: '#882222' });
    if (browser.action.setBadgeTextColor) {
        browser.action.setBadgeTextColor({ color: '#ffffff' });
    }
    browser.action.setBadgeText({ text: '!' });

    currentBadge = 'error';
}

export async function hideBadge(delay = false) {
    if (delay) {
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    browser.action.setPopup({ popup: '' });
    browser.action.setBadgeText({ text: '' });

    currentBadge = 'none';
}
