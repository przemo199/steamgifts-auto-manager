import * as requests from './requests-reader.js';
import {enterGiveaways, launchAndLogin, scrapeGiveaways} from './steamgifts-web-driver.js';
import {customFilter} from './utils.js';

async function main() {
    console.time('Total execution time');

    requests.exists();

    const requestedGames = requests.getRequestedGames();
    await launchAndLogin();
    const scrapedGiveaways = await scrapeGiveaways();
    const giveawaysToEnter = scrapedGiveaways.filter(game => customFilter(game.title, requestedGames));
    await enterGiveaways(giveawaysToEnter);

    console.timeEnd('Total execution time');
}

main();
