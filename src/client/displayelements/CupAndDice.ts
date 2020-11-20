import * as PIXI from "pixi.js";
import { ProposeDice, MainDice } from "./Dice";
import { Application } from "../Application"; 
import { gsap } from "gsap";


const cupSrc = require("../assets/cup2.png");


export class CupAndDice extends PIXI.Container {
    app: Application;

    constructor(app: Application) {
        super();
        this.app = app;
        this.sortableChildren = true;

        let mainDice = new MainDice();
        mainDice.pivot.x = mainDice.width / 2;
        mainDice.pivot.y = mainDice.height / 2;
        mainDice.y = 75;
        mainDice.visible = false;
        this.addChild(mainDice);

        let proposeDice = new ProposeDice();
        proposeDice.pivot.x = proposeDice.width / 2;
        proposeDice.pivot.y = proposeDice.height / 2;
        proposeDice.visible = false;
        this.addChild(proposeDice);


        let texture = PIXI.Texture.from(cupSrc);
        let cup = new PIXI.Sprite(texture);
        cup.anchor.set(0.5, 0.5);
        cup.setTransform(0,0,0.9,0.9,Math.PI);
        cup.zIndex = 1;
        this.addChild(cup);
       
        cup.interactive = true;
        cup.buttonMode = true;
        let cupAnimating = false;

        //Listener that waits for a change in the roll, which means
        //that the dice should be updated.
        this.app.room.state.roll.onChange = (changes) => {
            let values = []
            for(let i = 0; i<3; i++) {
                let eyes = changes[0].value[i].eyes;
                if (!eyes) return;
                values.push(eyes);
            }
            console.log(values)
            mainDice.updateDice(values);
        };

        // https://pixijs.io/examples/#/interaction/dragging.js (Draging)

        let clickbeginY = 0;
        let clickbeginX = 0;
        let clickbeginT = 0;
        let clickendY = 0;
        let clickendX = 0;
        let clickendT = 0;

        cup.on('hammer-swipeup', function(ev) {
            console.log(ev);
        });

        cup.on('pointerdown', e => {
            clickbeginY = e.data.global.y;
            clickbeginX = e.data.global.x;
            clickbeginT = Date.now();
        });

        cup.on('pointerup', e => {
            switch(this.app.room.state.turnPhase) {
                case 0:
                    clickendY = e.data.global.y;
                    clickendT = Date.now();
                    console.log(clickendT-clickbeginT);
                    if (clickbeginY - clickendY > 10) {
                        //console.log("lift"); 
                        this.app.room.send({command: "lift"});
                        gsap.to(cup, {duration: 0.7, y: -500, alpha: 0})
                    } else {
                        //console.log("look");
                        this.app.room.send({command: "look"});
                        // showDice.visible = false;
                        // changeDice.visible = true;
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
                    if (!cupAnimating) {
                        cupAnimating = true;
                        mainDice.modeSide();
                        gsap.to(cup, {duration: 0.1, x:"+=20", yoyo:true, repeat:5, onCompleteParams: [this.app], onComplete:function(app){
                            app.room.send({command: "throw"});
                            mainDice.modeTopCup();
                            cupAnimating = false;
                        }});
                    }
                    break;
                case 3:
                    this.app.room.send({command: "look"});
                    mainDice.visible = true;
                    mainDice.modeInteractive();
                    mainDice.zIndex = 0;
                    gsap.to(cup, {duration: 0.5, y: -100});
                    break;
                case 4:
                    let publicDice = mainDice.public;
                    let hiddenDice = mainDice.hidden;

                    mainDice.modeTopCup();
                    mainDice.zIndex = 100;
                    this.app.room.send({command: "reorder", value: `{"hide": [${hiddenDice}], "show": [${publicDice}]}`});

                    proposeDice.alpha = 0;
                    proposeDice.visible = true;
                    proposeDice.zIndex = 100;
                    gsap.to(cup, {duration: 0.5, y: 0, onComplete:function(){
                        gsap.to(proposeDice, {duration: 0.5, alpha: 1});
                    }});
                    
                    break;
                case 5:
                    clickendX = e.data.global.x;
                    clickendT = Date.now();
                    let prop = [];
                    console.log(clickendT-clickbeginT);
                    if (clickendX - clickbeginX > 5 && clickendT - clickbeginT < 400) {
                        proposeDice.diceArray.forEach(dice => {
                            prop.push(dice.eyes);
                        });
                        console.log(prop);
                        this.app.room.send({command: "propose", value: `{"roll": [${prop}], "tip": 1}`});
                        gsap.to(cup, {duration: 0.7, x: -500, alpha: 0})
                        console.log("lift");
                    }

                    //app.ticker.remove();
            }
        });
    }

        
        
        
}