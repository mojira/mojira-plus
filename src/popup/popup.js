import { getPopupMessage } from "../util/settings.js";

document.querySelector('.dismiss-button').addEventListener('click', () => {
    browser.browserAction.setPopup({popup: ''});
    browser.browserAction.setBadgeText({text: ''});
    window.close();
});

(async () => {
    try {
        document.querySelector('#popupMessage').innerHTML = await getPopupMessage();
    } catch (err) {
        document.querySelector('#popupMessage').innerHTML = '<b>Error: Could not retreive popup message.</b><br>'
            + 'Internal extension communication is not possible! Try disabling the extension and enabling it again.<br>'
            + 'If the issue persists, try restarting your browser.<br>'
            + err.message;
        console.error(err);
    }
})();
