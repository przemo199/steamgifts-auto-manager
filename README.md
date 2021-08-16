# steamgifts-auto-manager

steamgifts-auto-manager is an automation tool that utilises [got](https://www.npmjs.com/package/got) and [puppeteer](https://www.npmjs.com/package/puppeteer) to automatically search for and enter giveaways on [www.steamgifts.com](https://www.steamgifts.com/)

## Installation

First clone this repository to your drive:

```bash
git clone https://github.com/przemo199/steamgifts-auto-manager
```

Then install the required dependencies:

```bash
npm install
```

## Usage

This tool uses ```requests.txt``` file in the root directory to filter giveaways, you can divide desired titles into two groups denoted by tags ```[exact_match]``` to enter giveaway if its title matches entirely one of the provided game titles and ```[any_match]``` to enter giveaway if its title contains any of the provided names, enter one game title per line and at least one tag before you launch the tool.

>**_NOTE:_** steamgifts.com truncates long game titles and this tool attempts to handle it by checking if any of the requested games includes truncated title

On the first launch (and after the authentication expires) the tool will launch a headful chrome and ask you to login through steam, the user data is saved in ```tmp``` folder and deleting it will allow you to change the associated account at any time.

The tool attempts to enter all giveaways that match their title with the game titles present in ```requests.txt```, it notifies the user if the attempt to enter the giveaway was successful or not after all of the matched giveaways were tried it shows the number of successfully entered giveaways and the number of failed attempts and displays the final amount of points left on the account.

To start the tool use:

```bash
npm run launch
```
