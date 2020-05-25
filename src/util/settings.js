/**
 * Run `await initStorage()` before usage!
 * @type {browser.storage.StorageArea | undefined}
 */
let storage = undefined;

/**
 * @type {storage is browser.storage.StorageArea}
 */
async function initStorage() {
    if (storage !== undefined) return;

    storage = (await getSyncAcrossDevices()) && browser.storage.sync ? browser.storage.sync : browser.storage.local;
}

/**
 * @returns {Promise<boolean>} Whether the settings should be synced across devices or not
 */
export async function getSyncAcrossDevices() {
    const storageObj = await browser.storage.local.get('syncAcrossDevices');
    return storageObj.syncAcrossDevices === undefined ? false : storageObj.syncAcrossDevices;
}

/**
 * Set whether the settings should be synced or not. This setting is special since it *always* is saved in local storage.
 * @param {boolean} syncAcrossDevices Whether the settings should be synced across devices or not
 */
export async function setSyncAcrossDevices(syncAcrossDevices) {
    await browser.storage.local.set({syncAcrossDevices});
}

/**
 * Gets a setting from storage
 * @template T
 * @param {string} key The key the value is stored at
 * @param {T} def The default value of the setting
 * @returns {Promise<T>}
 */
async function getFromStorage(key, def) {
    try {
        await initStorage();
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
 */
async function saveToStorage(obj) {
    await initStorage();
    try {
        await storage.set(obj)
    } catch (err){ 
        console.error(err);
    }
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
    await saveToStorage({lastUpdateCheck: new Date().toUTCString()});
}

export async function getLastUpdateCheck() {
    return new Date(await getFromStorage('lastUpdateCheck', new Date('2020').toUTCString()));
}

/**
 * @param {string} lastCachedMessages The last cached messages
 */
export async function setLastCachedMessages(lastCachedMessages) {
    await saveToStorage({lastCachedMessages});
}

export async function getLastCachedMessages() {
    return await getFromStorage('lastCachedMessages', '{"variables":{},"messages":{}}');
}

/**
 * Set the last update to now
 */
export async function setLastUpdate() {
    await saveToStorage({lastUpdateCheck: new Date().toUTCString()});
}

export async function getLastUpdate() {
    return new Date(await getFromStorage('lastUpdateCheck', new Date('2020').toUTCString()));
}

/**
 * @param {string} customMessages The JSON representation of the custom message file
 */
export async function setCustomMessages(customMessages) {
    await saveToStorage({customMessages});
}

export async function getCustomMessages() {
    return await getFromStorage('customMessages', '{"variables":{},"messages":{}}');
}