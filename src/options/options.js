import {
    getSyncAcrossDevices,
    setSyncAcrossDevices,
    getPrefix,
    setPrefix,
    getMessageSource,
    setMessageSource,
    getUrl,
    setUrl,
    getAutoUpdate,
    setAutoUpdate,
    getAutoUpdateInterval,
    setAutoUpdateInterval,
    getCustomMessages,
    setCustomMessages,
    getLastUpdateCheck,
    getLastUpdate,
    getLastCachedMessages,
    getPostponeAction,
    setPostponeAction,
    getCommitUpdatesEnabled,
    getCommitUrl,
    setCommitUpdatesEnabled,
    setCommitUrl
} from '../util/settings.js';
import { checkForUpdates } from '../util/messages.js';

async function init() {
    document.querySelector('#sync').checked = await getSyncAcrossDevices();
    document.querySelector('#sync').addEventListener('change', async event => {
        await setSyncAcrossDevices(event.target.checked);
        location.reload();
    });

    document.querySelector('#prefix').value = await getPrefix();
    document.querySelector('#prefix').addEventListener('change', async event => {        
        await setPrefix(event.target.value);
    });

    document.querySelector('#postponeHide').checked = await getPostponeAction() === 'hide';
    document.querySelector('#postponeHide').addEventListener('click', async () => {
        await setPostponeAction('hide');
    });
    
    document.querySelector('#postponeWarn').checked = await getPostponeAction() === 'warn';
    document.querySelector('#postponeWarn').addEventListener('click', async () => {
        await setPostponeAction('warn');
    });
    
    document.querySelector('#postponeNone').checked = await getPostponeAction() === 'none';
    document.querySelector('#postponeNone').addEventListener('click', async () => {
        await setPostponeAction('none');
    });

    document.querySelector(`#${ await getMessageSource() }`).checked = true;
    document.querySelector('#remote').addEventListener('click', async () => {
        await setMessageSource('remote');
    });
    document.querySelector('#custom').addEventListener('click', async () => {
        await setMessageSource('custom');
    });
    
    document.querySelector('#url').value = await getUrl();
    document.querySelector('#url').addEventListener('change', async event => {        
        await setUrl(event.target.value);
    });
    
    document.querySelector('#auto-update').checked = await getAutoUpdate();
    document.querySelector('#auto-update').addEventListener('change', async event => {
        await setAutoUpdate(event.target.checked);
    });
    
    document.querySelector('#auto-update-interval').value = await getAutoUpdateInterval();
    document.querySelector('#auto-update-interval').addEventListener('change', async event => {
        await setAutoUpdateInterval(event.target.value);
    });

    document.querySelector('#last-checked-date').textContent = (await getLastUpdateCheck()).toLocaleString();
    document.querySelector('#last-updated-date').textContent = (await getLastUpdate()).toLocaleString();
    document.querySelector('#check-for-updates').addEventListener('click', async () => {
        await checkForUpdates(true);
        document.querySelector('#last-checked-date').textContent = (await getLastUpdateCheck()).toLocaleString();
        document.querySelector('#last-updated-date').textContent = (await getLastUpdate()).toLocaleString();
        document.querySelector('#cached-messages').value = await getLastCachedMessages();
    });

    document.querySelector('#cached-messages').value = await getLastCachedMessages();

    document.querySelector('#custom-messages').value = await getCustomMessages();
    document.querySelector('#save-custom-messages').addEventListener('click', async () => {
        var feedback = document.querySelector('#custom-messages-feedback');
        feedback.classList.remove('hidden');

        var customMessages = document.querySelector('#custom-messages').value;

        try {
            JSON.parse(customMessages);
            await setCustomMessages(customMessages);

            feedback.textContent = 'Your custom messages were saved successfully.';
        } catch (err) {
            feedback.textContent = `Error when saving custom messages: ${err}`;
        }
    });

    document.querySelector('#commit-updates').checked = await getCommitUpdatesEnabled();
    document.querySelector('#commit-updates').addEventListener('click', async () => {
        setCommitUpdatesEnabled(document.querySelector('#commit-updates').checked);
    });

    document.querySelector('#commit-url').value = await getCommitUrl();
    document.querySelector('#commit-url').addEventListener('change', async () => {
        setCommitUrl(document.querySelector('#commit-url').value);
    });
}

init();