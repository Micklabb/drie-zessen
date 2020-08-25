import * as PIXI from "pixi.js";
import { Room, Client } from "colyseus.js";
import { State } from "../server/rooms/State";

import { PlayerList } from "./displayelements/Playerlist";
import { InsertName } from "./displayelements/InsertName";
import { Controls } from "./displayelements/Controls";

const ENDPOINT = (process.env.NODE_ENV==="development")
    ? "ws://localhost:2567"
    : `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}` // production (remote);


export class Application extends PIXI.Application {
    client = new Client(ENDPOINT);
    room: Room<State>;

    initialDims: [number, number];

    constructor () {
        super({
            backgroundColor: 0x00ff00,
            antialias: true,
        });

        this.initialDims = this.setSize(400, 400);
        this.authenticate();       
    }

    setSize(WIDTH, HEIGHT) {
        const vpw = window.innerWidth;  // Width of the viewport
        const vph = window.innerHeight; // Height of the viewport
        let nvw;
        let nvh;
    
        if (vph / vpw < HEIGHT / WIDTH) {
            nvh = vph;
            nvw = (nvh * WIDTH) / HEIGHT;
        } else {
            nvw = vpw;
            nvh = (nvw * HEIGHT) / WIDTH;
        }
    
        this.renderer.resize(nvw, nvh);
        let newDims: [number, number] = [nvw, nvh];
        return newDims;
    }

    
    async authenticate() {
        this.room = await this.client.joinOrCreate<State>("game");

        this.room.onStateChange.once((state) => {
            console.log("this is the first room state!", state, this.room);
        });
        
        let playerlist = new PlayerList(this.room.state);
        this.stage.addChild(playerlist);        

        let controls = new Controls(this);
        controls.x = this.screen.width / 2;
        controls.y = this.screen.height / 2;
    
        controls.pivot.x = controls.width / 2;
        controls.pivot.y = controls.height / 2;
        controls.y += 85;
        this.stage.addChild(controls);

        let namescreen = new InsertName(this);
        this.stage.addChild(namescreen);
        

        this.room.onStateChange((state) => {
            console.log("the room state has been updated:", state);
            playerlist.updatePlayers();
            
            if(!(this.room.state.players[this.room.sessionId].name)) {
                namescreen.visible = true;
                controls.interactiveChildren = false;
            } else {
                namescreen.visible = false;
                controls.interactiveChildren = true;
            }
        });

        this.room.state.players.onChange = (player, key) => {
            console.log(player, "have changes at", key);
        };

    }
}