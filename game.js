const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('public/poker.db');
function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


class Game {
    constructor(name) {
        console.log("====game launch  ced====")
        this.id = null
        this.smallBlind = null
        this.name = name
        this.players = []
        this.hands = []
        // set game settings, game mode, small big, start coins
    }
    getOnlineGamePlayers() {

        const result = database.prepare(`SELECT ug.* FROM user_games ug inner join users u on u.id=ug.user_id and u.is_online =1`);
        return result.all()

    }
    async saveGame() {
        return new Promise((resolve, reject) => {
            const query = db.prepare(`INSERT INTO games (name) VALUES (?) RETURNING Id`)
            var run = query.run('testing')
            console.log(run)
            this.id = (run.lastInsertRowid)
            resolve(run.lastInsertRowid)
        },);
    }
    async addPlayer(userId) {
        var new_user = new UserGame(userId, this.id)
        new_user.instantiateUserGame()
        const playerExists = this.players.some(player => player.id === new_user.id);

        if (!playerExists) {
            this.players.push(new_user);
        }
    }
    async loadAllGamePlayers() {
        const current_users = db.prepare(`SELECT * FROM user_games where game_id = ${this.id}`);
        this.players = []
        current_users.all().forEach((item) => {
            this.players.push(new UserGame(item.user_id, item.game_id))
        });
        return this.players

    }
    removePlayer(name) {
        //
    }
    createHand() {
        console.log('Starting a set... for game:' + this.id);
        const current_users = db.prepare(`SELECT ug.* FROM user_games ug inner join users u on u.id=ug.user_id and u.is_online =1 and game_id= ${this.id} order by user_id asc`);
        var users = current_users.all()
        var i = 0;
        var nextNotFound = true

        do {
            //als het niet gevonden is pak de eerste als het de laatste is pak die dan dichst bijzende de volgonde id qua grote of terug de eerste
            console.log(this.smallBlind === null)
            if (this.smallBlind === null) {
                this.smallBlind = users[0].user_id;
                nextNotFound = false;
            }
            else if (users[i].user_id >= this.smallBlind) {
                console.log('next small blind')
                const nextPosition = (i + 1) % users.length;
                this.smallBlind = users[nextPosition].user_id;
                nextNotFound = false;
            }

            i++;
        } while (nextNotFound && i <= users.length);

        if (nextNotFound) {
            this.smallBlind = users[0].user_id;
        }
        console.log('Smallblinde: ' + this.smallBlind)
        var new_hand = new Hand(users, this.id, this.smallBlind) // kunnen players zijn die in game zitten & algemeen online staan zo kunnen we een lijstje bekomen
        this.hands.push(new_hand)

    }

    getLastHand() {
        return this.hands[this.hands.length - 1]
    }
}
class UserGame {

