import { readLocalTextFile, readLocalBinaryFile, clearCache } from '../utils.js'

export default class MainMenuView {
    constructor(htmlContainer, delegates, autoSaveState) {

        this.view = htmlContainer;
        this.fileExplorer = document.getElementById("fileExplorer")
        this.openExplorerBt = document.getElementById("openGameBt")
        this.newGameBt = document.getElementById("createNewGameBt")
        this.saveGameBt = document.getElementById("saveGameBt")
        this.exportGameBt = document.getElementById("exportGameBt")
        //this.autoSaveSwitch = document.getElementById("autoSaveSwitch")
        this.newSectionBT = document.getElementById("newSectionBT");
        this.delegates = delegates

        /*this.autoSaveSwitch.checked = autoSaveState || false;
        this.autoSaveSwitch.onchange = async (e) => {
            await this.delegates.onAutoSaveTogle(this.autoSaveSwitch.checked)
        }*/

        this.playWindow = null
        this.playButton = document.getElementById("playGame");
        this.playButton.onclick = () => {
            ///TODO: Ikke kjør dersom det ikke finnes et spillbart spill
            if (!this.playWindow) {
                this.playWindow = window.open("../game", "PlayGame",)
            }
            this.playWindow.postMessage(window.app.gameSourceShadow, "*") ///TODO: Gjør dette bedre
        }

        /*
        this.developerPurge = document.getElementById("developerPurge");
        this.developerPurge.onclick = async () => {
            await clearCache();
            location.reload();
        }
        */


        if (this.exportGameBt) {
            this.exportGameBt.onclick = () => {
                ///TODO. Export game to cloude? 
                this.delegates.onExportComplete();
            }
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

        this.newSectionBT.onclick = async () => {
            await this.delegates.onNewSection();
        }

        this.fileExplorer.onchange = async (e) => {
            const file = e.target.files[0];
            try {
                //const data = await readLocalBinaryFile(file);
                await this.delegates.onGamePackageLoaded(file);
            } catch (error) {
                console.error(error);
                this.delegates.onError("Could not load game source file");
            }
        }




    }
}