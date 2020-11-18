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

    updateDice(values) {
        for(let i = 0; i<3; i++) {
            this.diceArray[i].updateEyes(values[i]);
        }
    }

    getDiceById(id) {
        this.diceArray.forEach(dice => {
            if(dice.id == id) return dice;
        })
    }
}

export class ShowDice extends DiceGroup {
    constructor(){
        super(); 
    }

    updateAndDrawDice(values) {
        values.sort().reverse()
        this.removeChildren()
        let pos = 0
        for(let i = 0; i<3; i++) {
            this.diceArray[i].updateEyes(values[i]);
            if (values[i] != 0) {
                this.diceArray[i].x = pos*60;
                this.addChild(this.diceArray[i]);
                pos++
            }
        }
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

export class ChangeDice extends DiceGroup {
    selectedStyle = Object.assign({}, STYLE);

    show = [];
    hide = [];

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
        this.show = [];
        this.hide = [];
        this.diceArray.forEach(dice => {
            if (dice.public_eyes) {
                this.show.push(dice.id);
            } else {
                this.hide.push(dice.id);
            }
        });
    }
}



export class MainDice extends DiceGroup {
    blueStyle = Object.assign({}, STYLE);
    
    constructor(){
        super();
        this.blueStyle.fill = '#0000ff';
    }

    hidden = [];
    public = [];

    // Sorts the array of public dice based on eye count
    sortPublic() {
        let dice = [];
        this.public.forEach(diceId => {
            dice.push(this.diceArray[diceId-1]);
        });
        dice.sort((a, b) => (a.eyes < b.eyes) ? 1 : -1)
        return dice
    }

    // Control visibility of dice in the hidden array
    visibilityHidden(visible: boolean) {
        if (visible) {
            this.hidden.forEach(diceId => {
                let dice = this.diceArray[diceId-1];
                //let dice = this.getDiceById(diceId)
                dice.visible = true;
            });
        } else {
            this.hidden.forEach(diceId => {
                let dice = this.diceArray[diceId-1];
                dice.visible = false;
            });
        }
    }

    // Change public dice position to top
    modeTopCup() {
        this.deletePointerEvents();
        this.visibilityHidden(false);
        let topDice = this.sortPublic();
        this.pivot.x = topDice.length*60/2;

        topDice.forEach((dice, i) => {
            let xPos = i*60;
            let yPos = -200;
            gsap.to(dice, {duration: 0.5, y: yPos, x: xPos});
        });
    }

    // Change publilc dice position to side
    modeSide() {
        this.deletePointerEvents();
        this.visibilityHidden(false);
        let sideDice = this.sortPublic();

        sideDice.forEach((dice, i) => {
            let xPos = 200;
            let yPos = i*60;
            gsap.to(dice, {duration: 0.5, y: yPos, x: xPos});
        });
    }

    
    // Make the dice mode interactive
    modeInteractive() {
        this.visibilityHidden(true);
        // updatePublic should always be called, to account for the case where the user
        // doesn't make any changes in the dice being public or not, i.e. they dont't
        // click so d.on('pointerdown') is never called.
        this.updatePublic();
        for(let i = 0; i<3; i++) {
            let d = this.diceArray[i];

            // Move dice back to original position
            if (d.public_eyes) {
                d.x = i * 60;
                d.y = 75;
            } else {
                d.x = i * 60;
                d.y = 0;
            }

            // Make dice clickable
            d.interactive = true;
            d.buttonMode = true;

            d.on('pointerover', e => {
                d.dicetext.style = this.blueStyle;
            });
            d.on('pointerout', e => {
                d.dicetext.style = STYLE;
            });
            d.on('pointerdown', e => {
                if (d.public_eyes) {
                    d.public_eyes = false;
                    gsap.to(d, {duration: 0.5, y: 0});
                    d.dicetext.style = STYLE;
                    this.updatePublic();
                } else {
                    d.public_eyes = true;
                    gsap.to(d, {duration: 0.5, y: 50});
                    d.dicetext.style = this.blueStyle;
                    this.updatePublic();
                }
            });
        }
    }

    // Deletes the pointer events added
    deletePointerEvents() {
        for(let i = 0; i<3; i++) {
            let d = this.diceArray[i];
            d.interactive = false;
            d.buttonMode = false;
            d.on('pointerover', e => {});
            d.on('pointerout', e => {});
            d.on('pointerdown', e => {});
        }
    }

    // updates hidden and public arrays
    // gets called every dice update
    updatePublic() {
        this.public = [];
        this.hidden = [];
        this.diceArray.forEach(dice => {
            if (dice.public_eyes) {
                this.public.push(dice.id);
            } else {
                this.hidden.push(dice.id);
            }
        });
    }
}
