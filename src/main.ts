import * as requests from './requests-reader.js';
import {scrapeGiveaways} from './giveaway-scrapper.js';
import {enterGiveaways, launchAndLogin} from './steamgifts-driver.js';
import {customMatch} from './utils.js';

async function main() {
    console.time('Total time');
    if (!requests.exists()) {
        requests.initFile();
        throw new Error('requests.txt not found, fill newly created file with game titles');
    }

    const requestedGames = requests.getRequestedGames();
    const launchPromise = launchAndLogin();
    const scrapedGiveaways = await scrapeGiveaways();
    const giveawaysToEnter = scrapedGiveaways.filter(game => customMatch(game.gameTitle, requestedGames));

    await launchPromise;
    await enterGiveaways(giveawaysToEnter);
    console.timeEnd('Total time');
}

main();
