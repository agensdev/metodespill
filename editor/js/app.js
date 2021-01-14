
import { saveToLocalCache, getFromLocalCache, readLocalTextFile } from './utils.js'
import { HTMLSelectorTools } from './uiExt.js'
import MainMenu from './views/mainMenu.js'
import { setUncaughtExceptionCaptureCallback } from 'process';

class Application {
    constructor() {
        this.container = ocument.getElementById("ide");
        this.mainMenu = new MainMenu(this.container);
    }





}

const app = new Application();

window.onload = async () => {

}