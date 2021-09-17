import {JSDOM} from 'jsdom';
import {Giveaway} from './interfaces';

const DIGITS_ONLY_REGEX = /\d+/;

const THUMBNAIL_CLASS = '.giveaway_image_thumbnail';
const THUMBNAIL_MISSING_CLASS = '.giveaway_image_thumbnail_missing';
const INNER_GAME_WRAP_CLASS = '.giveaway__row-inner-wrap';
const GAME_NAME_CLASS = '.giveaway__heading__name';
const GAME_MISC_CLASS = '.giveaway__heading__thin';
const REQUIRED_LEVEL_CLASS = '.giveaway__column--contributor-level.giveaway__column--contributor-level--negative';

function getGiveawaysFromHtml(html: string): Giveaway[] {
    function getRelativeUrl(game: Element) {
        return game.querySelector(THUMBNAIL_CLASS) || game.querySelector(THUMBNAIL_MISSING_CLASS);
    }

    function getRequiredLevel(game: Element) {
        const temp = game.querySelector(REQUIRED_LEVEL_CLASS);

        if (temp && temp.textContent) {
            const matchResult = temp.textContent.match(DIGITS_ONLY_REGEX);
            if (matchResult && matchResult[0]) {
                return parseInt(matchResult[0]);
            }
        } else {
            return 0;
        }
    }

    function getPointCost(game: Element): number {
        let result = 0;
        const elems = game.querySelectorAll(GAME_MISC_CLASS);
        const elem = elems[elems.length - 1];
        const toCheck = elem.textContent?.match(DIGITS_ONLY_REGEX);
        if (toCheck && toCheck[0]) {
            result = parseInt(toCheck[0]);
        }
        return result;
    }

    const document = new JSDOM(html).window.document;
    const gamesList = [];
    const games = document.querySelectorAll(INNER_GAME_WRAP_CLASS);
    for (const game of games) {
        const gameTitle = game.querySelector(GAME_NAME_CLASS)?.textContent || '';
        const pointCost = getPointCost(game);
        const relativeUrl = getRelativeUrl(game)?.getAttribute('href') || '';
        const requiredLevel = getRequiredLevel(game) || 0;
        gamesList.push({gameTitle, pointCost, requiredLevel, relativeUrl});
    }

    return gamesList;
}

export {getGiveawaysFromHtml};
