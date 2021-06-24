import { Room, Client } from "colyseus";
import { State, Player } from './State';
import { DiceCollection } from './Dice'
import * as glf from './GameLogicFunctions'

export class GameRoom extends Room<State> {
  maxClients = 10;

  playerCount: number = 0;
  
  DEBUG = true;

  // This function is called when the first player enters the room.
  // It runs the reset function
  onCreate (options: any) {
    console.log("room created");
    this.reset();
    console.log("-- TURN:", this.state.playerTurn, "PHASE:", this.state.turnPhase + " --");
  }

  // This function is called when a client joins a game.
  // The client object is sent to this function from the browser.
  // The function creates a new player and adds it to the game
  onJoin (client: Client, options: any) {
    let player: Player = new Player();
    player.sessionId = client.sessionId;

    player.seat = this.playerCount;
    this.state.playerSeats[player.seat] = client.sessionId;
    console.log(player.sessionId, "joined with seat:", player.seat);

    this.state.players[client.sessionId] = player;
    this.playerCount++;

    glf.updatePhase(this.playerCount, this.state);
  }

  // This function is called when the a player sends a message.
  // It holds the client object and a message in json notation
  // with a command and a value field
  onMessage (client: Client, message: any) {
    if (!message) return;

    // Here follow some guard clauses before processing the message

    // Debug inspect message
    console.log(client.sessionId, "send:", message);

    // Check if player exists that send message
    let player: Player = this.state.players[client.sessionId];
    if (!player) return;

    let command: string = message['command'];
    let value: string = message['value'];

    // If the game is finished stop receiving mesages
    if (glf.isGameOver(this.state)) return;

    // Reset the game if 'reset' signal is given
    if (command == 'reset') this.restart();

    // Require player name to play the game
    if (!glf.nameSetter(player, this.state, command, value)) return;

    // Require at least two players to play the game
    if (this.playerCount < 2) return;

    // If it's not the players turn he can't send anything
    if (this.state.playerTurn != player.seat) return;

    switch (command) {
      case 'look':
        if (this.state.turnPhase != 0 && this.state.turnPhase != 3) return;
        glf.look(player, this.state);
        this.state.turnPhase += 1;
        // If the player believes a 666 proposal
        if (this.state.proposedRoll.sum == 666) {
          this.state.turnPhase = 10;
        }
        break;
      case 'lift':
        if (this.state.turnPhase != 0) return;
        glf.lift(player, this.state);
        glf.decideLoser(this.state);
        //glf.endGame();
        break;
      case 'reorder':
        if (this.state.turnPhase != 1 && this.state.turnPhase != 4) return;
        if (glf.reorder(this.state, value)) {
          this.state.turnPhase += 1;
        } else {
          console.log("Error when reordering");
        }
        break;
      case 'pass':
        if (this.state.turnPhase != 1 && this.state.turnPhase != 3 && this.state.turnPhase != 4) return;
        if (this.state.turnPhase == 3) {
          glf.pass(this.state);
          this.state.turnPhase += 2;
        } else {
          glf.pass(this.state);
          this.state.turnPhase += 1;
        }
        break;
      case 'throw':
        if (this.state.turnPhase != 2) return;
        glf.rollDice(this.state);
        this.state.turnPhase += 1;
        break;
      case 'propose':
        if (this.state.turnPhase != 5) return;
        if (glf.propose(player, this.state, value)) {
          this.state.turnPhase = 6;
        } else {
          console.log("Error when making proposal");
        }
        break;
      case 'ending_turn':
        if (this.state.turnPhase != 6) return;
        this.state.playerTurn = (this.state.playerTurn + 1) % this.playerCount;
        this.state.turnPhase = 0;
    }
    console.log("-- TURN:", this.state.playerTurn, "PHASE:", this.state.turnPhase + " --");
  }

  // This function is called when a player leaves the room.
  // This happens if a player closes the page.
  // When a player rejoins he gets a new id
  onLeave (client: Client, consented: boolean) {
    let player: Player = this.state.players[client.sessionId];
    console.log(client.sessionId, "(" + player.name + ":" + player.seat + ")", "left with seat:", player.seat);
    

    // reoreder seats of current players
    delete this.state.playerSeats[player.seat];
    this.reorderSeats();

    delete this.state.players[client.sessionId];
    this.playerCount--;

    if (this.playerCount < 2 ) {
      glf.updatePhase(this.playerCount, this.state);
    }
  }

  // TODO: Figure out a way to keep track of player connects and disconnects.
  // Do they have a username, and can they login?
  // If they have connection issues, should they be able to rejoin with the same user?
  // If they leave, should there be a timeout if they don't rejoin in that time, they will lose their session?
  // The function below does this. I found it online but there were problems with it.

  /*
  async leave (client: Client, consented?: boolean) {

    this.leave(client, consented);

    try {
        if (consented) {
            // Optional: you may want to allow reconnection if the client manually closed the connection.
            throw new Error("left_manually");
        }

        const reconnectedClient = await this.allowReconnection(client, 60);
        console.log("Reconnected!");

        this.send(reconnectedClient, "Welcome back!");

    } catch (e) {
        console.log(e);

    }
  }
  */

  reorderSeats() {
    // Remove empty seats
    this.state.playerSeats = this.state.playerSeats.filter(Boolean);

    // Give every player a new seat
    this.state.playerSeats.forEach((sessionId, seat) => {
      const player: Player = this.state.players[sessionId];
      player.seat = seat;
    });
  }

  onDispose() {
    console.log("room disposed");
  }

  reset() {
    let state = new State();

    glf.updatePhase(this.playerCount, state);
    state.playerTurn = 0;
    state.turnPhase = 2;

    state.roll = new DiceCollection(3);
    state.proposedRoll = new DiceCollection(3);
    state.proposedRoll.showAllDice();
    state.proposedRoll.sum = 6;
    
    state.losingPlayer = "";

    if(this.DEBUG){
      state.debug_mode = true;
    }

    this.setState(state);
  }

  // TODO: Make this function work well 
  // The goal is that it should restart the game when it is finished.
  // There is a problem with keeping track of the players.
  restart() {
    let state = this.state;

    glf.updatePhase(this.playerCount, this.state);
    state.playerTurn = 0;
    state.turnPhase = 2;

    state.roll = new DiceCollection(3);
    state.proposedRoll = new DiceCollection(3);
    state.proposedRoll.showAllDice();
    state.proposedRoll.sum = 6;
    
    state.losingPlayer = "";

    this.setState(state);
  }

}
