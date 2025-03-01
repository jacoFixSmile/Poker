function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


class Game {
    constructor(name) {
        console.log("====game launced====")
        this.name = name
        this.players = []
        this.sets = []
        // set game settings, game mode, small bigg, start coins
    }
    addPlayer(player) {
        // check number of players isn't larger than 10
        this.players.push(player)
    }
    removePlayer(name) {
        //
    }
    playSet() {
        // check all players have 
        console.log('starting set with:')
        console.log(this.players)
        this.sets.push(new set(this.players))
    }
    getLastSet(){
        return this.sets[this.sets.length-1]
    }
}
class set {
    constructor(players) { //players
        this.players = players
        this.deck = [
            [
                "ace_of_clubs.png", "2_of_clubs.png", "3_of_clubs.png", "4_of_clubs.png", "5_of_clubs.png",
                "6_of_clubs.png", "7_of_clubs.png", "8_of_clubs.png", "9_of_clubs.png", "10_of_clubs.png",
                "jack_of_clubs.png", "jack_of_clubs2.png", "queen_of_clubs.png", "queen_of_clubs2.png",
                "king_of_clubs.png", "king_of_clubs2.png"
            ],
            [
                "ace_of_diamonds.png", "2_of_diamonds.png", "3_of_diamonds.png", "4_of_diamonds.png", "5_of_diamonds.png",
                "6_of_diamonds.png", "7_of_diamonds.png", "8_of_diamonds.png", "9_of_diamonds.png", "10_of_diamonds.png",
                "jack_of_diamonds.png", "jack_of_diamonds2.png", "queen_of_diamonds.png", "queen_of_diamonds2.png",
                "king_of_diamonds.png", "king_of_diamonds2.png"
            ],
            [
                "ace_of_hearts.png", "2_of_hearts.png", "3_of_hearts.png", "4_of_hearts.png", "5_of_hearts.png",
                "6_of_hearts.png", "7_of_hearts.png", "8_of_hearts.png", "9_of_hearts.png", "10_of_hearts.png",
                "jack_of_hearts.png", "jack_of_hearts2.png", "queen_of_hearts.png", "queen_of_hearts2.png",
                "king_of_hearts.png", "king_of_hearts2.png"
            ],
            [
                "ace_of_spades.png", "ace_of_spades2.png", "2_of_spades.png", "3_of_spades.png", "4_of_spades.png",
                "5_of_spades.png", "6_of_spades.png", "7_of_spades.png", "8_of_spades.png", "9_of_spades.png",
                "10_of_spades.png", "jack_of_spades.png", "jack_of_spades2.png", "queen_of_spades.png", "queen_of_spades2.png",
                "king_of_spades.png", "king_of_spades2.png"
            ]
        ]
        this.usedCards = []
        this.table = []
        this.hands = []
        this.startSet()
    }

    pickCard() {
        if (this.usedCards.includes())
            var isUsedCard;
        do {
            isUsedCard = false
            var suit = getRandomInt(4)
            var rank = getRandomInt(16)
            for (var i = 0; i < this.usedCards.length; i++) {
                if (this.usedCards[i].name === this.deck[suit][rank]) {
                    isUsedCard = true;
                }
            }
        } while (isUsedCard)
        var card = { 'name': this.deck[suit][rank], 'suit': suit, "rank": rank }
        this.usedCards.push(card)
        return card
    }
    printDeck() {
        for (var i = 0; i < this.deck.length; i++) {
            for (var j = 0; j < this.deck[i].length; j++) {
                console.log(this.deck[i][j] + ' ' + [i] + ':' + [j]);
            }

        }
    }
    makeTable() {
        console.log("Setting table")
        for (var i = 0; i < 5; i++) {
            var card = this.pickCard()
            this.table.push(card)
        }
        return this.table
    }
    makeHand() {
        var hand = [this.pickCard(), this.pickCard()]
        return hand

    }
    startSet(){
        this.makeTable()
        console.log(this.table)
        // give player hands
        for(var i=0; i< this.players.length;i++){
            this.players[i]['hand']=this.makeHand()
            console.log(this.players[i])
        }
        console.log(this.board)
    }
    sortCards(cards) {
            return cards.sort((a, b) => a.rank - b.rank);
    }
    foldPlayer(id){
        this.players = this.players.filter(player => player.id !== id);    
    }
    // fold functie (gebruiker verwijderen uit deze player lijst en hands)
    // functie om te raizen
    calculateWinner(){
        for(var i=0; i< this.players.length;i++){
            var hand=this.players[i]['hand']
            var possible = this.table.concat(hand)
            console.log(this.evaluateHand(possible))
          
        }
    }
    evaluateHand(hand) {
        hand.sort((a, b) => a.rank - b.rank);  // Sort by rank
    
        const ranks = hand.map(card => card.rank);
        const suits = hand.map(card => card.suit);
        const rankCounts = {};  // Count occurrences of each rank
    
        // Count how many times each rank appears
        ranks.forEach(rank => rankCounts[rank] = (rankCounts[rank] || 0) + 1);
        
        const counts = Object.values(rankCounts).sort((a, b) => b - a); // Get counts sorted descending
        const uniqueRanks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);
    
