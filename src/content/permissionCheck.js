const permissionCheckError = 'An error occurred while trying to validate Mojira permissions.\n';

/**
 * Parses the JSON response and checks if the currently logged-in user is in a user group other than `users`.
 * @param {string} response The API response, hopefully in JSON format
 * 
 * @returns {boolean} whether the user is in at least one non-`users` group
 * @throws {Error} if there's no valid JSON or the JSON does not follow the API scheme.
 */
function parsePermissionResponse(response) {
    try {
        const json = JSON.parse(response);

        const groups = json.groups?.items;
        if (!groups) throw new Error('The API response is malformed and does not include groups.');

        return groups.filter(group => group.name !== 'users').length > 0;
    } catch (error) {
        if (error instanceof SyntaxError) {
            throw new Error(`${permissionCheckError}The server returned invalid JSON: ${error.message}`);
        } else {
            throw new Error(`${permissionCheckError}${error}`);
        }
    }
}

/**
 * Checks if the currently logged in user is a volunteer user (moderator / helper).
 *
 * @returns {Promise<boolean>} true is the logged in user is a helper+, false otherwise.
 * @throws {Error} if an error occurs
 */
function queryPermissions() {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await fetch('https://bugs.mojang.com/rest/api/2/myself?expand=groups');
            const text = await response.text();

            if (response.ok) {
                try {
                    const perm = parsePermissionResponse(text);
                    resolve(perm);
                } catch (error) {
                    reject(error);
                }
            } else if (response.status === 401) {
                resolve(false);
            } else {
                reject(
                    new Error(`${permissionCheckError}The server returned status code ${response.status} ${text}.`)
                );
            }
        } catch (error) {
            reject(`${permissionCheckError}${error}`);
        }
    });
}

/**
 * Checks if the currently logged in user is a volunteer user (moderator / helper).
 * Uses the value from the cache unless the user name has changed.
 * 
 * @returns {Promise<boolean>} true if the logged in user is a helper+, false otherwise.
 * @throws {Error} if an error occurr.
 */
async function validatePermissions() {
    const userName = document.querySelector('meta[name=ajs-remote-user]')?.attributes?.getNamedItem('content')?.value;

    if (!userName) {
        await browser.runtime.sendMessage({ id: 'set-permission-cache', user: undefined, value: false });
        return false;
    }

    const permissionCache = await browser.runtime.sendMessage({ id: 'get-permission-cache' });
    if (permissionCache.user === userName) {
        return permissionCache.value;
    }

    const userPermissions = queryPermissions();
    await browser.runtime.sendMessage({ id: 'set-permission-cache', user: userName, value: userPermissions });
    return userPermissions;
}
