# Poker local
## Description
A poker game created to run locally on a phone without internet access. 
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
        - [ ] Check the name isn't used
        - [ ] Save player info to local storage
        - [ ] Check if the browser all ready has a user, otherwhise ask to create one.
        - [ ] 👑 Remove player for admin user
- [ ] play a match of poker
    - [ ] 👑 reset game (save old csv if)
- [ ] 👑 Admin account
    - [ ] Game modes:
        - [ ] central table: one phone is set in the middel of the table and all the players can look at there cards
        - [ ] All playing. The table is displayed on everyones phoen
    - [ ] Check if there is a current file for users and save/load games based on csv in the folder.
- [ ] Check if it can run on Turmux  
- [ ] Code cleanup: 
    - [ ] Create a class for every object: Game, Set, Match, card, player, ... 
<!-- 

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.

> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
-->