    constructor(userId, gameId) {
        this.id = null
        this.userId = userId
        this.gameId = gameId
        this.chips = null


    }
    instantiateUserGame() {
        // check user does not exists in 
        const current_user = db.prepare(`SELECT * FROM user_games where user_id = '${this.userId}' AND  game_id = '${this.gameId}'`);
        if (current_user.all().length == 0) {
            const query = db.prepare(`INSERT INTO user_games (user_id, game_id, chips) VALUES (?,?, 1000)`)
            var run = query.run(this.userId, this.gameId)
            this.id = run.lastInsertRowid
            this.chips = 1000
        } else {
            this.id = current_user.all()[0].Id
            this.id = current_user.all()[0].chips

        }
    }
    addChips(amount) {
        if (this.chips + amount >= 0) {
            const query = db.prepare(`UPDATE user_games set (chips) VALUES (?) WHERE Id=(?)`)
            var run = query.run(this.chips + amount, this.id)
        } else {
            throw new Error("Chip amount is negativ");
        }
    }
}
class Hand {
    constructor(players, gameId, smallBlind) { //players
        this.id = null
        this.smallBlind = smallBlind
        this.activeUser = smallBlind
        this.players = players
        this.gameId = gameId
        this.round = 5
        this.deck = [
            [
                "2_of_clubs.png", "3_of_clubs.png", "4_of_clubs.png", "5_of_clubs.png",
                "6_of_clubs.png", "7_of_clubs.png", "8_of_clubs.png", "9_of_clubs.png", "10_of_clubs.png",
                "jack_of_clubs2.png","queen_of_clubs2.png",
                "king_of_clubs2.png","ace_of_clubs.png"
            ],
            [
                 "2_of_diamonds.png", "3_of_diamonds.png", "4_of_diamonds.png", "5_of_diamonds.png",
                "6_of_diamonds.png", "7_of_diamonds.png", "8_of_diamonds.png", "9_of_diamonds.png", "10_of_diamonds.png",
                "jack_of_diamonds2.png", "queen_of_diamonds2.png",
                "king_of_diamonds2.png","ace_of_diamonds.png",
            ],
            [
                "2_of_hearts.png", "3_of_hearts.png", "4_of_hearts.png", "5_of_hearts.png",
                "6_of_hearts.png", "7_of_hearts.png", "8_of_hearts.png", "9_of_hearts.png", "10_of_hearts.png",
                 "jack_of_hearts2.png", "queen_of_hearts2.png",
                "king_of_hearts2.png","ace_of_hearts.png"
            ],
            [
                "2_of_spades.png", "3_of_spades.png", "4_of_spades.png",
                "5_of_spades.png", "6_of_spades.png", "7_of_spades.png", "8_of_spades.png", "9_of_spades.png",
                "10_of_spades.png",  "jack_of_spades2.png", "queen_of_spades2.png",
                "king_of_spades2.png","ace_of_spades.png"
            ]
        ]
        this.usedCards = []
        this.table = []
        this.raised=false
        this.raised_player=false
        this.raised_amount=0
        this.PlayerHands = []
        this.pot = 0
        this.scores=null
        this.startHand()
    }
    setNextActiveUser() {
        let userIds = [];
        for (let i = 0; i < this.players.length; i++) {
            userIds.push(this.players[i].user_id);
        }
        const currentIndex = userIds.indexOf(this.activeUser);
        // WERKT NOG NIET VOLLEDIG GOED ALS IEMAND RAISED MOET HET TERUG TOT DIE SPELER GAAN EN NIET TOT DE SMALL BLINED 
        // Set next user
        if (currentIndex === -1 || currentIndex === userIds.length - 1) {
            this.activeUser = userIds[0];
        } else {
            this.activeUser = userIds[currentIndex + 1];
        }
        // Set round
        if(((this.activeUser===this.smallBlind && !this.raised ) || (this.raised_player===this.activeUser && this.raised )) & this.round===0){
            this.round+=3
            this.raised_amount=0
            this.raised=false
            this.raised_player=false
        }else if(((this.activeUser===this.smallBlind && !this.raised ) || (this.raised_player===this.activeUser && this.raised )) & this.round===5){
            this.scores=this.calculateWinner()
        }else if(((this.activeUser===this.smallBlind && !this.raised ) || (this.raised_player===this.activeUser && this.raised )) ){
            this.round+=1
            this.raised_amount=0
            this.raised=false
            this.raised_player=false
        }else if(this.raised_player===this.activeUser){
            this.raised=false

        }


    }

    pickCard() {
        if (this.usedCards.includes())
            var isUsedCard;
        do {
            isUsedCard = false
            var suit = getRandomInt(4)
            var rank = getRandomInt(13)
            for (var i = 0; i < this.usedCards.length; i++) {
                if (this.usedCards[i].name === this.deck[suit][rank]) {
                    isUsedCard = true;
                }
            }
        } while (isUsedCard)
        var card = { 'id': suit * 100 + rank, 'name': this.deck[suit][rank], 'suit': suit, "rank": rank }
        this.usedCards.push(card)
        return card
    }
    getCardFromDeck(name) {

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
        const query = db.prepare(`INSERT INTO hands (game_id, pot, card_1, card_2, card_3, card_4, card_5) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)`)
        console.log(this.table[0])
        var run = query.run(this.gameId, 0, this.table[0].id, this.table[1].id, this.table[2].id, this.table[3].id, this.table[4].id)
        console.log(run)
        this.id = run.lastInsertRowid

    }
    makePlayerHand() {
        var hand = [this.pickCard(), this.pickCard()]
        return hand

    }
    startHand() {
        this.makeTable()
        console.log(this.table)
        // give player hands
        for (var i = 0; i < this.players.length; i++) {
            this.players[i]['hand'] = this.makePlayerHand()
            console.log(this.players[i])
        }
        console.log(this.board)
    }
    sortCards(cards) {
        return cards.sort((a, b) => a.rank - b.rank);
    }
    foldPlayer(id) {
        this.players = this.players.filter(player => player.id !== id);
        this.setNextActiveUser()
    }
    rais(amount) {
        // altijd vanuit gaan dat de huidige player raised
        this.pot += Number(amount)
        this.raised=true
        this.raised_player=this.activeUser
        this.raised_amount=Number(amount)
        this.setNextActiveUser()
    }
    check() {
        this.setNextActiveUser()
    }
    call(){
        this.pot+=this.raised_amount
        this.setNextActiveUser()
    }
    calculateWinner() {
        console.log("start calculating winner")
        var scores=[]
        for (var i = 0; i < this.players.length; i++) {
            var hand = this.players[i]['hand']
            var possible = this.table.concat(hand)
            var score=this.evaluatePlayerHand(possible)
            score.player=this.players[i]
            scores.push(score)

        }
        return scores
    }
    
