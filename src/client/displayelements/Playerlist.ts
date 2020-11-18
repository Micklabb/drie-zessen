import * as PIXI from "pixi.js";
import { State } from "../../server/rooms/State";

export class PlayerList extends PIXI.Container {
    playerlist: PIXI.Text = new PIXI.Text("a");
    state: State;
    players: Array<PIXI.Text>;    

    constructor(state: State) {
        super();
        this.state = state;

        // TODO:Add a way to edit the list element by element
    
        /*
        this.state.playerSeats.forEach((player, i) => {
            let name = this.state.players[player].name;
            this.players[i] = new PIXI.Text(name);
            this.addChild(this.players[i]);
        })
        */
       
        this.addChild(this.playerlist);
    }

    updatePlayers() {
        const textSettings = {
            fontFamily : 'Arial',
            fontSize: 16,
            fill : 0x000000,
            align : 'left'
        }

        let list = "Players:";

        this.state.playerSeats.forEach((player, i) => {
            list += `\n${i+1}. ${this.state.players[player].name}`
        })

        this.playerlist.text = list;
        this.playerlist.style = textSettings;

        console.log(this.playerlist.text);
        
    }
}