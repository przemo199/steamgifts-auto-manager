import {Browser} from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import {getGiveawaysFromHtml} from './giveaway-scrapper.js';
import {Giveaway} from './interfaces';
import * as utils from './utils.js';

puppeteer.use(pluginStealth());

const BASE_URL = 'https://www.steamgifts.com/';
const LOGIN_URL = BASE_URL + '/?login';
const SEARCH_URL = BASE_URL + 'giveaways/search?page=';
const ENTERED_GIVEAWAYS_SEARCH_URL = BASE_URL + '/giveaways/entered/search?page=';

let browser: Browser;

async function launchBrowser(headless = true): Promise<Browser> {
    // @ts-ignore
    return puppeteer.launch({headless: headless, userDataDir: './tmp/userData'});
}

async function enterGiveaway(giveaway: Giveaway): Promise<boolean> {
    let result = false;
    const page = await browser.newPage();
    await page.goto(BASE_URL + giveaway.relativeUrl, {waitUntil: 'domcontentloaded'});

    if ((await page.$$('.sidebar__error')).length != 0) {
        utils.printCannotEnterGiveaway(giveaway.gameTitle);
    } else {
        if ((await page.$$('.sidebar__entry-insert.is-hidden')).length != 0) {
            utils.printAlreadyInGiveaway(giveaway.gameTitle);
        } else {
            if ((await page.$$('.sidebar__entry-insert')).length != 0) {
                try {
                    await page.click('.sidebar__entry-insert');
                    await page.waitForSelector('.sidebar__entry-insert.is-hidden', {timeout: 2000});
                    utils.printEnteredGiveaway(giveaway.gameTitle);
                    result = true;
                } catch (e) {
                    utils.printFailedToEnterGiveaway(giveaway.gameTitle);
                }
            } else {
                utils.printFailedToEnterGiveaway(giveaway.gameTitle);
            }
        }
    }

    page.close();
    return result;
}

async function getAccountLevel(): Promise<number> {
    let level = 0; // if failed to retrieve account level assume lowest possible level
    const page = await browser.newPage();
    await page.goto(BASE_URL, {waitUntil: 'domcontentloaded'});
    const profileElement = await page.$('a[href="/account"]');
    if (profileElement) {
        const span = (await profileElement.$$('span'))[1];
        const accountLevel = await span.evaluate(el => el.getAttribute('title'));
        if (accountLevel) {
            level = parseInt(accountLevel, 10);
        }
    }
    page.close();
    return level;
}

async function getPointState(): Promise<number> {
    let points = 400; // if failed to retrieve the state of points assume the highest possible value
    const page = await browser.newPage();
    await page.goto(BASE_URL, {waitUntil: 'domcontentloaded'});
    const textContent = await (await page.$('.nav__points'))?.evaluate(el => el.textContent);
    if (textContent) {
        points = parseInt(textContent, 10);
    }
    page.close();
    return points;
}

async function enterGiveaways(giveaways: Giveaway[]): Promise<void> {
    if (giveaways.length === 0) {
        console.log('No giveaways to enter');
        await browser.close();
        return;
    }

    console.time('Entered giveaways in');

    const accountLevel = await getAccountLevel();
    let points = await getPointState();
    const enteredGiveaways = await scrapeLinksToEnteredGiveaways();
    const promises = [];

    for (const giveaway of giveaways) {
        if (giveaway.requiredLevel <= accountLevel && giveaway.pointCost <= points &&
            !enteredGiveaways.includes(giveaway.relativeUrl)) {
            points -= giveaway.pointCost;
            promises.push(enterGiveaway(giveaway));
        }
    }

    const results = await Promise.all(promises);

    let enteredGiveawaysCount = 0;
    let failedGiveawaysCount = 0;

    for (const result of results) {
        if (result) {
            enteredGiveawaysCount++;
        } else {
            failedGiveawaysCount++;
        }
    }

    utils.printNumberOfEnteredGiveaways(enteredGiveawaysCount);
    utils.printRemainingPoints(points);
    console.timeEnd('Entered giveaways in');
    await browser.close();
}

async function scrapeLinksToEnteredGiveaways(): Promise<string[]> {
    const page = await browser.newPage();
    const result: string[] = [];
    let pageNumber = 1;
    let hasContent = true;

    do {
        await page.goto(ENTERED_GIVEAWAYS_SEARCH_URL + pageNumber, {waitUntil: 'domcontentloaded'});
        pageNumber++;
        const elements = await page.$$('.table__row-inner-wrap');

        for (const element of elements) {
            if (await element.$('.table__column__secondary-link')) {
                const elementUrl = await element.$('.table_image_thumbnail');
                if (elementUrl) {
                    const url = await elementUrl.evaluate(el => el.getAttribute('href'));
                    if (url) {
                        result.push(url);
                    }
                }
            } else {
                hasContent = false;
                break;
            }
        }
    } while (hasContent);

    return result;
}

async function scrapeGiveaways(): Promise<Giveaway[]> {
    console.time('Scraped giveaways in');
    const page = await browser.newPage();
    const giveawaysMap = new Map<string, Giveaway>();
    let pageNumber = 1;

    let html;
    do {
        await page.goto(SEARCH_URL + pageNumber, {waitUntil: 'domcontentloaded'});
        html = await page.content();
        getGiveawaysFromHtml(html).forEach(giveaway => {
            giveawaysMap.set(giveaway.relativeUrl, giveaway);
        });
        pageNumber++;
    } while (html.indexOf('No results were found.') == -1);
    page.close();

    const uniqueGiveaways = [...giveawaysMap.values()];
    console.timeEnd('Scraped giveaways in');
    utils.printScrapedGiveawaysInfo(pageNumber - 1, uniqueGiveaways.length);

    return uniqueGiveaways;
}

async function launchAndLogin(): Promise<void> {
    async function isLogged(b: Browser) {
        const page = await b.newPage();
        await page.goto(BASE_URL, {waitUntil: 'domcontentloaded'});
        const content = await page.content();
        page.close();
        return !content.includes(' Sign in through STEAM');
    }

    async function acceptPrivacyMonit(b: Browser) {
        const page = await b.newPage();
        await page.goto(BASE_URL, {waitUntil: 'domcontentloaded'});
        try {
            await page.waitForSelector('button[aria-label="AGREE"]', {timeout: 2000});
            await page.click('button[aria-label="AGREE"]');
            console.log('Privacy monit accepted');
        } catch {
            console.log('No privacy monit found');
        } finally {
            page.close();
        }
    }

    console.time('Browser launched in');
    let br = await launchBrowser();
    console.timeEnd('Browser launched in');

    if (!(await isLogged(br))) {
        await br.close();
        console.log('No login information detected, please login through steam in the launched window');
        br = await launchBrowser(false);
        const page = await br.newPage();
        await page.goto(LOGIN_URL, {waitUntil: 'domcontentloaded'});
        await page.waitForNavigation({timeout: 0, waitUntil: 'domcontentloaded'});
        if (!(await page.content()).includes('Account (')) {
            console.log('Login failed');
            process.exit();
        }
        await br.close();
        br = await launchBrowser();
    } else {
        console.log('User already logged in');
    }

    await acceptPrivacyMonit(br);

    browser = br;
}

export {launchAndLogin, enterGiveaways, scrapeGiveaways};
