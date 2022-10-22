/*
Add more options for sorting the comments/activity section below a bug report.
*/

const sortOptions = [
    {
        label: 'Newest first',
        icon: 'activity-tab-sort-up',
        reverse: false,
        state: 'asc',
    },
    {
        label: 'Newest last',
        icon: 'activity-tab-sort-down',
        reverse: true,
        state: 'asc',
    },
    {
        label: 'Oldest first',
        icon: 'activity-tab-sort-down',
        reverse: false,
        state: 'desc',
    },
    {
        label: 'Oldest last',
        icon: 'activity-tab-sort-up',
        reverse: true,
        state: 'desc',
    },
];

/**
 * Get the current state of the sort button and clicks it if necessary
 * @param {ButtonElement} sortButton The actual behind-the-scenes sort button
 */
function clickIfNecessary(sortButton) {
    const actualSortState = sortButton.getAttribute('data-order');

    if (actualSortState !== sortOptions[customSortIndex].state) {
        sortButton.click();
    }
}

/**
 * Updates the custom sort button when sort is changed
 * @param {Element} customSortButton The custom sort button
 */
function updateCustomSortButton(customSortButton) {
    const prevSort = sortOptions[(customSortIndex + sortOptions.length - 1) % sortOptions.length];
    const nextSort = sortOptions[(customSortIndex + 1) % sortOptions.length];
    const currentSort = sortOptions[customSortIndex];

    let label = customSortButton.querySelector('.activity-tab-sort-label');
    if (label) {
        label.innerText = currentSort.label;
    }

    let icon = customSortButton.querySelector('.aui-icon');
    if (icon) {
        icon.classList.remove(prevSort.icon);
        icon.classList.add(currentSort.icon);
    }

    customSortButton.title = `Click to view ${nextSort.label.toLowerCase()}`;
}

/**
 * The click handler for the custom sort button.
 * @param {Element} rootElement The root element of the activity module
 * @param {Element} sortButton The underlying, actual sort button
 * @param {Element} customSortButton The custom sort button itself
 * @returns {() => Promise<void>} The button click handler
 */
function clickCustomSortButton(rootElement, sortButton, customSortButton) {
    return async () => {
        customSortIndex = (customSortIndex + 1) % sortOptions.length;

        clickIfNecessary(sortButton);
        updateCustomSortButton(customSortButton);

        rootElement.classList.toggle('mojira-ext-reverse', sortOptions[customSortIndex].reverse);

        await browser.runtime.sendMessage({ id: 'set-custom-sort-index', index: customSortIndex });
    };
}

/**
 * @param {Element} rootElement The root element of the activity module
 * @param {Element} sortButton The underlying, actual sort button
 * 
 * @returns {Element} The custom sort button element
 */
function makeCustomSortButton(rootElement, sortButton) {
    const nextSort = sortOptions[(customSortIndex + 1) % sortOptions.length];
    const currentSort = sortOptions[customSortIndex];

    const customSortLabel = document.createElement('span');
    customSortLabel.classList.add('activity-tab-sort-label');
    customSortLabel.innerText = currentSort.label;

    const customSortIcon = document.createElement('span');
    customSortIcon.classList.add('aui-icon', currentSort.icon);

    const customSortButton = document.createElement('button');
    customSortButton.classList.add(
        'issue-activity-sort-link',
        'aui-button',
        'aui-button-compact',
        'aui-button-subtle',
        'ajax-activity-content'
    );
    customSortButton.id = 'custom-sort-button';
    customSortButton.title = `Click to view ${nextSort.label.toLowerCase()}`;
    customSortButton.append(customSortLabel, customSortIcon);
    customSortButton.onclick = clickCustomSortButton(rootElement, sortButton, customSortButton);

    const customSortWrap = document.createElement('div');
    customSortWrap.classList.add('sortwrap');
    customSortWrap.append(customSortButton);

    return customSortWrap;
}

/**
 * Modifies the activity module to add the new custom sorts.
 * @param {Element} element The activity module to be modified
 */
function modifyActivityModule(element) {
    const sortButton = element.querySelector('#sort-button');
    const customSortButton = document.querySelector('#custom-sort-button');

    if (!sortButton || customSortButton) return;

    clickIfNecessary(sortButton);
    element.classList.toggle('mojira-ext-reverse', sortOptions[customSortIndex].reverse);

    element.querySelector('.tabs-pane').before(makeCustomSortButton(element, sortButton));
}
