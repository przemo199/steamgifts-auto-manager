import * as requests from './requests-reader.js';
import {enterGiveaways, launchAndLogin, scrapeGiveaways} from './steamgifts-web-driver.js';
import {customMatch} from './utils.js';

async function main() {
    console.time('Total time');

    requests.exists();

    const requestedGames = requests.getRequestedGames();
    await launchAndLogin();
    const scrapedGiveaways = await scrapeGiveaways();
    const giveawaysToEnter = scrapedGiveaways.filter(game => customMatch(game.gameTitle, requestedGames));
    await enterGiveaways(giveawaysToEnter);

    console.timeEnd('Total time');
}

main();
