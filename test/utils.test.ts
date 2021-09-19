import {customMatch} from '../src/utils';

it('correctly filters game titles when RequestedGames are empty', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: [],
        noMatches: []
    };

    expect(customMatch('', requestedGames)).toEqual(false);
    expect(customMatch('test', requestedGames)).toEqual(false);
    expect(customMatch('123', requestedGames)).toEqual(false);
});

it('correctly filters game titles when RequestedGames contain duplicates', () => {
    const requestedGames = {
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: ['test']
    };

    expect(customMatch('', requestedGames)).toEqual(false);
    expect(customMatch('test', requestedGames)).toEqual(false);
    expect(customMatch('123', requestedGames)).toEqual(false);
});

it('correctly filters game titles when RequestedGames contain only exactMatches', () => {
    const requestedGames = {
        exactMatches: ['test'],
        anyMatches: [],
        noMatches: []
    };

    expect(customMatch('', requestedGames)).toEqual(false);
    expect(customMatch('test', requestedGames)).toEqual(true);
    expect(customMatch('123', requestedGames)).toEqual(false);
    expect(customMatch('TEST', requestedGames)).toEqual(true);
});

it('correctly filters game titles when RequestedGames contain only anyMatches', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: ['test'],
        noMatches: []
    };

    expect(customMatch('', requestedGames)).toEqual(false);
    expect(customMatch('test', requestedGames)).toEqual(true);
    expect(customMatch('123', requestedGames)).toEqual(false);
    expect(customMatch('TEST', requestedGames)).toEqual(true);
    expect(customMatch('abcTESTabc', requestedGames)).toEqual(true);
    expect(customMatch('123TEST123', requestedGames)).toEqual(true);
});

it('correctly filters game titles when RequestedGames contain anyMatches and noMatches', () => {
    const requestedGames = {
        exactMatches: [],
        anyMatches: ['test'],
        noMatches: ['123test123']
    };

    expect(customMatch('', requestedGames)).toEqual(false);
    expect(customMatch('test', requestedGames)).toEqual(true);
    expect(customMatch('123', requestedGames)).toEqual(false);
    expect(customMatch('TEST', requestedGames)).toEqual(true);
    expect(customMatch('abcTESTabc', requestedGames)).toEqual(true);
    expect(customMatch('123test123', requestedGames)).toEqual(false);
    expect(customMatch('123TEST123', requestedGames)).toEqual(false);
});
