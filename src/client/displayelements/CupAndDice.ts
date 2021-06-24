import * as PIXI from "pixi.js";
import { ProposeDice, MainDice } from "./Dice";
import { Application } from "../Application"; 
import { gsap } from "gsap";


const cupSrc = require("../assets/cup2.png");


export class CupAndDice extends PIXI.Container {
    app: Application;

    // Elements in container
    mainDice = new MainDice();
    proposeDice = new ProposeDice();
    cup = new PIXI.Sprite();

    // Stores info about a pointer event
    click = {
        tstart: 0,
        tend: 0,
        xstart: 0,
        xend: 0,
        ystart: 0,
        yend: 0
    };

    constructor(app: Application) {
        super();
        this.app = app;
        this.sortableChildren = true;

        this.addElements();

        // Register all listeners
        this.app.room.state.roll.onChange = (changes) => this.onNewRoll(changes);
        this.cup.on('pointerdown', e => this.onPointerDownCup(e));
        this.cup.on('pointerup', e => this.onPointerUpCup(e));

        // https://pixijs.io/examples/#/interaction/dragging.js (Draging)
    }

    // Update values of dice
    onNewRoll(changes) {
        let values = []
        for(let i = 0; i<3; i++) {
            let eyes = changes[0].value[i].eyes;
            if (!eyes) return;
            values.push(eyes);
        }
        console.log(values)
        this.mainDice.updateDice(values);
    }

    // Stores event data in case of pointer event
    onPointerDownCup(e) {
        this.click.ystart = e.data.global.y;
        this.click.xstart = e.data.global.x;
        this.click.tstart = Date.now();
    }

    // Handles pointer events corresponding to turn phases
    onPointerUpCup(e) {
        let cupAnimating = false;
        switch(this.app.room.state.turnPhase) {
            case 0:
                this.click.yend = e.data.global.y;
                this.click.tend = Date.now();
                console.log(this.click.tend-this.click.tstart);
                if (this.click.ystart - this.click.yend > 10) {
                    //console.log("lift"); 
                    this.app.room.send({command: "lift"});
                    gsap.to(this.cup, {duration: 0.7, y: -500, alpha: 0})
                } else {
                    //console.log("look");
                    this.app.room.send({command: "look"});
                    // showDice.visible = false;
                    // changeDice.visible = true;
                    gsap.to(this.cup, {duration: 0.5, y: -100});
                }
                
                break;
            case 1:
                this.app.room.send({command: "reorder", value: '{"hide": [1,2,3], "show":[]}'});
                gsap.to(this.cup, {duration: 0.5, y: 0});
                break;
                /*
                changeDice.diceArray.forEach(dice => {
                    if (dice.visible) {
                        dice.y = -100; 
                    }
                })
                */
            case 2:                    
                if (!cupAnimating) {
                    cupAnimating = true;
                    this.mainDice.modeSide();
                    gsap.to(this.cup, {duration: 0.1, x:"+=20", yoyo:true, repeat:5, onCompleteParams: [this], onComplete:function(parent){
                        parent.app.room.send({command: "throw"});
                        parent.mainDice.modeTopCup();
                        parent.cupAnimating = false;
                    }});
                }
                break;
            case 3:
                this.app.room.send({command: "look"});
                this.mainDice.visible = true;
                this.mainDice.modeInteractive();
                this.mainDice.pivot.x = this.mainDice.width / 2;
                this.mainDice.zIndex = 0;
                gsap.to(this.cup, {duration: 0.5, y: -100});
                break;
            case 4:
                let publicDice = this.mainDice.public;
                let hiddenDice = this.mainDice.hidden;

                this.mainDice.modeTopCup();
                this.mainDice.zIndex = 100;
                this.app.room.send({command: "reorder", value: `{"hide": [${hiddenDice}], "show": [${publicDice}]}`});

                this.proposeDice.alpha = 0;
                this.proposeDice.visible = true;
                this.proposeDice.zIndex = 100;
                gsap.to(this.cup, {duration: 0.5, y: 0, onCompleteParams: [this], onComplete:function(parent){
                    gsap.to(parent.proposeDice, {duration: 0.5, alpha: 1});
                }});
                
                break;
            case 5:
                this.click.xend = e.data.global.x;
                this.click.tend = Date.now();
                let prop = [];
                console.log(this.click.tend-this.click.tstart);
                if (this.click.xend - this.click.xstart > 5 && this.click.tend - this.click.tstart < 400) {
                    this.proposeDice.diceArray.forEach(dice => {
                        prop.push(dice.eyes);
                    });
                    console.log(prop);
                    this.app.room.send({command: "propose", value: `{"roll": [${prop}], "tip": 0}`});
                }
                break;
        }

    }

    // Returns if it is the players turn or not
    myTurn() {
        let turn = this.app.room.state.playerTurn;
        let seat = this.app.room.state.players[this.app.room.sessionId].seat;
        return turn == seat
    }

    // This resets the cup and dice controls if a turn changes
    checkForTurnChange() {
        // Checks if the cup is supposed to be visible
        if(this.myTurn()) {
            this.cup.visible = true;
        } else {
            this.cup.visible = false;
        }

        // End the turn
        if(this.app.room.state.turnPhase == 6 && this.myTurn()) {
            gsap.to(this.cup, {duration: 1.0, x: 500, alpha: 0, onCompleteParams: [this], onComplete:function(parent){
                parent.mainDice.visible = false;
                parent.proposeDice.visible = false;
                parent.app.room.send({command: "ending_turn"});
            }});
        }
        
        // Begin new turn
        if(this.app.room.state.turnPhase == 6 && !this.myTurn()) {
            this.cup.x = -500;
            this.cup.alpha = 0;
            this.cup.visible = true;
            gsap.to(this.cup, {duration: 1.0, x: 0, alpha: 1, onCompleteParams: [this], onComplete:function(parent){
                parent.mainDice.visible = false;
                parent.proposeDice.visible = false;
            }});
        }
    }

    addElements() {
        this.mainDice.pivot.x = this.mainDice.width / 2;
        this.mainDice.pivot.y = this.mainDice.height / 2;
        this.mainDice.y = 75;
        this.mainDice.visible = false;
        this.addChild(this.mainDice);

        this.proposeDice.pivot.x = this.proposeDice.width / 2;
        this.proposeDice.pivot.y = this.proposeDice.height / 2;
        this.proposeDice.visible = false;
        this.addChild(this.proposeDice);

        let texture = PIXI.Texture.from(cupSrc);
        this.cup.texture = texture;
        this.cup.anchor.set(0.5, 0.5);
        this.cup.setTransform(0,0,0.9,0.9,Math.PI);
        this.cup.zIndex = 1;
        this.addChild(this.cup);

        this.cup.interactive = true; // clickable
        this.cup.buttonMode = true; // pointer icon
    }

}