interface Giveaway {
    gameTitle: string;
    pointCost: number;
    requiredLevel: number;
    relativeUrl: string;
}

interface RequestedGames {
    exactMatches: string[];
    anyMatches: string[];
}

export {Giveaway, RequestedGames};
