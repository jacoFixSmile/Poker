const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const { Game, Set } = require('./game');
const { createServer } = require('node:http');
const { DatabaseSync } = require('node:sqlite');
const app = express();
const port = 3000;
const csvFilePath = path.join(__dirname, 'public', 'users.csv');
//socket
const server = createServer(app);
const io = new Server(server);
// database 
const database = new DatabaseSync('public/poker.db');

// settings game 
var game;
let users = {};


app.use(express.static('public'));
app.use(express.json());
//<=====================APP managengent=====================>
// Route for the homepage
app.get('/', (req, res) => {
    if (game != undefined) {
        res.sendFile(__dirname + '/Public/index2.html');
    } else {
        res.sendFile(__dirname + '/Public/lobby.html');

    }
});
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/Public/admin.html');
});
app.get('/lobby', (req, res) => {
    res.sendFile(__dirname + '/Public/lobby.html');
});
//<=====================game managment=====================>
app.get('/games_list', (req, res) => {
    const limit = req.query.top ?? 10
    const offset = req.query.offset ?? 0
    const query = database.prepare(`SELECT * FROM games order by id desc LIMIT ${limit} OFFSET ${offset}`);
    res.json(query.all())

});

app.post('/start_game', (req, res) => {
    console.log("trying to contact lobby")
    console.log(req.body.name)
    const name = req.body.name;
    io.emit('lobby', 'trying to contact lobby');
    game = new Game(name)
    game.saveGame()
    for (const [key, value] of Object.entries(users)) {
        game.addPlayer(value);
    }
    game.createHand()
    io.emit('updateGameBoard', game.getLastHand());

});
app.get('/start_game/:id', async (req, res) => {
    const id = req.params.id; // Get ID from URL
    console.log('starting specifc game')
    if (!id) return res.status(400).json({ error: 'Game ID is required' });
})
app.get('/start_hand', (req, res) => {
    console.log('Start hand still a little buggy so log when called')
    game.createHand()
    io.emit('updateGameBoard', game.getLastHand());

});
app.get('/get_game_board', (req, res) => {
    // console.log('game not found')

    if (game == null) {
        console.log('game not found')
        return res.status(400).json({ error: 'No game exists' });
    } else {
        return res.status(201).json(game.getLastHand());

    }
});
//<=====================player management=====================>
// API route to get all players
app.get('/players', (req, res) => {
    const query = database.prepare('SELECT * FROM users WHERE is_deleted = 0');
    res.json(query.all())

});
// API: Add a new player
app.post('/players', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    // protection against sql insert needed
    const query = database.prepare(`SELECT * FROM users where name like '${name}' AND is_deleted = 0`);
    if (query.all().length == 0) {
        const insert = database.prepare('INSERT INTO users (name) VALUES (?)');
        insert.run(name);
        const result = database.prepare(`SELECT * FROM users where name like '${name}' AND  is_deleted = 0`);
        res.status(201).json(result.all());
    } else {

        return res.status(500).json({ error: 'Name is already in use' })
    }

});
app.get('/players/:id', async (req, res) => {
    const { id } = req.params; // Get ID from URL
    if (!id) return res.status(400).json({ error: 'Player ID is required' });
    const result = database.prepare(`SELECT * FROM users where id like '${id}'`);
    res.status(200).json(result.all());

});
app.post('/hand/fold', async (req, res) => {
    game.getLastHand().foldPlayer()
    io.emit('updateGameBoard', game.getLastHand());


});
app.post('/hand/all_in', async (req, res) => {
    game.getLastHand().allIn()
    io.emit('updateGameBoard', game.getLastHand());


});
app.post('/hand/raise', async (req, res) => {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'Amount is required' });
    game.getLastHand().rais(amount)
    io.emit('updateGameBoard', game.getLastHand());


});
app.post('/hand/check', async (req, res) => {
    game.getLastHand().check()
    io.emit('updateGameBoard', game.getLastHand());
    return res.status(201).json(game.getLastHand());


});
app.post('/hand/call', async (req, res) => {
    game.getLastHand().call()
    io.emit('updateGameBoard', game.getLastHand());
    return res.status(201).json(game.getLastHand());


});
app.delete('/players/:id', async (req, res) => {
    const { id } = req.params; // Get ID from URL

    if (!id) return res.status(400).json({ error: 'Player ID is required' });

    try {
        const query = database.prepare('UPDATE Users SET is_deleted=1 WHERE id = ?');
        const result = query.run(id);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json({ message: `Player with ID ${id} deleted successfully.` });
    } catch (error) {
        console.error('Error deleting player:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
//<=====================player game management=====================>
app.post('/players/online', async (req, res) => {
    console.log(game.getPlayers())


});


// Store connected users
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Listen for user joining
    socket.on('join', (user) => {
        users[socket.id] = user.id;
        console.log(`${user.name} connected.`);
        const insert = database.prepare('UPDATE users SET is_online=1  WHERE id=(?)');
        insert.run(user.id);
        if (game) {
            console.log('adding player' + user.id)
            game.addPlayer(user.id);
        }
        io.emit('updateUsers', Object.values(users)); // Send updated user list
    });

    // Handle disconnects
    socket.on('disconnect', () => {
        const user = users[socket.id];
        console.log(users[socket.id])
        delete [socket.id]; // Remove from list
        console.log(`${user} disconnected.`);
        if (user) {
            const insert = database.prepare('UPDATE users SET is_online=0  WHERE id=(?)');
            insert.run(user);
        }
        io.emit('updateUsers', Object.values(users)); // Update user list
    });
});

server.listen(3000, () => {

    console.log('Server running on http://localhost:3000');
});


