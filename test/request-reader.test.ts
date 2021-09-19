import fs from 'fs';
import * as RequestsReader from '../src/requests-reader';

jest.mock('fs');

function mockFunction<T extends (...args: any[]) => any>(fn: T): jest.MockedFunction<T> {
    return fn as jest.MockedFunction<T>;
}

const existsSyncMock = mockFunction(fs.existsSync);
const readFileSyncMock = mockFunction(fs.readFileSync);
const writeFileSyncMock = mockFunction(fs.writeFileSync);

it('throws when the file doesnt exist', () => {
    existsSyncMock.mockImplementation(() => false);
    expect(() => {
        RequestsReader.exists();
    }).toThrow('requests.txt not found, fill newly created file with game titles');
});

it('doesnt throw when the file exists', () => {
    existsSyncMock.mockImplementation(() => true);
    expect(() => {
        RequestsReader.exists();
    }).not.toThrow();
});

it('reads the titles under exact_match tag correctly', () => {
    readFileSyncMock.mockImplementation(() => '[exact_match]\ntest\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: []});

    readFileSyncMock.mockImplementation(() => '[exact_match]\ntest\ntest2\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: ['test', 'test2'],
        anyMatches: [],
        noMatches: []
    });
});

it('reads the titles under any_match tag correctly', () => {
    readFileSyncMock.mockImplementation(() => '[any_match]\ntest\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: [],
        anyMatches: ['test'],
        noMatches: []
    });

    readFileSyncMock.mockImplementation(() => '[any_match]\ntest\ntest2\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: [],
        anyMatches: ['test', 'test2'],
        noMatches: []
    });
});

it('reads the titles under no_match tag correctly', () => {
    readFileSyncMock.mockImplementation(() => '[exact_match]\ntest\n[no_match]\ntest1\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: ['test1']
    });

    readFileSyncMock.mockImplementation(() => '[exact_match]\ntest\n[no_match]\ntest1\ntest2\n');
    expect(RequestsReader.getRequestedGames()).toEqual({
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: ['test1', 'test2']
    });
});
