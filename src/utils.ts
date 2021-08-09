export function customMatch(gameTitle: string, gameList: string[]): boolean {
    let result = false;
    const title = gameTitle.toLowerCase();
    if (title.substring(title.length - 3) == '...') {
        const shortTitle = title.substring(0, title.length - 3);
        for (const game of gameList) {
            if (game.includes(shortTitle) && game.length > shortTitle.length) {
                result = true;
                break;
            }
        }
    } else {
        result = gameList.includes(title);
    }

    return result;
}
