
import { saveToLocalCache, getFromLocalCache, readLocalTextFile } from './utils.js'
import { HTMLUtilityTools } from './uiExt.js'

import MainMenuView from './views/mainMenuView.js'
import BaseGameInfoView from './views/baseGameInfoView.js'

class Application {
    constructor(autoSave, script) {
        this.container = document.getElementById("ide");
        this.sections = document.getElementById("sections");
        this.delegates = this.createDelegateHandler();
        this.gameSourceShadow = null;
        this.autoSave = autoSave
        this.mainMenu = new MainMenuView(document.getElementById("mainMenu"), this.delegates, this.autoSave);

        if (script) {
            this.loadScript(script)
        }
    }

    createDelegateHandler() {
        let delegate = {};

        delegate.onError = (err) => { this.alert("Error", err, "alert-danger") };

        delegate.onNewGame = () => {
            this.loadScript({
                "gameid": null,
                "gameName": null,
                "description": null,
                "initialState": null,
                "start": null,
                "scenes": [],
                "badges": []
            })
        };

        delegate.onGameLoaded = (script) => { this.loadScript(script) }

        delegate.onAutoSaveTogle = async (save) => {
            this.autoSave = save;
            await saveToLocalCache("autoSave", save);
        }

        delegate.onChange = async () => {
            await this.autoSaveSource()
        }

        delegate.onSaveGame = () => {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(this.gameSourceShadow)));
            element.setAttribute('download', `${this.gameSourceShadow.gameName}.json`); ///TODO make name safe.
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
        }

        delegate.onAddNewState = async () => {
            return await this.addNewState();
        }

        return delegate;
    }

    async onGameSourceChange(target, key, value) {
        target[key] = value;
        await autoSaveSource();
        return true;
    }

    async autoSaveSource() {
        if (this.autoSave) {
            try {
                await saveToLocalCache("gameSource", this.gameSourceShadow);
            } catch (error) {
                this.alert("Auto Save Failed", "Could not autosave changes", "alert-danger")
            }
            console.log("Autosave complete");
        }
    }

    loadScript(script) {
        this.gameSourceShadow = script;
        this.gameSource = new Proxy(this.gameSourceShadow, {
            set: async (t, k, v) => {
                return await this.onGameSourceChange(t, k, v);
            }
        });
        this.renderGameSource(this.gameSource);
    }

    renderGameSource(source) {
        const baseInfo = new BaseGameInfoView(source, this.sections, this.delegates);

    }


    async addNewState() {

        return new Promise((resolve, reject) => {

            halfmoon.toggleModal('modal-newState');
            let addBt = document.querySelector("#saveNewStateItemBt");
            let cancelBt = document.querySelector("#cancelNewStateItem");
            let stateKey = document.querySelector("#newStateItemKey");
            let stateValue = document.querySelector("#newStateItemValue");

            stateKey.value = "";
            stateValue.value = "";

            cancelBt.onclick = () => {
                resolve(null)
                halfmoon.toggleModal('modal-newState');
            }
            addBt.onclick = () => {
                ///TODO: Validering av state verdier 
                resolve({ key: stateKey.value, value: stateValue.value });
                halfmoon.toggleModal('modal-newState');
            }

        });
    }


    alert(title, content, type) {
        // type = default: "", must be "alert-primary" || "alert-success" || "alert-secondary" || "alert-danger"
        halfmoon.initStickyAlert({
            content: content,
            title: title,
            alertType: type || "",
            fillType: "filled",
            hasDismissButton: true,
            timeShown: 5000
        })
    }

}



window.onload = async () => {

    localforage.config({
        driver: [localforage.WEBSQL,
        localforage.INDEXEDDB,
        localforage.LOCALSTORAGE],
        name: 'MetodeSpill'
    });

    const autoSave = await getFromLocalCache("autoSave");
    const script = await getFromLocalCache("gameSource");

    window.app = new Application(autoSave, script);
}