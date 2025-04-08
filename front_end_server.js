const express = require('express');
const fs = require('fs');
const path = require('path');
const { Server } = require('socket.io');
const { Player, Game, Set } = require('./game');
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


app.use(express.static('public'));
app.use(express.json());

// Route for the homepage
app.get('/', (req, res) => {
    console.log("getting base URL")
    if (game != undefined) {
        res.sendFile(__dirname + '/Public/index2.html');
    } else {
        res.sendFile(__dirname + '/Public/lobby.html');

    }
});
app.get('/admin', (req, res) => {
    console.log("admin")
    res.sendFile(__dirname + '/Public/admin.html');
});
app.get('/lobby', (req, res) => {
    res.sendFile(__dirname + '/Public/lobby.html');
});
// Function to parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
            obj[header.trim()] = values[index]?.trim();
            return obj;
        }, {});
    });
}

// API route to get all players
app.get('/players', (req, res) => {
    const query = database.prepare('SELECT * FROM users');
    res.json(query.all())

});
app.get('/start_game', (req, res) => {
    console.log("trying to contact lobby")
    io.emit('lobby', 'trying to contact lobby');
    game = new Game('demo_game')
    game.saveGame()
    game.createHand()
    io.emit('updateGameBoard', game.getLastHand());

});
app.get('/get_game_board' , (req, res) => {
    console.log('game not found')

    if (game == null) {
        console.log('game not found')
        return res.status('400').json({ error: 'No game exists' });
    } else {
        return res.status(201).json(game.getLastHand());

    }
});
// API: Add a new player
app.post('/players', async (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    // protection against sql insert needed
    const query = database.prepare(`SELECT * FROM users where name like '${name}'`);
    if (query.all().length == 0) {
        const insert = database.prepare('INSERT INTO users (name) VALUES (?)');
        insert.run(name);
        const result = database.prepare(`SELECT * FROM users where name like '${name}'`);
        res.status(201).json(result.all());
    } else {

        return res.status(500).json({ error: 'Name is already in use' })
    }

});
app.delete('/players/:id', async (req, res) => {
    const { id } = req.params; // Get ID from URL

    if (!id) return res.status(400).json({ error: 'Player ID is required' });

    try {
        const query = database.prepare('DELETE FROM users WHERE id = ?');
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

function ensureCSVExists() {
    if (!fs.existsSync(csvFilePath)) {
        console.log('CSV file not found. Creating a new one...');
        const headers = 'id,name,chips';
        fs.writeFileSync(csvFilePath, headers, 'utf8');
    } else {
    }
}

// Store connected users
let users = {};
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    // Listen for user joining
    socket.on('join', (user) => {
        users[socket.id] = user.id;
        console.log(`${user.name} connected.`);
        const insert = database.prepare('UPDATE users SET is_online=1  WHERE id=(?)');
        insert.run(user.id);
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
    ensureCSVExists()

    console.log('Server running on http://localhost:3000');
});


