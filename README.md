# Poker local
## Description
A poker game created to run locally on a phone without internet access. 
As part of this excerise we try to minimize the amount of package/frameworks we use to get to the end result. For every package we explain why we use it so we don't create a wild grow from packages:
* axios: for API access between back and front-end
* express: to render the front-end pages
* socket: to make the game interactive. Tutorial https://socket.io/docs/v4/tutorial/step-3
* Minimal css framework for making it dynamic http://flexboxgrid.com/
* Build in SQLITE from nodehttps://nodejs.org/api/sqlite.html https://blog.logrocket.com/using-built-in-sqlite-module-node-js/
## Installing
Setting up termux on phone
1. Install termux from git or playstore
2. pkg update && pkg upgrade
3. termux-setup-storage setup storage+
4. pkg install nodejs install node js
5. pkg install python for the sqllite (3.12.9)
6. Install git on termux
7. git clone --branch mongodb_dependency https://github.com/jacoFixSmile/Poker.git
7. Check IP address of phone on termux by running ipconfig. Find the part after "inet 192.168.230.136/3000"
8. npm install && node  .\front_end_server.js
.....
## Stories
> 👑 sign is for admin specifc features. 
- [X] Display cards
- [X] Read data 
- [ ] Player management:
    - [X] Display player
    - [x] create a player 
        - [X] Post a player to the database
        - [X] Check the name isn't used
        - [X] Save player info to local storage
        - [X] Check if the browser all ready has a user, otherwhise ask to create one.
        - [X] 👑 Remove player for admin user
- [ ] play a match of poker
    - [x] Dispay cards
    => Voorkeur zou hier gaan naar hand met combinatie via db en back end maar lijkt ingewikeld. Daarom mss logica niveau afbaken tot op de js klassen & sql enkel de gegevens weglegoggen omdat het altijd intresant is om later statiesteken op te trekken
    - [X] Show actions
    - [x] Raise
    - [x] Fold
    - [X] Check
    - [X] Show active player
    - [x] 👑 reset game (save old csv if). How would you select a user when reloading a game?
    - [X] 👑 Add extra chips to a user  
- [ ] 👑 Admin account
    - [ ] Game modes:
        - [ ] central table: one phone is set in the middel of the table and all the players can look at there cards
        - [x] All playing. The table is displayed on everyones phoen
    - [x] Check if there is a current file for users and save/load games based on csv in the folder.
    - [x] Delete a player
- [ ] Cleanup
    -  [X] Make user first on a waiting lobby until the admin starts the game. Then user can select/create a user and the game starts
- [ ] Check if it can run on Turmux  
- [ ] Code cleanup: 
    - [ ] Create a class for every object: Game, Set, Match, card, player, ... 
    - [ ] Remove logging
### TODO
- [ ] Extra class in game.js turn zodat elke turn appart word berekend ook als iemand all in doet halver wegen dat het tot daar vr die persoon word berekend.
- [x] Na raisen gaat het nog een rontje te ver 
- [x] All in is bugged en kan NULL maken van pot en raised en zo ook de andere dwingen tot all in 
- [X] Click for new had verdwijdend niet als er meerdere gelijk gewonnen hebben
- [x] Bugg als iemand zijn browser sluit tab sluit verlaat hij de game. Zien dat het ook zo gaat met personen in browser
- [ ] Bugg meerdere tabs openen van localhost verstoort ook het systeem
- [X] Tonen welke spailer allemaal hebben gefold
- [ ]  Tonen welke spailer allemaal hebben geraised
- [x] Het geld mag er direct moet er voor de speler direct afgaan ook bij de laatse beurt. 
- [ ] Op mobile als je even uit de browser gaat naar andere app en dan opnieuw opend ommid hij niet goed, we moeten kunnen zien dat we dat ergens kunnen opgvangen. Mogelijks test scenario met hosten van PC en  
- [ ] Er zit ergens een bugg in dat hij
## Usefull
* https://opengameart.org/content/colorful-poker-card-back
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