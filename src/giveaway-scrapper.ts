import got from 'got';
import {JSDOM} from 'jsdom';
import {Giveaway} from './interfaces';

const BASE_URL = 'https://www.steamgifts.com/';
const SEARCH_URL = BASE_URL + 'giveaways/search?page=';

const DIGITS_ONLY_REGEX = /\d+/;

const THUMBNAIL_CLASS = '.giveaway_image_thumbnail';
const THUMBNAIL_MISSING_CLASS = '.giveaway_image_thumbnail_missing';
const INNER_GAME_WRAP_CLASS = '.giveaway__row-inner-wrap';
const GAME_NAME_CLASS = '.giveaway__heading__name';
const GAME_MISC_CLASS = '.giveaway__heading__thin';
const REQUIRED_LEVEL_CLASS = '.giveaway__column--contributor-level.giveaway__column--contributor-level--negative';

const HEADERS = {
    'authority': 'www.steamgifts.com',
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
    'dnt': '1',
    'upgrade-insecure-requests': '1',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.77 Safari/537.36',
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
    'sec-fetch-site': 'none',
    'sec-fetch-mode': 'navigate',
    'sec-fetch-dest': 'document',
    'accept-language': 'en-GB, en;q=0.9'
};

async function getHtmlFromUrl(url: string): Promise<string> {
    return (await got(url, {headers: HEADERS})).body;
}

async function scrapeGiveaways(): Promise<Giveaway[]> {
    console.time('Scrapping giveaways');
    let document;
    let i = 1;
    const games: Giveaway[] = [];

    document = await getHtmlFromUrl(SEARCH_URL + i);
    while (document.indexOf('No results were found.') == -1) {
        games.push(...getGiveawaysFromHtml(document));
        i++;
        document = await getHtmlFromUrl(SEARCH_URL + i);
    }
    const result = [...new Map(games.map(game => [game['relativeUrl'], game])).values()];
    console.log('Scrapped ' + i + ' pages and found ' + result.length + ' unique games');
    console.timeEnd('Scrapping giveaways');
    return result;
}

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

    function getPointCost(game:  Element): number {
        let result = 0;
        const elems = game.querySelectorAll(GAME_MISC_CLASS);
        const elem = elems[elems.length - 1];
        const toCheck = elem.textContent?.match(DIGITS_ONLY_REGEX);
        if (toCheck && toCheck[0]) {
            result = +toCheck[0];
        }
        return result;
    }

    const document = new JSDOM(html).window.document;
    const gamesList = [];
    const games = document.querySelectorAll(INNER_GAME_WRAP_CLASS);
    for (const game of games) {
        const gameTitle = game.querySelector(GAME_NAME_CLASS)!.textContent || '';
        const pointCost = getPointCost(game);
        const relativeUrl = getRelativeUrl(game)!.getAttribute('href') || '';
        const requiredLevel = getRequiredLevel(game) || 0;
        gamesList.push({gameTitle, pointCost, requiredLevel, relativeUrl});
    }

    return gamesList;
}

export {scrapeGiveaways};