    evaluatePlayerHand(hand) {
        console.log('hand ranking')
        console.log(hand)
        hand.sort((a, b) => a.rank - b.rank);  // Sort by rank

        const ranks = hand.map(card => card.rank);
        const suits = hand.map(card => card.suit);
        const rankCounts = {};  // Count occurrences of each rank

        // Count how many times each rank appears
        ranks.forEach(rank => rankCounts[rank] = (rankCounts[rank] || 0) + 1);
        console.log("ranks")
        console.log(ranks)
        console.log("suits")
        console.log(suits)
        console.log("rankCounts")
        console.log(rankCounts)
        const counts = Object.values(rankCounts).sort((a, b) => b - a); // Get counts sorted descending
        const uniqueRanks = Object.keys(rankCounts).map(Number).sort((a, b) => a - b);
        console.log("counts")
        console.log(counts)
        const isFlush = new Set(suits).size === 1;  // If all suits are the same
        const isStraight = uniqueRanks.length === 5 && (uniqueRanks[4] - uniqueRanks[0] === 4 || (uniqueRanks.includes(14) && uniqueRanks.slice(0, 4).join(',') === "2,3,4,5")); // Handles Ace-low straight

        let pairs = [];
        let highestTriple = null;
        let highestStraight = isStraight ? uniqueRanks[uniqueRanks.length - 1] : null; // Highest card in straight

        // Find the highest pair or triple
        for (let rank in rankCounts) {
            if (rankCounts[rank] === 2) {
                pairs.push(Number(rank));
            }
            if (rankCounts[rank] === 3) {
                highestTriple = Math.max(highestTriple || 0, Number(rank));
            }
        }
        pairs.sort((a, b) => b - a); // Sort descending
        let highestPair = pairs[0] || null;
        let secondPair = pairs[1] || null;
        // Hand Rankings (Higher number = Stronger hand)
        //TODO link high card can't be the card that already is taken. E.g when a pair of aces wins the high card can't be an ace
        if (isFlush && isStraight && ranks.includes(14)) return { rank: 1000, name: "Royal Flush" };
        if (isFlush && isStraight) return { rank: (900 + highestStraight), name: `Straight Flush (High card: ${highestStraight})` };
        if (counts[0] === 4) return { rank: 800 + uniqueRanks.find(rank => rankCounts[rank] === 4)+(ranks[ranks.length - 1]/10), name: `Four of a Kind (High card: ${uniqueRanks.find(rank => rankCounts[rank] === 4)})` };
        if (counts[0] === 3 && counts[1] === 2) return { rank: 700 + highestTriple * 3 + pairs[0] * 2, name: `Full House (Trips: ${highestTriple}, Pair: ${pairs[0]})` };
        if (isFlush) return { rank: 600, name: "Flush" };
        if (isStraight) return { rank: 500 + highestStraight, name: `Straight (High card: ${highestStraight})` };
        if (counts[0] === 3) return { rank: 400 + highestTriple+(ranks[ranks.length - 1]/10), name: `Three of a Kind (High card: ${highestTriple})` };
        if (pairs.length === 2) return { rank: 300 + highestPair + secondPair/10+(ranks[ranks.length - 1]/100), name: `Two Pair (Pair1: ${pairs[0]} & Pair2: ${pairs[1]})` };
        if (pairs.length === 1) return { rank: 200 + pairs[0]+(ranks[ranks.length - 1]/10), name: `One Pair (High card: ${pairs[0]})` };

        return { rank: 1+ranks[ranks.length - 1], name: `High Card (${ranks[ranks.length - 1]})` };
    }


}
 
class Player {
    constructor(id, name, chips) {
        this.id = id
        this.name = name
        this.chips = chips
    }

}

/*
testing game
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
*/


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

module.exports = { Player, Game, Hand };