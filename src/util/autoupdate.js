import { reportError } from './errorReporting.js';
import { triggerMessageUpdate } from './messages.js';
import { getAutoUpdateInterval } from './storage.js';

export async function initAutoupdate() {
    browser.alarms.onAlarm.addListener(async alarm => {
        try {
            if (alarm.name === 'check-for-message-updates') {
                await triggerMessageUpdate();
                startAutoupdateTimer();
            }
        } catch (error) {
            await reportError(error);
        }
    });

    await startAutoupdateTimer();
}

export async function restartAutoupdateTimer() {
    await browser.alarms.clear('check-for-message-updates');
    await startAutoupdateTimer();
}

async function startAutoupdateTimer() {
    const delayInMinutes = await getAutoUpdateInterval();
    browser.alarms.create('check-for-message-updates', { delayInMinutes });
}
