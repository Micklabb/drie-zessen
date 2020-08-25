import * as PIXI from "pixi.js";
import { gsap } from "gsap";

var STYLE = new PIXI.TextStyle({
    fontFamily: 'Arial',
    fontSize: 85,
    fill: ['#000000'],
    stroke: '#4a1850',
    strokeThickness: 0,
});

export class Dice extends PIXI.Container {

    eyes: number = 1;
    dicetext: PIXI.Text;
    id: number;
    public_eyes: boolean = false;

    constructor(){
        super();

        let bg = new PIXI.Graphics();
        bg.beginFill(0xFFFFFF);
        bg.drawRect(10, 23, 45, 45);
        bg.endFill();
        this.addChild(bg);
        
        this.dicetext = new PIXI.Text("", Object.assign({}, STYLE));
        this.updateEyes(1);
        this.addChild(this.dicetext);
    }

    updateEyes(i: number) {
        this.eyes = i;
        let val = 2680 + this.eyes - 1;
        let unicode: string = String.fromCodePoint(parseInt(`${val}`, 16));
        this.dicetext.text = unicode;
    }
}

export class DiceGroup extends PIXI.Container {
    diceArray: Array<Dice> = [];
    diceValues: Array<number> = [1,1,1];

    constructor(){
        super();

        for(let i = 0; i<3; i++) {
            this.diceArray[i] = new Dice();
            this.diceArray[i].id = i+1;
            this.diceArray[i].updateEyes(this.diceValues[i]);
            this.diceArray[i].x = i*60;
            this.addChild(this.diceArray[i]);
        }
    }

    getDiceById(id) {
        this.diceArray.forEach(dice => {
            if(dice.id == id) return dice;
        })
    }
}

export class ProposeDice extends DiceGroup {
    lastDiceValues: Array<number>;

    selectedStyle = Object.assign({}, STYLE);

    constructor(){
        super();
        this.selectedStyle.fill = '#ff0000';
        this.lastDiceValues = Object.assign({}, this.diceValues);

        for(let i = 0; i<3; i++) {
            this.diceArray[i].interactive = true;
            this.diceArray[i].buttonMode = true;

            this.diceArray[i].on('pointerover', e => {
                this.diceArray[i].dicetext.style = this.selectedStyle;
            });
            this.diceArray[i].on('pointerout', e => {
                this.diceArray[i].dicetext.style = STYLE;
            });
            this.diceArray[i].on('pointerdown', e => {
                this.diceValues[i] = this.diceValues[i] + 1;
                if (this.diceValues[i] > 6) {
                    this.diceValues[i] = this.lastDiceValues[i];
                }
                this.diceArray[i].updateEyes(this.diceValues[i]);
            });
        }
    }
}

function output(show:Array<number>, hide:Array<number>) { 
    this.show = show;
    this.hide = hide;
} 

export class ChangeDice extends DiceGroup {
    selectedStyle = Object.assign({}, STYLE);
    
    output;

    constructor(){
        super();
        this.selectedStyle.fill = '#0000ff';

        for(let i = 0; i<3; i++) {
            this.diceArray[i].interactive = true;
            this.diceArray[i].buttonMode = true;

            this.diceArray[i].on('pointerover', e => {
                this.diceArray[i].dicetext.style = this.selectedStyle;
            });
            this.diceArray[i].on('pointerout', e => {
                this.diceArray[i].dicetext.style = STYLE;
            });
            this.diceArray[i].on('pointerdown', e => {
                if (this.diceArray[i].public_eyes) {
                    this.diceArray[i].public_eyes = false;
                    gsap.to(this.diceArray[i], {duration: 0.5, y: 0});
                    this.diceArray[i].dicetext.style = STYLE;
                    this.updateVisibility();
                } else {
                    this.diceArray[i].public_eyes = true;
                    gsap.to(this.diceArray[i], {duration: 0.5, y: 50});
                    this.diceArray[i].dicetext.style = this.selectedStyle;
                    this.updateVisibility();
                }
            });
        }
    }

    updateVisibility() {
        let show: Array<number> = [];
        let hide: Array<number> = [];
        this.diceArray.forEach(dice => {
            if (dice.public_eyes) {
                show.push(dice.id);
            } else {
                hide.push(dice.id);
            }
        });
        this.output = output(show, hide);
    }
}
