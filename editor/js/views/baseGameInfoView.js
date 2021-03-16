import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'
import { readLocalBinaryFile } from '../utils.js'
import Suggestion from '../suggestion.js'

export default class BaseGameInfoView {
    constructor(source, container, delegates) {
        this.source = source;
        this.view = HTMLUtilityTools.createInstanceOfTemplate("basicGameInfoTemplate");
        this.view = container.appendChild(this.view);
        this.delegates = delegates
        this.gameNameView = document.getElementById("gameNameTxt");
        this.gameDescription = document.getElementById("gameDescriptionTxt");
        this.sceneSelection = document.getElementById("startScene");
        this.initialStateDisplay = document.getElementById("initialGameStates");
        this.addStateBt = document.getElementById("addNewInitialStateBt");

        this.uploadList = null;
        this.loadedImages = [];

        // Vis bilder som allerede er tilgjengelige
        /// TODO: Gjør dette bedre. 
        if (window.app && window.app.loadedImages) {
            window.app.loadedImages.forEach(img => {
                this.displayThumbFromBlob(img.data);
            });
        }

        this.gameNameView.value = source.gameName || "";
        this.gameDescription.value = source.description || "";

        this.populateSceneSelector(this.sceneSelection, source)

        this.gameNameView.onchange = () => { source.gameName = this.gameNameView.value; }
        this.gameDescription.onchange = () => { source.description = this.gameDescription.value; }
        this.sceneSelection.onchange = () => { source.start = this.sceneSelection.value; }

        this.files = document.getElementById("dnd");
        this.files.ondrop = async ev => {
            ev.preventDefault();
            if (ev.dataTransfer.items) {
                this.uploadList = ev.dataTransfer.items
                await this.uploadFiles(this.uploadList);
            }
        }


        this.files.ondragover = e => {
            e.preventDefault();
        }


        this.addStateBt.onclick = async () => {
            let state = await delegates.onAddNewState();
            if (source.initialState == null || source.initialState == undefined) {
                source.initialState = {};
            }
            source.initialState[state.key] = state.value;
            await delegates.onChange();
            this.populateState(this.initialStateDisplay, source)
        }

        this.populateState(this.initialStateDisplay, source);
    }

    async uploadFiles(items) {

        let files = Object.entries(items).map(item => {
            let file = item[1].getAsFile();
            return file;
        })

        await files.forEach(async file => {
            let type = { type: `"image/${file.name.substring(file.name.indexOf(".") + 1)}" ` }
            let buffer = await readLocalBinaryFile(file);
            let imgFile = new Blob([new Uint8Array(buffer)], type);
            this.displayThumbFromBlob(imgFile)

            /// TODO: Dette burde få en egen util funksjon eller noe.
            window.app.loadedImages.push({ name: file.name, data: imgFile });

            // Making file names avalable for autocomplete in image fields
            Suggestion.addSuggestion(`images/${file.name}`, Suggestion.IMAGES);
        })
    }

    displayThumbFromBlob(data) {
        var img = new Image();
        img.src = URL.createObjectURL(data);
        img.classList.add("thumbnail");
        document.getElementById("imageFileList").appendChild(img);

    }

    update() {
        this.populateSceneSelector(this.sceneSelection, this.source)
    }

    populateState(tbl, source) {

        let tbody = tbl.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ""; ///TODO: Fiks dette, til å slette elementer riktig.

        if (source.initialState) {
            Object.keys(source.initialState).forEach(key => {
                const row = tbody.insertRow();
                const keyCell = row.insertCell();
                const valueCell = row.insertCell();
                const actionCell = row.insertCell();
                actionCell.classList.add("text-right");
                const actionButtons = HTMLUtilityTools.createInstanceOfTemplate("stateButtonsTemplate");

                keyCell.appendChild(document.createTextNode(key));
                valueCell.appendChild(document.createTextNode(source.initialState[key]));
                actionCell.appendChild(actionButtons);

                const deleteBt = actionCell.querySelector("button[data-role=delete]");
                const editBT = actionCell.querySelector("button[data-role=edit]");
                const saveBt = actionCell.querySelector("button[data-role=save]");
                const cancelBt = actionCell.querySelector("button[data-role=cancel]");

                HTMLUtilityTools.setAttribute("data-stateid", key, [valueCell, deleteBt, editBT, saveBt, cancelBt]);

                deleteBt.onclick = async (e) => {
                    let targetKey = e.currentTarget.getAttribute("data-stateid");
                    delete source.initialState[targetKey];
                    await this.delegates.onChange();
                    this.populateState(this.initialStateDisplay, source);
                }

                editBT.onclick = async (e) => {
                    let targetKey = e.currentTarget.getAttribute("data-stateid");

                    saveBt.classList.remove("d-none");
                    cancelBt.classList.remove("d-none");
                    editBT.classList.add("d-none");

                    let cells = row.querySelectorAll(`td[data-stateid=${targetKey}]`)
                    HTMLUtilityTools.setAttribute("contenteditable", true, cells);
                }

                saveBt.onclick = async (e) => {
                    let targetKey = e.currentTarget.getAttribute("data-stateid");
                    editBT.classList.remove("d-none");
                    saveBt.classList.add("d-none");
                    cancelBt.classList.add("d-none");
                    let cells = row.querySelectorAll(`td[data-stateid=${targetKey}]`)
                    HTMLUtilityTools.removeAttribute("contenteditable", cells)
                    let newValue = cells[0].innerText;
                    source.initialState[targetKey] = newValue;
                    await this.delegates.onChange();
                }

                cancelBt.onclick = async (e) => {
                    let targetKey = e.currentTarget.getAttribute("data-stateid");
                    editBT.classList.remove("d-none");
                    saveBt.classList.add("d-none");
                    cancelBt.classList.add("d-none");
                    let cells = row.querySelectorAll(`td[data-stateid=${targetKey}]`);
                    HTMLUtilityTools.removeAttribute("contenteditable", cells);
                    cells[0].innerText = source.initialState[targetKey];
                }
            });
        }

    }

    populateSceneSelector(selector, source) {

        if (source.scenes) {
            selector.innerHTML = ""
            HTMLSelectorTools.addOptionsTo(selector, Object.keys(source.scenes));
        }

        let option = document.createElement("option");
        option.text = "Select starting game scene";
        option.selected = "selected";
        option.disabled = "disabled";
        selector.add(option);

        if (source.start) {
            selector.value = source.start;
        }


    }
}