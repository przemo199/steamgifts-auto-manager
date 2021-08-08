import * as requests from './requests-reader.js';
import {scrapeGiveaways} from './giveaway-scrapper.js';
import {enterGiveaways, launchAndLogin} from './web-driver.js';

async function main() {
    console.time('Total time');
    if (!requests.exists()) {
        throw new Error('requests.txt not found');
    }

    const requestedGames = requests.getRequestedGames();
    await launchAndLogin();
    const scrapedGiveaways = await scrapeGiveaways();
    const intersection = scrapedGiveaways.filter(g => requestedGames.includes(g.gameTitle.toLowerCase()));

    await enterGiveaways(intersection);
    console.timeEnd('Total time');
}

main();
