import * as PIXI from "pixi.js";
import { State } from "../../server/rooms/State";

export class DebugOverlay extends PIXI.Container {
    overlay: PIXI.Text = new PIXI.Text("a");
    state: State;   

    constructor(state: State) {
        super();
        this.state = state;

        this.addChild(this.overlay);
    }

    updateOverlay() {
        const textSettings = {
            fontFamily : 'Arial',
            fontSize: 16,
            fill : 0x000000,
            align : 'left'
        }

        let list = "Debug Overlay:";
        /*
        this.state.playerSeats.forEach((player, i) => {
            list += `\n${i+1}. ${this.state.players[player].name}`
        })
        */

        list += `\nPhase: ${this.state.phase}`
        list += `\nPlayer Turn: ${this.state.playerTurn}`
        list += `\nTurn Phase: ${this.state.turnPhase}`


        this.overlay.text = list;
        this.overlay.style = textSettings;

        //console.log(this.overlay.text);
        
    }
}