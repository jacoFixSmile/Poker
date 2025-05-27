CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    is_online  INTEGER DEFAULT 0,
    is_deleted INTEGER DEFAULT 0, -- Default to 0 (false)
    name TEXT
);


CREATE TABLE games (
    id INTEGER PRIMARY KEY, 
    name TEXT, 
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE hands (
    id INTEGER PRIMARY KEY,
    game_id INTEGER,
    pot INTEGER,
    card_1 INTEGER,
    card_2 INTEGER,
    card_3 INTEGER,
    card_4 INTEGER,
    card_5 INTEGER,
    creation_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE user_games (
    id INTEGER PRIMARY KEY,
    user_id INTEGER,
    game_id INTEGER,
    chips INTEGER,
    is_deleted INTEGER DEFAULT 0, -- Default to 0 (false)
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (game_id) REFERENCES games(id)
);

CREATE TABLE user_hands (
    user_id INTEGER,
    hand_id INTEGER,
    chips INTEGER,
    card_1 INTEGER,
    card_2 INTEGER,
    is_fold INTEGER DEFAULT 0, -- Fixed typo (was isFauld)
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (hand_id) REFERENCES hands(id)
);