function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


class Game {
    constructor(name) {
        console.log("====game launced====")
        this.name=name
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
        console.log('this.players')
        this.sets.push(new set(this.players))
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
    setTable() {
        console.log("Setting table")
        for (var i = 0; i < 5; i++) {
            var card = this.pickCard()
            this.table.push(card)
        }
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
