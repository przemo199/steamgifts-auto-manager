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

function writeToRequestsFile(requestedGames: RequestedGames): void {
    const linesToWrite = [
        Tag.EXACT_MATCH,
        ...requestedGames.exactMatches,
        Tag.ANY_MATCH,
        ...requestedGames.anyMatches,
        Tag.NO_MATCH,
        ...requestedGames.noMatches
    ].join('\n') + '\n';
    fs.writeFileSync(REQUESTS_FILE, linesToWrite);
}

function readLines(): string[] {
    return fs.readFileSync(REQUESTS_FILE).toString().toLowerCase()
        .split('\n').map(line => line.trim()).filter(line => line !== '');
}

function readRequestsFileContent(): RequestedGames {
    function extractUniqueAndSortedTitlesByTag(tag: Tag): string[] {
        const tagIndex = lines.indexOf(tag);

        if (tagIndex === -1) return [];

        const tagMatches = [];
        const tagValues = Object.values<string>(Tag);
        for (let i = tagIndex + 1; i < lines.length; i++) {
            if (tagValues.includes(lines[i])) {
                break;
            } else {
                tagMatches.push(lines[i]);
            }
        }

        return [...new Set(tagMatches)].sort();
    }

    const lines = readLines();

    if (lines.indexOf(Tag.EXACT_MATCH) === -1 && lines.indexOf(Tag.ANY_MATCH) === -1) {
        throw new Error('No required tag found in requests.txt');
    }

    return {
        exactMatches: extractUniqueAndSortedTitlesByTag(Tag.EXACT_MATCH),
        anyMatches: extractUniqueAndSortedTitlesByTag(Tag.ANY_MATCH),
        noMatches: extractUniqueAndSortedTitlesByTag(Tag.NO_MATCH)
    };
}

function getRequestedGames(): RequestedGames {
    console.time('Sorting and filtering entries');
    const requestedGames = readRequestsFileContent();
    writeToRequestsFile(requestedGames);
    console.timeEnd('Sorting and filtering entries');
    return requestedGames;
}

export {exists, getRequestedGames};
