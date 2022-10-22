/**
 * Saves the current storage object
 * @type {browser.storage.StorageArea | undefined}
 */
let storage = undefined;

export const syncStorageAvailable = browser.storage.sync !== undefined;

async function getStorage(local = false) {
    if (local || !syncStorageAvailable) return browser.storage.local;

    if (storage !== undefined) return storage;

    return storage = await getSyncAcrossDevices() ? browser.storage.sync : browser.storage.local;
}

/**
 * Gets a setting from storage
 * @template T
 * @param {string} key The key the value is stored at
 * @param {T} def The default value of the setting
 * @param {boolean} local Whether local storage should always be used
 * @returns {Promise<T>}
 */
async function getFromStorage(key, def, local = false) {
    try {
        const storage = await getStorage(local);
        const storageObj = await storage.get(key);
        return storageObj[key] === undefined ? def : storageObj[key];
    } catch {
        return def;
    }
}

/**
 * Saves a setting in storage
 * @template T
 * @param {{[key: string]: T}} obj The settings to be saved
 * @param {boolean} local Whether local storage should always be used
 */
async function saveToStorage(obj, local = false) {
    try {
        const storage = await getStorage(local);
        await storage.set(obj)
    } catch (err){ 
        console.error(err);
    }
}

/**
 * @returns {Promise<boolean>} Whether the settings should be synced across devices or not
 */
export async function getSyncAcrossDevices() {
    return await getFromStorage('syncAcrossDevices', false, true);
}

/**
 * Set whether the settings should be synced or not. This setting is special since it *always* is saved in local storage.
 * @param {boolean} syncAcrossDevices Whether the settings should be synced across devices or not
 */
export async function setSyncAcrossDevices(syncAcrossDevices) {
    storage = undefined;
    await saveToStorage({syncAcrossDevices}, true);
}

export async function getPrefix() {
    return await getFromStorage('prefix', 'mji-');
}

/**
 * @param {string} prefix The prefix for replacements
 */
export async function setPrefix(prefix) {
    await saveToStorage({prefix});
}

/**
 * @returns {Promise<'hide' | 'warn' | 'none'>}
 */
export async function getPostponeAction() {
    return await getFromStorage('postponeAction', 'warn');
}

/**
 * @param {Promise<'hide' | 'warn' | 'none'>} postponeAction How to handle the postpone button
 */
export async function setPostponeAction(postponeAction) {
    await saveToStorage({postponeAction});
}

/**
 * @returns {number}
 */
export async function getCustomSortIndex() {
    return await getFromStorage('customSortIndex', 0);
}

/**
 * @param {number} customSortIndex
 */
export async function setCustomSortIndex(customSortIndex) {
    await saveToStorage({ customSortIndex });
}

/**
 * @returns {Promise<'remote' | 'custom'>} Where the helper messages come from
 */
export async function getMessageSource() {
    return await getFromStorage('messageSource', 'remote');
}

/**
 * @param {'remote' | 'custom'} messageSource Where the helper messages come from
 */
export async function setMessageSource(messageSource) {
    await saveToStorage({messageSource: messageSource});
}

export async function getUrl() {
    return await getFromStorage('url', 'https://raw.githubusercontent.com/mojira/helper-messages/gh-pages/assets/js/messages.json');
}

/**
 * @param {string} url The helper messages url that should be used for keeping the messages up-to-date
 */
export async function setUrl(url) {
    await saveToStorage({url});
}

export async function getAutoUpdate() {
    return await getFromStorage('autoUpdate', true);
}

/**
 * @param {boolean} autoUpdate Whether the messages should be updated automatically
 */
export async function setAutoUpdate(autoUpdate) {
    await saveToStorage({autoUpdate});
}

/**
 * @param {number} autoUpdateInterval How many minutes should be between checks for new messages
 */
export async function setAutoUpdateInterval(autoUpdateInterval) {
    await saveToStorage({autoUpdateInterval});
}

export async function getAutoUpdateInterval() {
    return parseInt(await getFromStorage('autoUpdateInterval', 60));
}

/**
 * Set the last update check to now
 */
export async function setLastUpdateCheck() {
    await saveToStorage({lastUpdateCheck: new Date().toUTCString()}, true);
}

export async function getLastUpdateCheck() {
    return new Date(await getFromStorage('lastUpdateCheck', new Date('1970').toUTCString(), true));
}

/**
 * @param {string} lastCachedMessages The last cached messages
 */
export async function setLastCachedMessages(lastCachedMessages) {
    await saveToStorage({lastCachedMessages}, true);
}

export async function getLastCachedMessages() {
    return await getFromStorage('lastCachedMessages', '{"variables":{},"messages":{}}', true);
}

/**
 * Set the last update to now
 */
export async function setLastUpdate() {
    await saveToStorage({lastUpdate: new Date().toUTCString()}, true);
}

export async function getLastUpdate() {
    return new Date(await getFromStorage('lastUpdate', new Date('2020').toUTCString(), true));
}

/**
 * @param {string} customMessages The JSON representation of the custom message file
 */
export async function setCustomMessages(customMessages) {
    await saveToStorage({customMessages}, true);
}

export async function getCustomMessages() {
    return await getFromStorage('customMessages', '{"variables":{},"messages":{}}', true);
}

/**
 * @param {boolean} commitUpdatesEnabled Whether commit updates should be enabled
 */
export async function setCommitUpdatesEnabled(commitUpdatesEnabled) {
    await saveToStorage({commitUpdatesEnabled});
}

export async function getCommitUpdatesEnabled() {
    return await getFromStorage('commitUpdatesEnabled', true);
}

/**
 * @param {string} commitUrl The url to the commits JSON file
 */
export async function setCommitUrl(commitUrl) {
    await saveToStorage({commitUrl});
}

export async function getCommitUrl() {
    return await getFromStorage('commitUrl', 'https://api.github.com/repos/mojira/helper-messages/commits');
}

/**
 * @param {string} commit The sha of the last commit
 */
export async function setLastCommit(lastCommit) {
    await saveToStorage({lastCommit}, true);
}

export async function getLastCommit() {
    return await getFromStorage('lastCommit', 'none', true);
}

/*
Storage objects used for internal extension communication
*/

/**
 * @param {string} popupMessage The current popup message
 */
export async function setPopupMessage(popupMessage) {
    await saveToStorage({popupMessage}, true);
}

export async function getPopupMessage() {
    const popupErrorMessage = '*Error: Could not load popup message.*\n'
        + 'Internal extension communication is not possible! Try disabling the extension and enabling it again.\n'
        + 'If the issue persists, try restarting your browser.';

    return await getFromStorage('popupMessage', popupErrorMessage, true);
}

/**
 * @param {string} lastCommits The JSON representation of the last commits
 */
export async function setLastCommits(lastCommits) {
    await saveToStorage({lastCommits}, true);
}

export async function getLastCommits() {
    return await getFromStorage('lastCommits', '[]', true);
}