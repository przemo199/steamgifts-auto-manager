import * as requests from './requests-reader.js';
import {scrapeGiveaways} from './giveaway-scrapper.js';
import {enterGiveaways, launchAndLogin} from './steamgifts-web-driver.js';
import {customMatch} from './utils.js';

async function main() {
    console.time('Total time');

    requests.exists();

    const requestedGames = requests.getRequestedGames();
    const launchPromise = launchAndLogin();
    const scrapedGiveaways = await scrapeGiveaways();
    const giveawaysToEnter = scrapedGiveaways.filter(game => customMatch(game.gameTitle, requestedGames));

    await launchPromise;
    await enterGiveaways(giveawaysToEnter);

    console.timeEnd('Total time');
}

main();
