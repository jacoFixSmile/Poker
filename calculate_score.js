// high card maybe look at cards in hand?
function getFrequencyMap(cards) {
    const rankCount = {};
    const suitCount = {};
    const suitMap = {};

    for (const card of cards) {
        rankCount[card.rank] = (rankCount[card.rank] || 0) + 1;
        suitCount[card.suit] = (suitCount[card.suit] || 0) + 1;

        if (!suitMap[card.suit]) suitMap[card.suit] = [];
        suitMap[card.suit].push(card);
    }

    return { rankCount, suitCount, suitMap };
}
function getRanksByCount(rankCount, count) {
    return Object.entries(rankCount)
        .filter(([_, c]) => c === count)
        .map(([r]) => +r)
        .sort((a, b) => b - a);
}
function isFlush(suitMap) {
    for (let suit in suitMap) {
        if (suitMap[suit].length >= 5) {
            return suitMap[suit].sort((a, b) => b.rank - a.rank); // sorted for kicker
        }
    }
    return null;
}
function isStraight(cards) {
    const ranks = [...new Set(cards.map(c => c.rank).sort((a, b) => b - a))];

    // Ace-low straight (A,2,3,4,5) support
    if (ranks.includes(12)) ranks.push(-1); // Treat Ace as low (rank -1)

    for (let i = 0; i <= ranks.length - 5; i++) {
        const slice = ranks.slice(i, i + 5);
        if (slice[0] - slice[4] === 4) return slice;
    }

    return null;
}
function getCardsByRank(cards, rank, count) {
    return cards.filter(c => c.rank === rank).slice(0, count);
}
function getKickers(cards, usedRanks, count) {
    return cards
        .filter(c => !usedRanks.includes(c.rank))
        .sort((a, b) => b.rank - a.rank)
    [0];
}
function evaluatePlayerHand(cards) {
    const { rankCount, suitMap } = getFrequencyMap(cards);

    const flushCards = isFlush(suitMap);
    const straightFlush = flushCards && isStraight(flushCards);

    if (straightFlush) {
        return {
            rank: 1000 + Number(straightFlush.slice(0, 1)),
            name: 'Straight Flush',
            cards: straightFlush.slice(0, 5),
        };
    }

    // Four of a Kind
    const quads = getRanksByCount(rankCount, 4);
    if (quads.length) {
        const kicker = getKickers(cards, [quads[0]], 1);
        return {
            rank: 900 + Number(quads[0]) + (Number(kicker.rank) / 100),
            name: 'Four of a Kind',
            cards: [...getCardsByRank(cards, quads[0], 4), kicker]
        };
    }

    // Full House
    const trips = getRanksByCount(rankCount, 3);
    const pairs = getRanksByCount(rankCount, 2);

    if (trips.length && (pairs.length || trips.length > 1)) {
        const triple = trips[0];
        const pair = (trips.length > 1) ? trips[1] : pairs[0];
        return {
            rank: 800 + (trips[0])+(pairs[0]/100),
            name: 'Full House',
            cards: [...getCardsByRank(cards, triple, 3), ...getCardsByRank(cards, pair, 2)]
        };
    }

    // Flush
    if (flushCards) {
        return {
            rank: 700,
            name: 'Flush',
            cards: flushCards.slice(0, 5)
        };
    }

    // Straight
    const straight = isStraight(cards);
    if (straight) {
        return {
            rank: 600+straight[0],
            name: 'Straight',
            cards: straight.map(rank => cards.find(c => c.rank === rank)).slice(0, 5)
        };
    }

    // Three of a Kind
    if (trips.length) {
        const kicker = getKickers(cards, [trips[0]], 2);
        return {
            rank: 500 + trips[0] + (Number(kicker.rank) / 100),
            name: 'Three of a Kind',
            cards: [...getCardsByRank(cards, trips[0], 3), kicker]
        };
    }

    // Two Pair
    if (pairs.length >= 2) {
        const topTwo = pairs.slice(0, 2);
        const kicker = getKickers(cards, topTwo, 1);
        return {
            rank: 400+topTwo[0]+(topTwo[1]/100)+ (Number(kicker.rank) / 10000),
            name: 'Two Pair',
            cards: [...getCardsByRank(cards, topTwo[0], 2), ...getCardsByRank(cards, topTwo[1], 2), kicker]
        };
        
    }

    // One Pair
    if (pairs.length === 1) {
        const kicker = getKickers(cards, [pairs[0]], 3);
        return {
            rank: 200+pairs[0]+ (Number(kicker.rank) / 100),
            name: 'One Pair',
            cards: [...getCardsByRank(cards, pairs[0], 2), kicker]
        };
    }

    // High Card
    const highCards = cards
        .sort((a, b) => b.rank - a.rank)
        .slice(0, 5);

    return {
        rank: 100+highCards[0].rank,
        name: 'High Card',
        cards: highCards
    };
}
module.exports = { evaluatePlayerHand };