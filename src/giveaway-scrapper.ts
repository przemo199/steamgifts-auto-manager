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
    function getGiveawayTitle(giveaway: Element) {
        return giveaway.querySelector(GAME_NAME_CLASS)?.textContent || '';
    }

    function getGiveawayPointCost(giveaway: Element): number {
        let result = 0;
        const elems = giveaway.querySelectorAll(GAME_MISC_CLASS);
        const elem = elems[elems.length - 1];
        const toCheck = elem.textContent?.match(DIGITS_ONLY_REGEX);
        if (toCheck && toCheck[0]) {
            result = parseInt(toCheck[0]);
        }
        return result;
    }

    function getGiveawayRelativeUrl(giveaway: Element) {
        const urlElement = giveaway.querySelector(THUMBNAIL_CLASS) || giveaway.querySelector(THUMBNAIL_MISSING_CLASS);
        return urlElement?.getAttribute('href') || '';
    }

    function getGiveawayRequiredLevel(giveaway: Element) {
        const levelElement = giveaway.querySelector(REQUIRED_LEVEL_CLASS);

        if (levelElement && levelElement.textContent) {
            const matchResult = levelElement.textContent.match(DIGITS_ONLY_REGEX);
            if (matchResult && matchResult[0]) {
                return parseInt(matchResult[0]);
            }
        }
        return 0;
    }

    const document = (new JSDOM(html)).window.document;
    const giveawayList = [];
    const giveaways = document.querySelectorAll(INNER_GAME_WRAP_CLASS);

    for (const giveaway of giveaways) {
        const title = getGiveawayTitle(giveaway);
        const pointCost = getGiveawayPointCost(giveaway);
        const relativeUrl = getGiveawayRelativeUrl(giveaway);
        const requiredLevel = getGiveawayRequiredLevel(giveaway);
        giveawayList.push({title, pointCost, requiredLevel, relativeUrl});
    }

    return giveawayList;
}

export {getGiveawaysFromHtml};
