import {RequestedGames} from './interfaces';

export function customMatch(gameTitle: string, requestedGames: RequestedGames): boolean {
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
