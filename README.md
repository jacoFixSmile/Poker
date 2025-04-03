# Poker local
## Description
A poker game created to run locally on a phone without internet access. 
As part of this excerise we try to minimize the amount of package/frameworks we use to get to the end result. For every package we explain why we use it so we don't create a wild grow from packages:
* axios: for API access between back and front-end
* express: to render the front-end pages
* socket: to make the game interactive. Tutorial https://socket.io/docs/v4/tutorial/step-3
SQLITE https://nodejs.org/api/sqlite.html https://blog.logrocket.com/using-built-in-sqlite-module-node-js/
## Installing
Setting up termux on phone
1. Install termux from git or playstore
2. pkg update && pkg upgrade
3. termux-setup-storage setup storage+
4. pkg install nodejs install node js
5. pkg install python for the sqllite (3.12.9)
6. Install git on termux
7. git clone --branch mongodb_dependency https://github.com/jacoFixSmile/Poker.git
8. npm install && node  .\front_end_server.js
.....
## Stories
> 👑 sign is for admin specifc features. 
- [X] Display cards
- [X] Read data 
- [ ] Player management:
    - [X] Display plater
    - [ ] create a player 
        - [X] Post a player to the database
        - [X] Check the name isn't used
        - [X] Save player info to local storage
        - [X] Check if the browser all ready has a user, otherwhise ask to create one.
        - [X] 👑 Remove player for admin user
- [ ] play a match of poker
    - [ ] Dispay cards
    => Voorkeur zou hier gaan naar hand met combinatie via db en back end maar lijkt ingewikeld. Daarom mss logica niveau afbaken tot op de js klassen & sql enkel de gegevens weglegoggen omdat het altijd intresant is om later statiesteken op te trekken
    - [X] Show actions
    - [ ] Raise
    - [ ] Fold
    - [ ] Check
    - [ ] Show active player
    - [ ] 👑 reset game (save old csv if). How would you select a user when reloading a game?
- [ ] 👑 Admin account
    - [ ] Game modes:
        - [ ] central table: one phone is set in the middel of the table and all the players can look at there cards
        - [ ] All playing. The table is displayed on everyones phoen
    - [ ] Check if there is a current file for users and save/load games based on csv in the folder.
- [ ] Cleanup
    -  [X] Make user first on a waiting lobby until the admin starts the game. Then user can select/create a user and the game starts
- [ ] Check if it can run on Turmux  
- [ ] Code cleanup: 
    - [ ] Create a class for every object: Game, Set, Match, card, player, ... 
    - [ ] Remove logging


> [!NOTE]
> Useful information that users should know, even when skimming content.
 * "rm -rf FolderName" can be used in termux to remove everything from a folder
<!-- 
> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
-->