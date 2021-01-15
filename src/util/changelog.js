/*
Logic for getting the commit changelog for GitHub after a message update
*/

import { getCommitUpdatesEnabled, getCommitUrl, getLastCommit, setLastCommit, setLastCommits } from './storage.js';

/**
 * Creates the changelog and saves it to storage
 * @param {string} response The response returned from the GitHub API
 * @param {string} lastKnownSha The sha of the last known commit from the last message update
 */
async function updateLastCommits(response, lastKnownSha) {
    try {
        const json = JSON.parse(response);

        await setLastCommit(json[0].sha || 'none');

        if (lastKnownSha === 'none') return;

        const commits = [];

        for (const commit of json) {
            if (commit.sha === lastKnownSha) break;

            commits.push({
                message: commit.commit.message.split('\n')[0],
                url: commit.html_url
            });
        }

        await setLastCommits(JSON.stringify(commits));
    } catch (error) {
        console.error(error);
    }
}

/**
 * Updates the commits since the last update
 */
export function updateChangelog() {
    return new Promise(async resolve => {
        const lastKnownSha = await getLastCommit();

        if (!(await getCommitUpdatesEnabled())) {
            await setLastCommit('none');
            return;
        }

        const httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = async () => {
            if (httpRequest.readyState === XMLHttpRequest.DONE) {
                if (httpRequest.status === 200) {
                    await updateLastCommits(httpRequest.responseText, lastKnownSha);
                } else {
                    console.error(httpRequest);
                }

                resolve();
            }
        };

        httpRequest.open('GET', await getCommitUrl());
        httpRequest.send();
    });
}