import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'

export default class BaseGameInfoView {
    constructor(source, container, delegates) {
        this.view = HTMLUtilityTools.createInstanceOfTemplate("basicGameInfoTemplate");
        container.appendChild(this.view);

        this.delegates = delegates
        this.gameNameView = document.getElementById("gameNameTxt");
        this.gameDescription = document.getElementById("gameDescriptionTxt");
        this.sceneSelection = document.getElementById("startScene");
        this.initialStateDisplay = document.getElementById("initialGameStates");
        this.addStateBt = document.getElementById("addNewInitialStateBt");

        this.gameNameView.value = source.gameName || "";
        this.gameDescription.value = source.description || "";

        this.populateSceneSelector(this.sceneSelection, source)

        this.gameNameView.onchange = () => { source.gameName = this.gameNameView.value; }
        this.gameDescription.onchange = () => { source.description = this.gameDescription.value; }
        this.sceneSelection.onchange = () => { source.start = this.sceneSelection.value; }

        this.addStateBt.onclick = async () => {
            let state = await delegates.onAddNewState();
            source.initialState[state.key] = state.value;
            await delegates.onChange();
            this.populateState(this.initialStateDisplay, source)
        }

        this.populateState(this.initialStateDisplay, source);
    }

    populateState(tbl, source) {

        let tbody = tbl.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ""; ///TODO: Fiks dette, til å slette elementer riktig.

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

    populateSceneSelector(selector, source) {

        if (source.scenes) {
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