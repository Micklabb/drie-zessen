import * as PIXI from "pixi.js";
import { Application } from "../Application"; 


export class Button extends PIXI.Container {

    test = "abcdefg";
    app: Application;
    constructor() {
        super();

        let button = new PIXI.Graphics();
        button.beginFill(0xff0000);
        button.drawRect(0, 80, 80, 30);
        button.endFill();

        // make the button interactive...
        button.interactive = true;
        button.buttonMode = true;

        button.on('pointerdown', onButtonDown.bind(this));
        button.on('pointerup', onButtonUp);
        this.addChild(button);
    }
}

function onButtonDown() {
    this.isdown = true;
    console.log("down", this.test)
}

function onButtonUp() {
    this.isdown = false;
    console.log("up")
}