        const isFlush = new Set(suits).size === 1;  // If all suits are the same
        const isStraight = uniqueRanks.length === 5 && (uniqueRanks[4] - uniqueRanks[0] === 4 || (uniqueRanks.includes(14) && uniqueRanks.slice(0, 4).join(',') === "2,3,4,5")); // Handles Ace-low straight
    
        let highestPair = null;
        let highestTriple = null;
        let highestStraight = isStraight ? uniqueRanks[uniqueRanks.length - 1] : null; // Highest card in straight
    
        // Find the highest pair or triple
        for (let rank in rankCounts) {
            if (rankCounts[rank] === 2) highestPair = Math.max(highestPair || 0, Number(rank));
            if (rankCounts[rank] === 3) highestTriple = Math.max(highestTriple || 0, Number(rank));
        }
    
        // Hand Rankings (Higher number = Stronger hand)
        if (isFlush && isStraight && ranks.includes(14)) return { rank: 1000, name: "Royal Flush" };
        if (isFlush && isStraight) return { rank: (900+highestStraight), name: `Straight Flush (High card: ${highestStraight})` };
        if (counts[0] === 4) return { rank: 800+uniqueRanks.find(rank => rankCounts[rank] === 4), name: `Four of a Kind (High card: ${uniqueRanks.find(rank => rankCounts[rank] === 4)})` };
        if (counts[0] === 3 && counts[1] === 2) return { rank: 700+highestTriple*3+highestPair*2, name: `Full House (Trips: ${highestTriple}, Pair: ${highestPair})` };
        if (isFlush) return { rank: 600, name: "Flush" };
        if (isStraight) return { rank: 500+highestStraight, name: `Straight (High card: ${highestStraight})` };
        if (counts[0] === 3) return { rank: 400+highestTriple, name: `Three of a Kind (High card: ${highestTriple})` };
        if (counts[0] === 2 && counts[1] === 2) return { rank: 300+highestPair, name: `Two Pair (Highest Pair: ${highestPair})` };
        if (counts[0] === 2) return { rank: 200+highestPair, name: `One Pair (High card: ${highestPair})` };
        
        return { rank: 1, name: `High Card (${ranks[ranks.length - 1]})` };
    }
    

}
class Player {
    constructor(id, name, chips) {
        this.id = id
        this.name = name
        this.chips = chips
    }

}
demo_game = new Game('demo_game')
demo_game.addPlayer(new Player(1, "Daan", 2000))
demo_game.addPlayer(new Player(2, "Henk", 2000))
demo_game.addPlayer(new Player(3, "Pieter", 2000))
demo_game.playSet()
current_set=demo_game.getLastSet()
console.log(current_set)
current_set.foldPlayer(2)
current_set.calculateWinner()
console.log(current_set.players)

// input for testing
/*
const readline = require('node:readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

var continuo=true
rl.question(`What's your name?`, name => {
    console.log(`Hi ${name}!`);
    rl.close();
});
*/