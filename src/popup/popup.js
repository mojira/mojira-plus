document.querySelector('.dismiss-button').addEventListener('click', () => {
    browser.browserAction.setPopup({popup: ''});
    browser.browserAction.setBadgeText({text: ''});
    window.close();
});