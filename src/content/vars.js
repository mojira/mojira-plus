/**
 * A message category
 * @typedef {{
 *      category: string;
 *      name: string;
 * }} Category
 */

/**
 * @type {[Category]}
 */
let categories = [];

/**
 * @typedef {{[variable: string]: string}} Variable
 */

/**
 * @type {{[project: string]: Variable}}
 */
let variables = {};

/**
 * A shortcut message
 * @typedef {{
 *      name: string;
 *      category?: string;
 *      shortcut: string;
 *      message: string;
 *      messageKey: string;
 * }} Message
 */

/**
 * Messages for a specific project
 * @typedef {{[shortcut: string]: Message}} ProjectMessages
 */

/**
 * All messages for all projects
 * @typedef {{[project: string]: ProjectMessages}} Messages
 */

/**
 * @type {Messages}
 */
let messages = {};

/** @type {string} */
let prefix = 'mji-';

/** @type {'hide' | 'warn' | 'none'} */
let postponeAction = 'none';

/** @type {number} */
let customSortIndex = 0;
