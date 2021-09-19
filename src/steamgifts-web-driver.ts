import {Browser} from 'puppeteer';
import puppeteer from 'puppeteer-extra';
import pluginStealth from 'puppeteer-extra-plugin-stealth';
import {getGiveawaysFromHtml} from './giveaway-scrapper.js';
import {Giveaway} from './interfaces';

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
        console.log('Cannot enter giveaway for: ' + giveaway.gameTitle);
    } else {
        if ((await page.$$('.sidebar__entry-insert.is-hidden')).length != 0) {
            console.log('Already in giveaway for: ' + giveaway.gameTitle);
        } else {
            if ((await page.$$('.sidebar__entry-insert')).length != 0) {
                try {
                    await page.click('.sidebar__entry-insert');
                    await page.waitForSelector('.sidebar__entry-insert.is-hidden', {timeout: 2000});
                    console.log('Entered giveaway for: ' + giveaway.gameTitle);
                    result = true;
                } catch (e) {
                    console.log('Failed to enter giveaway for: ' + giveaway.gameTitle);
                }
            } else {
                console.log('Failed to enter giveaway for: ' + giveaway.gameTitle);
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

    console.time('Entering giveaways');
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

    let entered = 0;
    let notEntered = 0;

    for (const result of results) {
        if (result) {
            entered++;
        } else {
            notEntered++;
        }
    }

    console.log('Entered ' + entered + ' giveaway(s)');
    console.log('Failed to enter ' + notEntered + ' giveaway(s)');
    console.log(points + ' points left');
    console.timeEnd('Entering giveaways');
    await browser.close();
}

async function scrapeLinksToEnteredGiveaways(): Promise<string[]> {
    const page = await browser.newPage();
    const result: string[] = [];
    let i = 1;
    let hasContent = true;

    do {
        await page.goto(ENTERED_GIVEAWAYS_SEARCH_URL + i, {waitUntil: 'domcontentloaded'});
        i++;
        const entries = await page.$$('.table__row-inner-wrap');

        for (const entry of entries) {
            if (await entry.$('.table__column__secondary-link')) {
                const urlElement = await entry.$('.table_image_thumbnail');
                if (urlElement) {
                    const url = await urlElement.evaluate(el => el.getAttribute('href'));
                    if (url) {
                        result.push(url);
                    }
                }
            } else {
                hasContent = false;
            }
        }
    } while (hasContent);

    return result;
}

async function scrapeGiveaways(): Promise<Giveaway[]> {
    console.time('Scrapping giveaways');
    const page = await browser.newPage();
    const giveaways: Giveaway[] = [];
    let iterator = 1;

    await page.goto(SEARCH_URL + iterator, {waitUntil: 'domcontentloaded'});
    let html = await page.content();
    while (html.indexOf('No results were found.') == -1) {
        giveaways.push(...getGiveawaysFromHtml(html));
        iterator++;
        await page.goto(SEARCH_URL + iterator, {waitUntil: 'domcontentloaded'});
        html = await page.content();
    }

    const uniqueGiveaways = [...new Map(giveaways.map(giveaway => [giveaway['relativeUrl'], giveaway])).values()];
    console.log('Scrapped ' + (iterator - 1) + ' pages and found ' + uniqueGiveaways.length + ' unique games');
    console.timeEnd('Scrapping giveaways');

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

    let br = await launchBrowser();

    if (!(await isLogged(br))) {
        await br.close();
        br = await launchBrowser(false);
        const page = await br.newPage();
        await page.goto(LOGIN_URL, {waitUntil: 'domcontentloaded'});
        console.log('No login information detected, please login through steam in the launched window');
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
