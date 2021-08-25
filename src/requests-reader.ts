import fs from 'fs';
import {RequestedGames} from './interfaces';

const REQUESTED_GAMES_PATH = './requests.txt';

function exists(): void {
    if (!fs.existsSync(REQUESTED_GAMES_PATH)) {
        fs.writeFileSync('requests.txt', '[exact_match]\n\n[any_match]\n\n[no_match]\n');
        throw new Error('requests.txt not found, fill newly created file with game titles');
    }
}

function sortEntries(): void {
    console.time('Sorting and filtering entries');
    const games = readGames();
    const linesToWrite = [
        '[exact_match]',
        ...Array.from(new Set(games.exactMatches)).sort(),
        '[any_match]',
        ...Array.from(new Set(games.anyMatches)).sort(),
        '[no_match]',
        ...Array.from(new Set(games.noMatches)).sort()
    ];
    fs.writeFileSync(REQUESTED_GAMES_PATH, linesToWrite.join('\n') + '\n');
    console.timeEnd('Sorting and filtering entries');
}

function readLines(): string[] {
    return fs.readFileSync(REQUESTED_GAMES_PATH).toString().toLowerCase()
    .split('\n').map(line => line.trim()).filter(line => line !== '');
}

function readGames(): RequestedGames {
    const lines = readLines();
    const exactMatchIndex = lines.indexOf('[exact_match]');
    const anyMatchIndex = lines.indexOf('[any_match]');
    const noMatchIndex = lines.indexOf('[no_match]');
    const exactMatches: string[] = [];
    const anyMatches: string[] = [];
    const noMatches: string[] = [];

    if (exactMatchIndex > -1) {
        for (let i = exactMatchIndex + 1; i < lines.length; i++) {
            if (['[any_match]', '[no_match]'].indexOf(lines[i]) > -1) {
                break;
            } else {
                exactMatches.push(lines[i]);
            }
        }
    }

    if (anyMatchIndex > -1) {
        for (let i = anyMatchIndex + 1; i < lines.length; i++) {
            if (['[exact_match]', '[no_match]'].indexOf(lines[i]) > -1) {
                break;
            } else {
                anyMatches.push(lines[i]);
            }
        }
    }

    if (noMatchIndex > -1) {
        for (let i = noMatchIndex + 1; i < lines.length; i++) {
            if (['[exact_match]', '[any_match]'].indexOf(lines[i]) > -1) {
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
