const { DatabaseSync } = require('node:sqlite');
const db = new DatabaseSync('public/poker.db');
const { evaluatePlayerHand } = require('./calculate_score.js');

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}


class Game {
    constructor(name, id) {
        console.log("====game launch  ced====")
        this.id = id
        this.smallBlind = null
        this.name = name
        this.players = []
        this.hands = []
        // set game settings, game mode, small big, start coins
    }
    loadGameById(id) {
        const result = db.prepare(`SELECT * FROM games where id=${id}`);
        var getResult = result.all()
        if (getResult.length === 1) {
            console.log(getResult[0])
            this.name = getResult[0].name
            this.id = getResult[0].id
        } else {
            throw new Error(`Game ID ${id} not found`);
        }
    }
    getOnlineGamePlayers() {
        const result = db.prepare(`SELECT ug.* FROM user_games ug inner join users u on u.id=ug.user_id and u.is_online =1`);
        return result.all()

    }
    async saveGame() {
        return new Promise((resolve, reject) => {
            const query = db.prepare(`INSERT INTO games (name) VALUES (?) RETURNING Id`)
            console.log('game saving')
            console.log(this.name)
            var run = query.run(this.name)
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
        const current_users = db.prepare(`SELECT ug.*,FALSE AS is_folded FROM user_games ug inner join users u on u.id=ug.user_id and u.is_online =1 and game_id= ${this.id}  where ug.chips>0 order by user_id asc`);
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
                const nextPosition = (i + 1) % users.length;
                this.smallBlind = users[nextPosition].user_id;
                nextNotFound = false;
            }

            i++;
        } while (nextNotFound && i <= users.length);

        if (nextNotFound) {
            this.smallBlind = users[0].user_id;
        }
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
        this.notFoldedSmallBlind = smallBlind
        this.players = players
        this.gameId = gameId
        this.round = 5
        this.deck = [
            [
                "2_of_clubs.png", "3_of_clubs.png", "4_of_clubs.png", "5_of_clubs.png",
                "6_of_clubs.png", "7_of_clubs.png", "8_of_clubs.png", "9_of_clubs.png", "10_of_clubs.png",
                "jack_of_clubs2.png", "queen_of_clubs2.png",
                "king_of_clubs2.png", "ace_of_clubs.png"
            ],
            [
                "2_of_diamonds.png", "3_of_diamonds.png", "4_of_diamonds.png", "5_of_diamonds.png",
                "6_of_diamonds.png", "7_of_diamonds.png", "8_of_diamonds.png", "9_of_diamonds.png", "10_of_diamonds.png",
                "jack_of_diamonds2.png", "queen_of_diamonds2.png",
                "king_of_diamonds2.png", "ace_of_diamonds.png",
            ],
            [
                "2_of_hearts.png", "3_of_hearts.png", "4_of_hearts.png", "5_of_hearts.png",
                "6_of_hearts.png", "7_of_hearts.png", "8_of_hearts.png", "9_of_hearts.png", "10_of_hearts.png",
                "jack_of_hearts2.png", "queen_of_hearts2.png",
                "king_of_hearts2.png", "ace_of_hearts.png"
            ],
            [
                "2_of_spades.png", "3_of_spades.png", "4_of_spades.png",
                "5_of_spades.png", "6_of_spades.png", "7_of_spades.png", "8_of_spades.png", "9_of_spades.png",
                "10_of_spades.png", "jack_of_spades2.png", "queen_of_spades2.png",
                "king_of_spades2.png", "ace_of_spades.png"
            ]
        ]
        this.usedCards = []
        this.table = []
        this.raised = false
        this.raised_player = false
        this.raised_amount = 0
        this.pot = 0
        this.scores = null
        this.startHand()
    }
    setNextActiveUser() {
        console.log("setNextActiveUser")
        const activePlayers = this.players.filter(p => !p.is_folded);

        const userIds = activePlayers.map(p => p.user_id);
        const currentIndex = userIds.indexOf(this.activeUser);
        const isSmallBlindActive = userIds.includes(this.notFoldedSmallBlind);

        console.log(userIds)
        // Set next user
        if (currentIndex === -1 || currentIndex === userIds.length - 1) {
            this.activeUser = userIds[0];
        } else {
            this.activeUser = userIds[currentIndex + 1];
        }

        console.log((`this.raised_player ${this.raised_player} && this.activeUser ${this.activeUser}&&  this.raised ${this.raised}`))
        if (((this.activeUser === this.notFoldedSmallBlind && !this.raised) || (this.raised_player === this.activeUser && this.raised)) & this.round === 0) {
            this.round += 3
            this.raised_amount = 0
            this.raised = false
            this.raised_player = false
        } else if (((this.activeUser === this.notFoldedSmallBlind && !this.raised) || (this.raised_player === this.activeUser && this.raised)) & this.round === 5) {
            this.scores = this.calculateWinner()
        } else if (((this.activeUser === this.notFoldedSmallBlind && !this.raised) || (this.raised_player === this.activeUser && this.raised))) {
            this.round += 1
            this.raised_amount = 0
            this.raised = false
            this.raised_player = false
        } else if (this.raised_player === this.activeUser) {
            this.raised = false
        }
        if (!isSmallBlindActive) {
            this.notFoldedSmallBlind = this.activeUser
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
        // give player hands
        for (var i = 0; i < this.players.length; i++) {
            this.players[i]['hand'] = this.makePlayerHand()
        }
    }
    sortCards(cards) {
        return cards.sort((a, b) => a.rank - b.rank);
    }
    foldPlayer() {
        this.players.filter(player => player.user_id === this.activeUser)[0].is_folded = 1;
        this.setNextActiveUser()
    }
    allIn() {
        console.log('allIn')
        let current_user_chips = this.players.filter(player => player.user_id === this.activeUser)[0].chips
        console.log(current_user_chips)
        if (current_user_chips <= 0) {
            this.check()
        } else {
            this.pot += Number(current_user_chips)
            // let insert = db.prepare('UPDATE user_games SET chips=chips-(?)  WHERE user_id=(?) and game_id=(?)');
            // insert.run(amount,this.activeUser,this.gameId);
            this.updateHandPlayerBudget(this.activeUser, current_user_chips)
            this.setNextActiveUser()
        }
        // game logic for all in
        // set player amount to zero when smaller than amound raised otherwise check
    }
    rais(amount) {
        // altijd vanuit gaan dat de huidige player raised
        this.pot += Number(amount)
        this.raised = true
        this.raised_player = this.activeUser
        this.raised_amount = Number(amount)
        // let insert = db.prepare('UPDATE user_games SET chips=chips-(?)  WHERE user_id=(?) and game_id=(?)');
        // insert.run(amount,this.activeUser,this.gameId);
        this.updateHandPlayerBudget(this.activeUser, amount)

        this.setNextActiveUser()
    }
    check() {
        this.setNextActiveUser()
    }
    call() {
        this.pot += this.raised_amount
        // let insert = db.prepare('UPDATE user_games SET chips=chips-(?)  WHERE user_id=(?) and game_id=(?)');
        // insert.run(this.raised_amount,this.activeUser,this.gameId);
        this.updateHandPlayerBudget(this.activeUser, this.raised_amount)
        this.setNextActiveUser()
    }
    calculateWinner() {
        var scores = []
        for (var i = 0; i < this.players.length; i++) {
            if (!this.players[i].is_folded) {
                var hand = this.players[i]['hand']
                var possible = this.table.concat(hand)
                var score = evaluatePlayerHand(possible)
                score.player = this.players[i]
                scores.push(score)
            }

        }
        const highestRank = Math.max(...scores.map(score => Number(score.rank)));
        const countHighestRank = scores.filter(score => Number(score.rank) === highestRank).length;
        for (score in scores) {
            if (highestRank === scores[score].rank) {
                this.players.find(p => p.user_id === scores[score].player.user_id).chips += this.pot / countHighestRank;
            }
        }
        this.persistPlayersBalanceToDB()
        return scores
    }
    persistPlayersBalanceToDB() {
        console.log('persistPlayersBalanceToDB')
        this.players.forEach((player) => {
            let insert = db.prepare('UPDATE user_games SET chips=(?)  WHERE user_id=(?) and game_id=(?)');
            insert.run(player.chips, player.user_id, this.gameId);
            console.log((player.chips + " | " + player.user_id + ' | ' + this.gameId))
        })
        //update the database user_games with the latest hand game balance
    }
    updateHandPlayerBudget(user_id, amount) {
        console.log("updateHandPlayerBudget")
        this.players.find(p => p.user_id === user_id).chips -= amount;
        console.log(this.players)
    }



}



/*
class Player {
    constructor(id, name, chips) {
        this.id = id
        this.name = name
        this.chips = chips
    }

}
    printDeckCmd() {
        for (var i = 0; i < this.deck.length; i++) {
            for (var j = 0; j < this.deck[i].length; j++) {
                console.log(this.deck[i][j] + ' ' + [i] + ':' + [j]);
            }

        }
    }

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

module.exports = { Game, Hand };