import fs from 'fs';
import {RequestedGames} from './interfaces';

const REQUESTED_GAMES_PATH = './requests.txt';

function initFile(): void {
    fs.writeFileSync('requests.txt', '[exact_match]\n\n[any_match]\n');
}

function exists(): boolean {
    let result = false;
    try {
        if (fs.existsSync(REQUESTED_GAMES_PATH)) {
            result = true;
        }
    } catch (err) {
        result = false;
    }
    return result;
}

function sortEntries(): void {
    console.time('Sorting and filtering entries');
    const games = readGames();
    const linesToWrite = [
        '[exact_match]',
        ...Array.from(new Set(games.exactMatches)).sort(),
        '[any_match]',
        ...Array.from(new Set(games.anyMatches)).sort()
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
    const exactMatches = [];
    const anyMatches = [];

    if (exactMatchIndex > -1) {
        for (let i = exactMatchIndex + 1; i < lines.length; i++) {
            if (lines[i] === '[any_match]') {
                break;
            } else {
                exactMatches.push(lines[i]);
            }
        }
    }

    if (anyMatchIndex > -1) {
        for (let i = anyMatchIndex + 1; i < lines.length; i++) {
            if (lines[i] === '[exact_match]') {
                break;
            } else {
                anyMatches.push(lines[i]);
            }
        }
    }

    return {exactMatches, anyMatches};
}

function getRequestedGames(): RequestedGames {
    sortEntries();
    return readGames();
}

export {exists, getRequestedGames, initFile};
