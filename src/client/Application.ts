import * as PIXI from "pixi.js";
import { Room, Client } from "colyseus.js";
import { State } from "../server/rooms/State";

import { MainRoom } from "./rooms/MainRoom";

const ENDPOINT = (process.env.NODE_ENV==="development")
    ? "ws://localhost:2567"
    : `${window.location.protocol.replace("http", "ws")}//${window.location.hostname}` // production (remote);


export class Application extends PIXI.Application {
    client = new Client(ENDPOINT);
    room: Room<State>;

    initialDims: [number, number];

    constructor () {
        super({
            backgroundColor: 0x072E6A,
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

        this.room.state.players.onChange = (player, key) => {
            console.log(player, "have changes at", key);
        };

        new MainRoom(this, this.room);
    }
}