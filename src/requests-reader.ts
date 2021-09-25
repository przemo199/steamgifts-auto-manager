import fs from 'fs';
import {RequestedGames} from './interfaces';

const EXACT_MATCH_TAG = '[exact_match]';
const ANY_MATCH_TAG = '[any_match]';
const NO_MATCH_TAG = '[no_match]';

const REQUESTS_TXT_PATH = './requests.txt';

function exists(): void {
    if (!fs.existsSync(REQUESTS_TXT_PATH)) {
        fs.writeFileSync(REQUESTS_TXT_PATH, `${EXACT_MATCH_TAG}\n\n${ANY_MATCH_TAG}\n\n${NO_MATCH_TAG}\n`);
        throw new Error('requests.txt not found, its scaffold has been created in root directory');
    }
}

function sortEntries(): void {
    console.time('Sorting and filtering entries');
    const games = readGames();
    const linesToWrite = [
        EXACT_MATCH_TAG,
        ...Array.from(new Set(games.exactMatches)).sort(),
        ANY_MATCH_TAG,
        ...Array.from(new Set(games.anyMatches)).sort(),
        NO_MATCH_TAG,
        ...Array.from(new Set(games.noMatches)).sort()
    ];
    fs.writeFileSync(REQUESTS_TXT_PATH, linesToWrite.join('\n') + '\n');
    console.timeEnd('Sorting and filtering entries');
}

function readLines(): string[] {
    return fs.readFileSync(REQUESTS_TXT_PATH).toString().toLowerCase()
    .split('\n').map(line => line.trim()).filter(line => line !== '');
}

function readGames(): RequestedGames {
    const lines = readLines();
    const exactMatchIndex = lines.indexOf(EXACT_MATCH_TAG);
    const anyMatchIndex = lines.indexOf(ANY_MATCH_TAG);
    const noMatchIndex = lines.indexOf(NO_MATCH_TAG);
    const exactMatches: string[] = [];
    const anyMatches: string[] = [];
    const noMatches: string[] = [];

    if (exactMatchIndex > -1) {
        for (let i = exactMatchIndex + 1; i < lines.length; i++) {
            if ([ANY_MATCH_TAG, NO_MATCH_TAG].indexOf(lines[i]) > -1) {
                break;
            } else {
                exactMatches.push(lines[i]);
            }
        }
    }

    if (anyMatchIndex > -1) {
        for (let i = anyMatchIndex + 1; i < lines.length; i++) {
            if ([EXACT_MATCH_TAG, NO_MATCH_TAG].indexOf(lines[i]) > -1) {
                break;
            } else {
                anyMatches.push(lines[i]);
            }
        }
    }

    if (noMatchIndex > -1) {
        for (let i = noMatchIndex + 1; i < lines.length; i++) {
            if ([EXACT_MATCH_TAG, ANY_MATCH_TAG].indexOf(lines[i]) > -1) {
                break;
            } else {
                noMatches.push(lines[i]);
            }
        }
    }

    if (exactMatchIndex === -1 && anyMatchIndex === -1) {
        throw new Error('no match tag found in requests.txt');
    }

    return {exactMatches, anyMatches, noMatches};
}

function getRequestedGames(): RequestedGames {
    sortEntries();
    return readGames();
}

export {exists, getRequestedGames};
