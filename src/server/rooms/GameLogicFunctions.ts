// This file contains a lot of functions that are called from GameRoom.ts
// These function contain game logic and other helper code. Its shortened to 'glf'
// There is a lot of debugging logging code in these functions

import { State, Player } from './State';

// This is called every time when the player sends a message
// When the player has a name it does nothing.
// Otherwise it checks if the player want to set a name.
// Return 1 if a name is set, otherwise return 0
export function nameSetter(player: Player, state: State, command: string, value: string) {
    if (player.name) return 1;

    // If a player doesn't have a name and wants to set a name
    if (command === 'name' && value) {

        // If name already exists in current players refuse name
        for (let id of state.playerSeats) {
            if (state.players[id].name == value) return 0;
        }

        player.name = value;
        console.log(player.sessionId, "registered as:", player.name);
        return 0;
    }

    // If a player doesn't have a name he can't send anything
    return 0;
}

// TODO: Simplify the naming function?
// I forgot why I made it this way
// Why not ask the player to name himself once when he joins

// If the game is over, return 1
export function isGameOver(state: State) {
    return state.losingPlayer;
}

// TODO: Making the owning of dice more simple
// It's too complicated i feel.

//TODO: Make the naming of 'proposing' and synonyms consistent in all files

// Changing the dice owner if the player looks
export function look(player: Player, state: State) {
    state.lastAction = "looking";
    console.log("Player is", state.lastAction, "under cup");
    state.roll.ownDice(player.sessionId);
    console.log("Reveal roll:", state.roll.display(), "for player:", player.sessionId);
}

// Lifting the cup and revealing the dice by making them visible
export function lift(player: Player, state: State) {
    state.lastAction = "lifting";
    console.log("Player is", state.lastAction, "cup");
    state.roll.showAllDice();
    state.roll.ownDice(player.sessionId);
    console.log("Reveal roll:", state.roll.display(), "for everyone");
}

// Reordering the dice that are outside of the cup
export function reorder(state: State, jsonString: string) {
    state.lastAction = "reordering";
    console.log("Player is", state.lastAction, "dice");

    // JSON format: {"show": [1,2], "hide": [3]}
    interface Change {
        show: Array<number>;
        hide: Array<number>;
    }

    let obj: Change;
    try {
        obj = JSON.parse(jsonString);
    } catch (err) {
        console.log(err);
        return 0;
    }
     
    if (!obj.show || !obj.hide) return 0;
    if (obj.show.length + obj.hide.length != 3) return 0;
    if (obj.show.reduce((a, b) => a + b, 0) + obj.hide.reduce((a, b) => a + b, 0) != 6) return 0;

    obj.show.forEach(id => {
        if (id < 1 || id > 3) return 0;
        let dice = state.roll.getDiceById(id);
        dice.visible = true;
    });

    obj.hide.forEach(id => {
        if (id < 1 || id > 3) return 0;
        let dice = state.roll.getDiceById(id);
        dice.visible = false;
    });
    
    return 1;
}

// Throwing a dice collection to get random eyes
export function rollDice(state: State) {
    state.lastAction = "rolling";
    console.log("Player is", state.lastAction, "dice");

    // Throw all hidden dice
    let hidden: Array<number> = [];
    state.roll.collection.forEach(dice => {
        if (dice.visible == false) {
            hidden.push(dice.id);
        }
    })

    state.roll.rollDice(hidden);
    console.log("Player rolled:", state.roll.display());
}

// Passing is making a proposal without having seen the dice
export function pass(state: State) {
    state.lastAction = "passing";
    console.log("Player is", state.lastAction);
}

// Propose a new value that is beneath the cup
export function propose(player: Player, state: State, jsonString: string) {
    state.lastAction = "proposing";
    console.log("Player is", state.lastAction, "roll");

    // JSON format: {"roll": [1,2,3], "tip": 1}
    interface PropIf {
        roll: Array<number>;
        tip: number;
    }
    
    let obj: PropIf;
    try {
        obj = JSON.parse(jsonString);
    } catch (err) {
        console.log(err);
        return 0;
    }

    if (!obj.roll || obj.tip == undefined) return 0;
    if (obj.roll.length != 3) return 0;
    obj.roll.forEach(num => {
        if (num < 1 || num > 6) return 0;
    });
    if (obj.tip < 0 || obj.tip > 6) return 0;

    // Save previous proposal
    let prevProposedRoll = state.proposedRoll;
    const prevProp = prevProposedRoll.display();
    const prevPropSum = prevProposedRoll.sum;
    let prevPropOwner;
    if (state.players[prevProposedRoll.owner]) {
        prevPropOwner = state.players[prevProposedRoll.owner].seat;
    } else {
        prevPropOwner = -1;
    }

    // Set new proposal
    state.proposedRoll.setDice(obj.roll);
    state.proposedRoll.ownDice(player.sessionId);

    const prop = state.proposedRoll.display();
    const propSum = state.proposedRoll.sum;
    const propOwner = state.players[state.proposedRoll.owner].seat;

    console.log("previous proposed:", prevProp, "(" + prevPropSum + ")", "By Player " + prevPropOwner);
    console.log("now proposed:", prop, "(" + propSum + ")", "By Player " + propOwner);

    if (propSum <= prevPropSum) {
        console.log("Can't make this proposal, too small!");
        return 0;
    } else if (propSum + obj.tip > 666) {
        console.log("Can't make this proposal, tip reaches over 666!");
        return 0;
    } else {
        return 1;
    }
}



// Deciding on the loser when the game is over
export function decideLoser(state: State) {
    const propsum = state.proposedRoll.sum;
    const rollsum = state.roll.sum;

    console.log("proposed:", state.proposedRoll.display(), "(" + propsum + ")");
    console.log("roll:", state.roll.display(), "(" + rollsum + ")");

    if (rollsum >= propsum) {
        state.losingPlayer = state.roll.owner;
    } else {
        state.losingPlayer = state.proposedRoll.owner;
    }

    state.phase = "Game Finised! Loser: " + state.players[state.losingPlayer].seat;
}

export function restart(state: State) {
    // TODO: figure out a way to reset after a game
    //let oldseats: ArraySchema<string>;
    if (state) {
        let oldseats = state.playerSeats;
    }
}

export function updatePhase(playerCount: number, state: State) {
    if (playerCount < 2) {
        state.phase = "Waiting for at least 2 players to join...";
    } else if (playerCount > 1) {
        state.phase = "Playing..."
    }
}