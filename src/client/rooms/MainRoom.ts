import * as PIXI from "pixi.js";
import { Room } from "colyseus.js";
import { Application } from "../Application"; 

import { PlayerList } from "../displayelements/Playerlist";
import { InsertName } from "../displayelements/SubmitNameScreen";
import { CupAndDice } from "../displayelements/CupAndDice";
import { ShowTurn } from "../displayelements/ShowTurnText";

export class MainRoom extends PIXI.Container {
    app: Application;
    room: Room;
    
    constructor(app: Application, room: Room) {
        super();
        this.app = app;
        this.room = room;

        this.drawElements();
    }

    drawElements() {
        // Add player list to screen
        let playerlist = new PlayerList(this.room.state);
        this.app.stage.addChild(playerlist);
        
        // Add show turn text to screen
        let showturn = new ShowTurn();
        showturn.x = this.app.screen.width / 2;
        showturn.y = 50;
        this.app.stage.addChild(showturn);

        // Add cup and dice to screen
        let cupAndDice = new CupAndDice(this.app);
        cupAndDice.x = this.app.screen.width / 2;
        cupAndDice.y = this.app.screen.height / 2;
    
        cupAndDice.pivot.x = cupAndDice.width / 2;
        cupAndDice.pivot.y = cupAndDice.height / 2;
        cupAndDice.y += 85;
        this.app.stage.addChild(cupAndDice);

        // Create name submission screen start game
        let namescreen = new InsertName(this.app);
        this.app.stage.addChild(namescreen);

        this.room.onStateChange((state) => {
            console.log("the room state has been updated:", state);
            playerlist.updatePlayers();
            
            // Display the playerlist in the top left
            if(!(this.room.state.players[this.room.sessionId].name)) {
                namescreen.visible = true;
                cupAndDice.interactiveChildren = false;
            } else {
                namescreen.visible = false;
                cupAndDice.interactiveChildren = true;
            }

            // Display the turn name above cup
            let turn = this.room.state.playerTurn;
            let seat = this.room.state.players[this.room.sessionId].seat;
            if (turn == seat) {
                // print your turn
                showturn.updateTurnDisplay("Your Turn!");
                showturn.pivot.x = cupAndDice.width / 2;
            } else {
                // print other player name
                let playerid = this.room.state.playerSeats[turn];
                let player = this.room.state.players[playerid].name;
                showturn.updateTurnDisplay(player);
            }
        });
    }


}