import { showErrorBadge } from './badge.js';

export async function reportError(error) {
    console.error(error);
    try {
        let errorMessage = `*${error.message}*`;
        if (error.stack) {
            errorMessage += '\n```\n' + error.stack + '\n```';
        }
        await showErrorBadge(errorMessage);
    } catch (err) {
        console.error('Error while reporting error message:', err);
    }
}
