import { Schema, type, ArraySchema, filter } from "@colyseus/schema";
import { Client } from "colyseus";

// TODO: Change the class name to singular: 'die' instead of 'dice'

// This class makes a Dice object
export class Dice extends Schema {
    @type("string")
    owner: string;

    @type("boolean")
    visible: boolean = false;

    @filter(function (this: Dice, client: Client, value?: Dice['eyes'], root?: Schema) {
        return this.visible || this.owner === client.sessionId;
    })
    @type("uint8")
    eyes: number;

    @type("uint8")
    id: number;

    constructor(owner: string, visible: boolean, eyes: number, id: number) {
        super();

        this.owner = owner;
        this.visible = visible;
        this.eyes = eyes;
        this.id = id;
    }

    rollDice() {
        this.eyes = Math.floor(Math.random() * 6) + 1;
        this.owner = "";
    }
}

// This class is a collection of three dice
export class DiceCollection extends Schema {
    @type([Dice])
    collection: ArraySchema<Dice> = new ArraySchema<Dice>();

    @type('int8')
    number: number;

    @type('int16')
    sum: number = 0;

    @type('string')
    owner: string = "";

    constructor(number: number) {
        super();

        for (let i = 0; i < number; i++) {
            this.collection[i] = new Dice(this.owner, false, 0, i+1);
        }
        this.number = number;
    }

    diceSum() {
        let sum = "";
        this.collection.sort((a, b) => (a.eyes < b.eyes) ? 1 : -1);
        this.collection.forEach(dice => {
          sum += dice.eyes;
        });
        this.sum = parseInt(sum);
    }

    ownDice(sessionId: string) {
        this.owner = sessionId;
        this.collection.forEach(dice => {
            dice.owner = sessionId;
        });
    }

    showAllDice() {
        this.collection.forEach(dice => {
            dice.visible = true;
        });
    }

    setDice(eyesArr: Array<number>) {
        this.collection.forEach((dice, i) => {
            dice.eyes = eyesArr[i];
        });
        this.diceSum();
    }

    getDiceById(id: number) {
        for (let i = 0; i < this.number; i++) {
            if (id == this.collection[i].id) {
                return this.collection[i];
            }
        }
    }

    rollDice(idArr: Array<number>) {
        // which dice to throw
        idArr.forEach(id => {
            this.getDiceById(id).rollDice();
        });
    }

    display() {
        return this.collection.map(a => a.eyes)
    }
}