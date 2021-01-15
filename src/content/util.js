/**
 * Sends an error message to background.js, so that it can be displayed to the user.
 * @param {Error} error The error that should be sent
 */
async function sendErrorMessage(error) {
    console.error(error);
    try {
        let errorMessage = `*${ error.message }*`;
        if (error.stack) {
            errorMessage += '\n```\n' + error.stack + '\n```';
        }
        await browser.runtime.sendMessage({id: 'show-error', errorMessage});
    } catch (err) {
        console.error('Error while reporting error message:', err);
    }
}