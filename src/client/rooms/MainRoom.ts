import * as PIXI from "pixi.js";
import { Room } from "colyseus.js";
import { Application } from "../Application"; 

import { PlayerList } from "../displayelements/Playerlist";
import { InsertName } from "../displayelements/SubmitNameScreen";
import { CupAndDice } from "../displayelements/CupAndDice";
import { ShowTurn } from "../displayelements/ShowTurnText";
import { DebugOverlay } from "../displayelements/DebugOverlay";

export class MainRoom extends PIXI.Container {
    app: Application;
    room: Room;

    // Stores info about a pointer event
    // click = {
    //     tstart: 0,
    //     tend: 0,
    //     xstart: 0,
    //     xend: 0,
    //     ystart: 0,
    //     yend: 0
    // };
    
    constructor(app: Application, room: Room) {
        super();
        this.app = app;
        this.room = room;

        this.drawElements();

        // this.interactive = true;
        // this.on('pointerup', e => this.onPointerUp(e));
        // this.on('pointerdown', e => this.onPointerDown(e));
        

        this.app.stage.addChild(this);
    }

    // Saves position and time about pointer events
    // onPointerDown(e) {
    //     this.click.ystart = e.data.global.y;
    //     this.click.xstart = e.data.global.x;
    //     this.click.tstart = Date.now();
    //     console.log(this.click)
    // }

    // onPointerUp(e) {        
    //     this.click.yend = e.data.global.y;
    //     this.click.xend = e.data.global.x;
    //     this.click.tend = Date.now();
    //     console.log(this.click)
        
    // }

    drawElements() {
        // Add player list to screen
        let playerlist = new PlayerList(this.room.state);
        this.addChild(playerlist);
        
        // Add show turn text to screen
        let showturn = new ShowTurn();
        showturn.x = this.app.screen.width / 2;
        showturn.y = 50;
        this.addChild(showturn);

        // Add cup and dice to screen
        let cupAndDice = new CupAndDice(this.app);
        cupAndDice.x = this.app.screen.width / 2;
        cupAndDice.y = this.app.screen.height / 2;
    
        cupAndDice.pivot.x = cupAndDice.width / 2;
        cupAndDice.pivot.y = cupAndDice.height / 2;
        cupAndDice.y += 85;
        this.addChild(cupAndDice);

        // Create name submission screen start game
        let namescreen = new InsertName(this.app);
        this.addChild(namescreen);
       
        // Create debug overlay
        let debugoverlay = new DebugOverlay(this.room.state);
        this.addChild(debugoverlay);

        this.room.onStateChange((state) => {
            console.log("the room state has been updated:", state);
            playerlist.updatePlayers();
            cupAndDice.checkForTurnChange();

            // Show and update debug overlay if debug mode is on
            if(this.room.state.debug_mode){
                debugoverlay.visible = true;
                debugoverlay.updateOverlay();
                debugoverlay.y = this.app.screen.height - debugoverlay.height;
            } else {
                debugoverlay.visible = false;
            }
            
            // Display the overlay to fill in name
            if(!(this.room.state.players[this.room.sessionId].name)) {
                namescreen.visible = true;
                // Prevent clicking the cup and dice under the namescreen
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
                showturn.pivot.x = showturn.width / 2;
            } else {
                // print other player name
                let playerid = this.room.state.playerSeats[turn];
                let player = this.room.state.players[playerid].name;
                showturn.updateTurnDisplay(player);
                showturn.pivot.x = showturn.width / 2;
            }
        });
    }


}