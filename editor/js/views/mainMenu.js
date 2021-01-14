import { HTMLUtilityTools } from '../uiExt.js'

export default class MainMenu {
    constructor(container) {

        this.container = container;
        this.ui = HTMLUtilityTools.createInstanceOfTemplate("mainMenuTemplate");


    }
}