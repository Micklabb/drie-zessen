import * as PIXI from "pixi.js";

export class ShowTurn extends PIXI.Container {
    turnText: PIXI.Text = new PIXI.Text("");

    constructor() {
        super();
        const textSettings = {
            fontFamily : 'Arial',
            fontSize: 42,
            fill : 0xffffff,
            align : 'center',
            fontWeight: "bold",
            strokeThickness: 5
        }
        this.turnText.style = textSettings;
        this.addChild(this.turnText);
    }
    
    updateTurnDisplay(text) {
        this.turnText.text = text
        this.pivot.x = this.width / 2;
    }
}