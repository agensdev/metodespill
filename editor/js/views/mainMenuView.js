import { readLocalTextFile } from '../utils.js'

export default class MainMenuView {
    constructor(htmlContainer, delegates, autoSaveState) {

        this.view = htmlContainer;
        this.fileExplorer = document.getElementById("fileExplorer")
        this.openExplorerBt = document.getElementById("openGameBt")
        this.newGameBt = document.getElementById("createNewGameBt")
        this.saveGameBt = document.getElementById("saveGameBt")
        this.autoSaveSwitch = document.getElementById("autoSaveSwitch")
        this.delegates = delegates

        this.autoSaveSwitch.checked = autoSaveState || false;
        this.autoSaveSwitch.onchange = async (e) => {
            await this.delegates.onAutoSaveTogle(this.autoSaveSwitch.checked)
        }

        this.saveGameBt.onclick = () => {
            this.delegates.onSaveGame();
        }

        this.openExplorerBt.onclick = () => {
            this.fileExplorer.click();
        }

        this.newGameBt.onclick = () => {
            this.delegates.onNewGame();
        }

        this.fileExplorer.onchange = async (e) => {
            const file = e.target.files[0];
            try {
                const script = await readLocalTextFile(file);
                this.delegates.onGameLoaded(script);
            } catch (error) {
                console.error(error);
                this.delegates.onError("Could not load game source file");
            }

        }


    }
}