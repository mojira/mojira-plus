/*
Logic regarding the Postpone button.
Relies on `vars.js`
*/

/**
 * Handle the postpone button (hide it or modify it to show a warning when clicked)
 */
function handlePostponeButton() {
    /** @type {HTMLAnchorElement} */
    let element = document.querySelector('#action_id_771, #action_id_781');

    if (element !== null && !element.classList.contains('mojira-extension-postpone')) {
        element.classList.add('mojira-extension-postpone');

        if (postponeAction === 'hide') {
            element.remove();
        } else if (postponeAction === 'warn') {
            const href = element.getAttribute('href');
            element.removeAttribute('href');

            element.addEventListener('click', event => {
                event.preventDefault();
                const result = confirm('Do you really want to postpone this issue?');
                if (result) {
                    window.location = href;
                }
            });
        }
    }
}
