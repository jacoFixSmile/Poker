const express = require('express');
const app = express();
const fs = require('fs');

const port = 3000;

// Serve static files from the "public" directory
app.use(express.static('public'));
// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});



function parseCSV(csvText) {
  const lines = csvText.split('\n');
  const headers = lines[0].split(',');
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header.trim()] = values[index]?.trim();
      return obj;
    }, {});
  });
}

app.use(express.json());
// API route to get all players
app.get('/players', (req, res) => {
  // Read CSV from a file
  fs.readFile('.\\public\\test.csv', 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);
      return;
    }
    const parsedData = parseCSV(data);
    console.log(parsedData)
    res.json(parsedData);
  });

});

// API: Add a new player
app.post('/players', async (req, res) => {
  // Append the row to the CSV file
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const newRow = [3, name, 1000];
  const csvRow = `\n${newRow.join(',')}`;
  fs.appendFile('.\\public\\test.csv', csvRow, (err) => {
    if (err) {
      res.status(500).json({ error: err });
      console.error('Error appending to file:', err);
    } else {
      res.json({ id: 3, name, chips: 1000 });
      console.log('Row successfully added!');
    }
  });

});



