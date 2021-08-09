import fs from 'fs';

const REQUESTED_GAMES_PATH = './requests.txt';

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

function sortEntries() {
    console.time('Sorting and filtering entries');
    const games = Array.from(new Set(readLines())).sort();
    fs.writeFileSync(REQUESTED_GAMES_PATH, '');
    for (const game of games) {
        fs.appendFileSync(REQUESTED_GAMES_PATH, game + '\n');
    }
    console.timeEnd('Sorting and filtering entries');
}

function readLines(): string[] {
    const lines = fs.readFileSync(REQUESTED_GAMES_PATH).toString().toLowerCase().split('\n');
    return lines.map(line => line.trim()).filter(line => line !== '');
}

function getRequestedGames(): string[] {
    sortEntries();
    return readLines();
}

export {exists, getRequestedGames};
