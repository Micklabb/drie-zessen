import { Application } from "./Application";

const app = new Application();
//app.interpolation = true;
document.body.appendChild(app.view);

//app.interpolation = true;

(window as any).app = app;

const WIDTH = 400;
const HEIGHT = 400;

// allow to resize viewport and renderer
window.onresize = () => {
    let newDims: [number, number] = app.setSize(WIDTH, HEIGHT);
    app.stage.scale.set(newDims[0] / app.initialDims[0], newDims[1] / app.initialDims[1]);   
}
