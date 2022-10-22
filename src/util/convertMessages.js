/*
Logic for converting the raw message definition format from the helper-messages repo into the internal format
*/

/**
 * Convert the external variable format into the internal one
 * 
 * @param {{
 *     [variable: string]: {
 *         project: string | string[];
 *         value: string
 *     }[];
 * }} rawVariables The raw variables object
 * 
 * @returns {{
 *     [project: string]: {
 *         [variable: string]: string;
 *     };
 * }}
 */
function convertVariables(rawVariables) {
    const variables = {};
    for (var variable in rawVariables) {
        for (var varVariant of rawVariables[variable]) {
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
    return variables;
}

/**
 * Convert the external message format into the internal one
 * 
 * @param {{
 *     [messageKey: string]: {
 *         project: string | string[];
 *         name: string;
 *         message: string;
 *         shortcut: string;
 *     }[];
 * }} rawMessages The raw messages object
 * 
 * @returns {{
 *     [shortcut: string]: {
 *         name: string;
 *         category?: string;
 *         shortcut: string;
 *         message: string;
 *         messageKey: string;
 *     };
 * }}
 */
function convertMessages(rawMessages) {
    const messages = {};
    for (var messageKey in rawMessages) {
        var message = rawMessages[messageKey];
        for (var msgVariant of message) {
            if (typeof msgVariant.project == 'string') {
                if (!messages[msgVariant.project]) messages[msgVariant.project] = {};
                messages[msgVariant.project][msgVariant.shortcut] = {
                    name: msgVariant.name,
                    category: msgVariant.category,
                    shortcut: msgVariant.shortcut,
                    message: msgVariant.message,
                    messageKey: messageKey
                };
            } else {
                for (var project of msgVariant.project) {
                    if (!messages[project]) messages[project] = {};
                    messages[project][msgVariant.shortcut] = {
                        name: msgVariant.name,
                        category: msgVariant.category,
                        shortcut: msgVariant.shortcut,
                        message: msgVariant.message,
                        messageKey: messageKey
                    };
                }
            }
        }
    }
    return messages;
}

/**
 * Load message definitions from a JSON string
 * @param {string} messageJson The message object in JSON format.
 * 
 * @returns {{
 *      categories: [{
 *          category: string;
 *          name: string;
 *      }];
 *      variables: {
 *          [project: string]: {
 *              [variable: string]: string;
 *          };
 *      };
 *      messages: {
 *          [project: string]: {
 *              [shortcut: string]: {
 *                  name: string;
 *                  category?: string;
 *                  shortcut: string;
 *                  message: string;
 *                  messageKey: string;
 *              };
 *          };
 *      };
 *  }}
 */
export function loadMessageDefinitions(messageJson) {
    let rawDefinition;

    try {
        rawDefinition = JSON.parse(messageJson);
    } catch {
        throw new Error('Invalid JSON format');
    }

    if (rawDefinition.variables === undefined || rawDefinition.messages === undefined) {
        throw new Error('JSON does not contain `variables` or `messages`');
    }

    return {
        categories: rawDefinition.categories,
        variables: convertVariables(rawDefinition.variables),
        messages: convertMessages(rawDefinition.messages)
    };
}
