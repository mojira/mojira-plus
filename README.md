[![](https://img.shields.io/github/issues/mojira/message-extension)](https://github.com/mojira/message-extension/issues)
[![](https://img.shields.io/github/stars/mojira/message-extension)](https://github.com/mojira/message-extension/stargazers)
[![](https://img.shields.io/github/license/mojira/message-extension)](https://github.com/mojira/message-extension/blob/master/LICENSE.md)

# Mojira Helper Message Browser Extension
This is a browser extension made for simplifying the mod and helper workflow on Mojira. It integrates the helper messages from the [`helper-messages`](https://github.com/mojira/helper-messages) repository directly into the Mojira interface, so that messages can be pasted very easily without the need of visiting another website.

On top of that, it always keeps the messages up-to-date with the latest version from the `helper-messages` repository.

As of right now, the extension has only been tested in Mozilla Firefox. It is possible that it works in other browsers like Chrome or Opera as well, but those are currently unsupported.

⚠ Please note that the helper messages may only be used on the bug tracker by helpers, moderators or Mojang staff. Do not use them yourself if you do not belong to one of these groups as it may confuse users regarding your role.

## Installation
1. Download the latest version of the extension from the [releases](https://github.com/mojira/message-extension/releases) page.
2. Open `about:addons` in your browser
3. Click on the gear icon
4. Select "Install Add-on from File..."
5. Select the downloaded file

## Usage
When the addon recognizes a Mojira text field, it automatically highlights it in a green color to indicate that the addon is active. At the same time, it adds an additional "Add Message" button to the toolbar of that text field. You can use that button to insert messages and view all available messages along with their shortcuts.

You can also insert messages by typing the shortcut of the message prefixed with a configurable prefix into the text field.

Currently, both methods only work with the "Text" version of the text field. In "Visual" mode, the addon will not function properly!

Once a text field is initialized, its available messages will no longer change, even if the addon settings have been changed. You need to reload the page in order for any potential changes to take effect.

### Message updates
The addon regularily checks whether the helper messages have been updated, and if they have, it automatically saves the new messages and continues to use the new version. This is indicated by a badge on the Mojira icon.

While the addon is checking for updates, the badge is green and displays a question mark.

When the addon has found an update, the badge turns blue and contains the letter "i", and if an error occurred, it is red with an exclamation mark. These two badges can be dismissed by clicking on the icon.

### Settings
You can configure the addon by clicking the Mojira icon in the browser's toolbar. There you can configure which messages you want to use, and how often (if at all) the addon should check for message updates.

## Contributing
Issues and pull requests are always very much appreciated. If you want to help developing the extension, here are a few tips:

* Run `npm i` in order to install the needed dependencies. Currently this only includes the type definitions for web extensions.
* Run `npm i -g web-ext` in order to install some handy developer tools for web extension development.
* Run `web-ext run` in order to launch a blank instance of Firefox where your addon is running. The addon is reloaded every time a file is changed.
* You can visit `about:debugging` in that Firefox instance and access the addon's console and dev interface from the "This Firefox" tab.
* You can run `web-ext lint --self-hosted` in order to check whether the addon has any issues that might prevent it from being signed.

## Publishing
When a new version is released, it first needs to be signed by Mozilla. After this is done, the addon file is uploaded to the "releases" page and the version manifest in the `releases` branch is updated.
