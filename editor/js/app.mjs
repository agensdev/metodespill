
import { saveToLocalCache, getFromLocalCache, readLocalTextFile } from './utils.js'
import { HTMLUtilityTools } from './uiExt.js'
import Suggestion from './suggestion.js'

import MainMenuView from './views/mainMenuView.js'
import BaseGameInfoView from './views/baseGameInfoView.js'
import BadgesView from './views/badgesView.js'
import SectionView from './views/sectionView.js'

class Application {
    constructor(autoSave, script) {
        this.container = document.getElementById("ide");
        this.sections = document.getElementById("sections");
        this.delegates = this.createDelegateHandler();
        this.gameSourceShadow = null;
        this.autoSave = autoSave
        this.mainMenu = new MainMenuView(document.getElementById("mainMenu"), this.delegates, this.autoSave);
        this.loadedImages = []

        this.updateListeners = [];

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
                "scenes": {},
                "badges": []
            })
        };

        delegate.onGameLoaded = (script) => { this.loadScript(script) }

        delegate.onAutoSaveTogle = async (save) => {
            this.autoSave = save;
            await saveToLocalCache("autoSave", save);
        }

        delegate.onChange = async () => {
            await this.autoSaveSource();
            this.updateListeners.forEach(listener => listener.update());
        }

        delegate.onSaveGame = () => {

            let zip = new JSZip();
            zip.file(`${this.gameSourceShadow.gameName}.json`, JSON.stringify(this.gameSourceShadow));
            let imgDir = zip.folder("images");

            this.loadedImages.forEach(img => {
                let source = img.data.replace(/^.*?base64,/, '')
                let data = atob(source, source.length)
                let asArray = new Uint8Array(data.length);
                for (var i = 0, len = data.length; i < len; ++i) {
                    asArray[i] = data.charCodeAt(i);
                }
                var blob = new Blob([asArray.buffer], { type: "image/png" });
                imgDir.file(img.name, blob);
            });

            zip.generateAsync({ type: "blob" })
                .then(function (content) {
                    saveAs(content, `${window.app.gameSourceShadow.gameName}.zip`)
                });

        }

        delegate.onAddNewState = async () => {
            return await this.addNewState();
        }

        delegate.onAddNewBadge = async () => {
            return await this.addNewBadge();
        }

        delegate.onExportComplete = () => {
            this.alert("Export complete", "Game is know awailable to play", "alert-success")
        }

        delegate.onNewSection = async () => {
            //TODO: Knappen bør være disabled når det ikke er noe spill 
            if (this.gameSourceShadow) {
                let title = "NewSection" ///TODO : Forsikre unike navn. 
                this.gameSourceShadow.scenes[title] = { statechange: [], clearSceneHistory: false, headerImage: null, header: [], content: [], actions: [], auxiliaryContent: {} }
                new SectionView(title, this.gameSource, this.sections, this.delegates);
                await this.autoSaveSource()
            }
        }

        return delegate;
    }

    async onGameSourceChange(target, key, value) {
        target[key] = value;
        await this.autoSaveSource();
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
        this.sections.innerHTML = ""; ///TODO Gjør dette på en bedre måte?

        this.updateListeners.push(new BaseGameInfoView(source, this.sections, this.delegates));
        if (source.scenes) {
            Object.keys(source.scenes).forEach(title => {
                new SectionView(title, source, this.sections, this.delegates)
            });
        }
        new BadgesView(source, this.sections, this.delegates);
    }


    async addNewState() {

        return new Promise((resolve, reject) => {

            halfmoon.toggleModal('modal-newState');
            let addBt = document.querySelector("#saveNewStateItemBt");
            let cancelBt = document.querySelector("#cancelNewStateItem");
            let stateKey = document.querySelector("#newStateItemKey");
            let stateValue = document.querySelector("#newStateItemValue");
            let stateType = document.querySelector("#newStateItemType");

            stateKey.value = "";
            stateValue.value = "";

            cancelBt.onclick = () => {
                resolve(null)
                halfmoon.toggleModal('modal-newState');
            }
            addBt.onclick = () => {
                ///TODO: Validering av state verdier 
                resolve({ key: stateKey.value, value: stateValue.value, type: stateType.value });
                halfmoon.toggleModal('modal-newState');
            }

        });
    }

    async addNewBadge() {
        return new Promise((resolve, reject) => {

            halfmoon.toggleModal('modal-newBadge');
            let addBt = document.querySelector("#saveNewBadgeBt");
            let cancelBt = document.querySelector("#cancelNewBadgeBt");

            let title = document.querySelector("#newBadgeTitle");
            let description = document.querySelector("#newBadgeDescription");
            let rules = document.querySelector("#newBadgeRules");
            let image = document.querySelector("#newBadgeImage");
            image.setAttribute("list", Suggestion.IMAGES)

            [title, description, rules, image].forEach(item => item.value = "")

            cancelBt.onclick = () => {
                resolve(null)
                halfmoon.toggleModal('modal-newBadge');
            }
            addBt.onclick = () => {

                let conditions = rules.value.split(",").map(item => {
                    let keyValue = item.split(":");
                    return { target: keyValue[0], value: keyValue[1] }
                }) || null;

                resolve({
                    name: title.value,
                    description: description.value,
                    img: image.value,
                    display: false,
                    version: 1,
                    conditions: conditions
                });
                halfmoon.toggleModal('modal-newBadge');
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

    try {
        await HTMLUtilityTools.loadAndEmbedTemplate("components/baseGameInfo.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/badgeSection.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/stateButtons.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/sectionView.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/sourceModal.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/themeSection.html");
    } catch (error) {
        console.error(error);
    }

    window.app = new Application(autoSave, script);
}