import * as PIXI from "pixi.js";
import { ProposeDice, Dice, DiceGroup, ChangeDice } from "./Dice";
import { Application } from "../Application"; 
import { gsap } from "gsap";

const cupSrc = require("../assets/cup2.png");


export class Controls extends PIXI.Container {
    app: Application;
    clickbeginY: number;
    clickendY: number;

    constructor(app: Application) {
        super();
        this.app = app;
        this.sortableChildren = true;

        let changeDice = new ChangeDice();
        changeDice.pivot.x = this.width / 2;
        changeDice.pivot.y = this.height / 2;
        changeDice.visible = false;
        this.addChild(changeDice);

        let proposeDice = new ProposeDice();
        proposeDice.pivot.x = this.width / 2;
        proposeDice.pivot.y = this.height / 2;
        proposeDice.visible = false;
        this.addChild(proposeDice);

        let showDice = new DiceGroup();
        showDice.pivot.x = this.width / 2;
        showDice.pivot.y = this.height / 2;
        showDice.visible = true;
        this.addChild(showDice);
        
        let texture = PIXI.Texture.from(cupSrc);
        let cup = new PIXI.Sprite(texture);
        cup.anchor.set(0.9, 0.4);
        cup.setTransform(0,0,0.9,0.9,Math.PI);
        cup.zIndex = 1;
        this.addChild(cup);
       
        cup.interactive = true;
        cup.buttonMode = true;

        // https://pixijs.io/examples/#/interaction/dragging.js (Draging)

        cup.on('pointerdown', e => {
            switch(this.app.room.state.turnPhase) {
                case 0:
                    this.clickbeginY = e.data.global.y;
            }
        });

        cup.on('pointerup', e => {
            switch(this.app.room.state.turnPhase) {
                case 0:
                    this.clickendY = e.data.global.y;
                    if (this.clickbeginY - this.clickendY > 5) {
                        //console.log("lift");
                        this.app.room.send({command: "lift"});
                        gsap.to(cup, {duration: 0.7, y: -500, alpha: 0})
                    } else {
                        //console.log("look");
                        this.app.room.send({command: "look"});
                        showDice.visible = false;
                        changeDice.visible = true;
                        gsap.to(cup, {duration: 0.5, y: -100});
                    }
                    break;
                case 1:
                    this.app.room.send({command: "reorder", value: '{"hide": [1,2,3], "show":[]}'});
                    gsap.to(cup, {duration: 0.5, y: 0});
                    break;
                    /*
                    changeDice.diceArray.forEach(dice => {
                        if (dice.visible) {
                            dice.y = -100;
                        }
                    })
                    */
                case 2:
                    /*
                    showDice.visible = false;
                    proposeDice.visible = true;
                    cup.x = 500;
                    cup.visible = false;
                    */
                    
                    
                    gsap.to(cup, {duration: 0.1, x:"+=20", yoyo:true, repeat:5, onCompleteParams: [this.app], onComplete:function(app){
                        app.room.send({command: "throw"});
                    }});
                    break;
                case 3:
                    this.app.room.send({command: "look"});
                    showDice.visible = false;
                    changeDice.visible = true;
                    gsap.to(cup, {duration: 0.5, y: -100});
                    break;
                case 4:
                    this.app.room.send({command: "reorder", value: '{"hide": [1,2,3], "show":[]}'});
                    gsap.to(cup, {duration: 0.5, y: 0, onComplete:function(){
                        changeDice.visible = false;

                        proposeDice.alpha = 0;
                        showDice.alpha = 0;
                        proposeDice.visible = true;
                        showDice.visible = true;
                        showDice.y = -150;
                        showDice.zIndex = 20;
                        proposeDice.zIndex = 21;

                        //gsap.to(showDice, {duration: 0.5, alpha: 100});
                        //gsap.to(proposeDice, {duration: 0.5, alpha: 100});
                    }});
                    
                    
                    break;
                case 5:


                    //app.ticker.remove();
            }
        });
    }

        
        
        
}