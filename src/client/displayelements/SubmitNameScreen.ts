import * as PIXI from "pixi.js";
import { TextInput } from "pixi-textinput-v5";
import { Application } from "../Application"; 
import { Button } from "./Button";

export class InsertName extends PIXI.Container {
    input: TextInput;

    app: Application;

    constructor(app: Application) {
        super();
        this.app = app;
        this.visible = false;

        let overlay = new PIXI.Graphics();
        overlay.beginFill(0xFFFFFF, 0.5);
        overlay.drawRect(0, 0, this.app.renderer.width, this.app.renderer.height);
        overlay.endFill();
        this.addChild(overlay);

        let inputContainer = new PIXI.Container();

        let enterName = new PIXI.Text('Vul een naam in:');
        this.input = new TextInput({
            input: {fontSize: '25px'}, 
            box: {fill: 0xEEEEEE}
        });
        this.input.y = 35;

        let button = new PIXI.Graphics();
        button.beginFill(0xff0000);
        button.drawRect(0, 80, 80, 30);
        button.endFill();

        // make the button interactive...
        button.interactive = true;
        button.buttonMode = true;

        button.on('pointerdown', this.onButtonDown.bind(this));
        button.on('pointerup', this.sendName.bind(this));

        this.input.on('keyup', keycode => {
            if(keycode == 13) {
                this.sendName();
                this.input.blur();
            }
        })

        let sendText = new PIXI.Text('Klaar');
        sendText.y = 80;
        sendText.x = 5;

        inputContainer.addChild(this.input);
        inputContainer.addChild(enterName);
        inputContainer.addChild(button);
        inputContainer.addChild(sendText);

        inputContainer.x = this.app.screen.width / 2;
        inputContainer.y = this.app.screen.height / 2;

        inputContainer.pivot.x = inputContainer.width / 2;
        inputContainer.pivot.y = inputContainer.height / 2;

        //console.log(input.width, input.height);
        
        this.addChild(inputContainer);

        this.input.focus();
        
    }

    sendName() {
        //this.isdown = false;
        this.app.room.send({command: "name", value: this.input.text});
    }
    
    onButtonDown() {
        //this.isdown = true;
        //console.log("up");
    }
}







