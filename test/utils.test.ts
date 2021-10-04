import {customFilter} from '../src/utils';

it('correctly filters game titles when RequestedGames are empty', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: [],
        noMatches: []
    };

    expect(customFilter('', requestedGames)).toEqual(false);
    expect(customFilter('test', requestedGames)).toEqual(false);
    expect(customFilter('123', requestedGames)).toEqual(false);
});

it('correctly filters game titles when RequestedGames contain duplicates', () => {
    const requestedGames = {
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: ['test']
    };

    expect(customFilter('', requestedGames)).toEqual(false);
    expect(customFilter('test', requestedGames)).toEqual(false);
    expect(customFilter('123', requestedGames)).toEqual(false);
});

it('correctly filters game titles when RequestedGames contain only exactMatches', () => {
    const requestedGames = {
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: []
    };

    expect(customFilter('', requestedGames)).toEqual(false);
    expect(customFilter('test', requestedGames)).toEqual(true);
    expect(customFilter('123', requestedGames)).toEqual(false);
    expect(customFilter('TEST', requestedGames)).toEqual(true);
});

it('correctly filters game titles when RequestedGames contain only anyMatches', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: ['test'],
        noMatches: []
    };

    expect(customFilter('', requestedGames)).toEqual(false);
    expect(customFilter('test', requestedGames)).toEqual(true);
    expect(customFilter('123', requestedGames)).toEqual(false);
    expect(customFilter('TEST', requestedGames)).toEqual(true);
    expect(customFilter('abcTESTabc', requestedGames)).toEqual(true);
    expect(customFilter('123TEST123', requestedGames)).toEqual(true);
});

it('correctly filters game titles when RequestedGames contain anyMatches and noMatches', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: ['test'],
        noMatches: ['123test123']
    };

    expect(customFilter('', requestedGames)).toEqual(false);
    expect(customFilter('test', requestedGames)).toEqual(true);
    expect(customFilter('123', requestedGames)).toEqual(false);
    expect(customFilter('TEST', requestedGames)).toEqual(true);
    expect(customFilter('abcTESTabc', requestedGames)).toEqual(true);
    expect(customFilter('123test123', requestedGames)).toEqual(false);
    expect(customFilter('123TEST123', requestedGames)).toEqual(false);
});
