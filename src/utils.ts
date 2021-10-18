import {RequestedGames} from './interfaces';

function customFilter(gameTitle: string, requestedGames: RequestedGames): boolean {
    const title = gameTitle.toLowerCase();

    if (title.substring(title.length - 3) == '...') {
        const shortTitle = title.substring(0, title.length - 3);

        for (const game of requestedGames.noMatches) {
            if (game.includes(shortTitle)) {
                return false;
            }
        }

        for (const game of requestedGames.exactMatches) {
            if (game.includes(shortTitle)) {
                return true;
            }
        }

        for (const anyMatch of requestedGames.anyMatches) {
            if (shortTitle.includes(anyMatch)) {
                return true;
            }
        }
    } else {
        if (requestedGames.noMatches.includes(title)) {
            return false;
        }

        if (requestedGames.exactMatches.includes(title)) {
            return true;
        }

        for (const anyMatch of requestedGames.anyMatches) {
            if (title.includes(anyMatch)) {
                return true;
            }
        }
    }

    return false;
}

function printCannotEnterGiveaway(giveawayTitle: string): void {
    console.log('Cannot enter giveaway for: ' + giveawayTitle);
}

function printAlreadyInGiveaway(giveawayTitle: string): void {
    console.log('Already in giveaway for: ' + giveawayTitle);
}

function printEnteredGiveaway(giveawayTitle: string): void {
    console.log('Entered giveaway for: ' + giveawayTitle);
}

function printFailedToEnterGiveaway(giveawayTitle: string): void {
    console.log('Failed to enter giveaway for: ' + giveawayTitle);
}

function printNumberOfEnteredGiveaways(giveawayCount: number): void {
    console.log('Entered ' + giveawayCount + (giveawayCount === 1 ? ' giveaway' : ' giveaways'));
}

function printRemainingPoints(points: number): void {
    console.log(points + (points === 1 ? ' point' : ' points') + ' left');
}

function printScrapedGiveawaysInfo(pageNumber: number, giveawayCount: number): void {
    console.log('Scrapped ' + pageNumber + (pageNumber === 1 ? ' page' : ' pages') +
        ' and found ' + giveawayCount + ' unique ' + (giveawayCount === 1 ? 'giveaway' : 'giveaways'));
}

export {
    customFilter,
    printCannotEnterGiveaway,
    printAlreadyInGiveaway,
    printEnteredGiveaway,
    printFailedToEnterGiveaway,
    printNumberOfEnteredGiveaways,
    printRemainingPoints,
    printScrapedGiveawaysInfo
};
