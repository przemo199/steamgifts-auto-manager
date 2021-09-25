import fs from 'fs';
import {RequestedGames} from './interfaces';

enum Tag {
    EXACT_MATCH = '[exact_match]',
    ANY_MATCH = '[any_match]',
    NO_MATCH = '[no_match]'
}

const REQUESTS_FILE = './requests.txt';

function exists(): void {
    if (!fs.existsSync(REQUESTS_FILE)) {
        fs.writeFileSync(REQUESTS_FILE, `${Tag.EXACT_MATCH}\n\n${Tag.ANY_MATCH}\n\n${Tag.NO_MATCH}\n`);
        throw new Error('requests.txt not found, its scaffold has been created in root directory');
    }
}

function sortEntries(): void {
    console.time('Sorting and filtering entries');
    const games = readGames();
    const linesToWrite = [
        Tag.EXACT_MATCH,
        ...Array.from(new Set(games.exactMatches)).sort(),
        Tag.ANY_MATCH,
        ...Array.from(new Set(games.anyMatches)).sort(),
        Tag.NO_MATCH,
        ...Array.from(new Set(games.noMatches)).sort()
    ].join('\n') + '\n';
    fs.writeFileSync(REQUESTS_FILE, linesToWrite);
    console.timeEnd('Sorting and filtering entries');
}

function readLines(): string[] {
    return fs.readFileSync(REQUESTS_FILE).toString().toLowerCase()
        .split('\n').map(line => line.trim()).filter(line => line !== '');
}

function readGames(): RequestedGames {
    function extractTitlesByTag(tag: Tag): string[] {
        const tagIndex =  lines.indexOf(tag);

        const tagMatches = [];
        if (tagIndex > -1) {
            for (let i = tagIndex + 1; i < lines.length; i++) {
                if (Object.values<string>(Tag).includes(lines[i])) {
                    break;
                } else {
                    tagMatches.push(lines[i]);
                }
            }
        }

        return tagMatches;
    }

    const lines = readLines();

    if (lines.indexOf(Tag.EXACT_MATCH) === -1 && lines.indexOf(Tag.ANY_MATCH) === -1) {
        throw new Error('No required tag found in requests.txt');
    }

    return {
        exactMatches: extractTitlesByTag(Tag.EXACT_MATCH),
        anyMatches: extractTitlesByTag(Tag.ANY_MATCH),
        noMatches: extractTitlesByTag(Tag.NO_MATCH)
    };
}

function getRequestedGames(): RequestedGames {
    sortEntries();
    return readGames();
}

export {exists, getRequestedGames};
