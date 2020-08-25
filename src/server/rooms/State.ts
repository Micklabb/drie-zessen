import { Schema, type, MapSchema, ArraySchema } from "@colyseus/schema";
import { DiceCollection } from './Dice'


export class Player extends Schema {
    @type('int16')
    seat: number;

    @type('string')
    sessionId: string;

    @type('string')
    name: string = '';
}

// This class registers the variables that are passed on
// and visible to the client with every update.
export class State extends Schema {
    @type({ map: Player })
    players: MapSchema<Player> = new MapSchema<Player>();

    @type(['string'])
    playerSeats: ArraySchema<string> = new ArraySchema<string>();

    @type(DiceCollection)
    roll: DiceCollection;;

    @type(DiceCollection)
    proposedRoll: DiceCollection;;

    @type('string')
    phase: string = 'waiting';

    @type('string')
    losingPlayer: string = "";

    @type('int16')
    playerTurn: number = 0;

    @type('string')
    lastAction: string = "";

    @type('int8')
    turnPhase: number;

}
