import {getGiveawaysFromHtml} from '../src/giveaway-scrapper';

it('incorrect input gives empty array as an output', () => {
    expect(getGiveawaysFromHtml('')).toEqual([]);
    expect(getGiveawaysFromHtml('123')).toEqual([]);
    expect(getGiveawaysFromHtml('abc')).toEqual([]);
    expect(getGiveawaysFromHtml('test')).toEqual([]);
});

it('correctly returns required values from html string', () => {
    const html = '<div class="giveaway__row-outer-wrap">\n' +
        '\t\t\t\t<div class="giveaway__row-inner-wrap">\n' +
        '\t\t\t\t\t<div class="giveaway__summary">\n' +
        '\t\t\t\t\t\t<h2 class="giveaway__heading">\n' +
        '\t\t\t\t\t\t\t<a class="giveaway__heading__name" href="testUrl">TestTitle</a><span class="giveaway__heading__thin">(10P)</span>\n' +
        '\t\t\t\t\t\t</h2>\n' +
        '\t\t\t\t\t\t<div class="giveaway__columns">\n' +
        '\t\t\t\t\t\t\t<div><i class="fa fa-clock-o"></i> <span data-timestamp="1632089940">15 minutes</span> remaining</div><div class="giveaway__column--width-fill text-right"></div></div>\n' +
        '\t\t\t\t\t\t</div><a href="/user/niknum" class="giveaway_image_avatar" ></a><a class="giveaway_image_thumbnail" href="testUrl"></a>\n' +
        '\t\t\t\t</div>\n' +
        '\t\t\t</div>';

    const expectedResult = {
        title: 'TestTitle',
        pointCost: 10,
        relativeUrl: 'testUrl',
        requiredLevel: 0
    };

    expect(getGiveawaysFromHtml(html)).toEqual([expectedResult]);
    expect(getGiveawaysFromHtml('<div>' + html + '</div>')).toEqual([expectedResult]);
    expect(getGiveawaysFromHtml(html + html)).toEqual([expectedResult, expectedResult]);
});
