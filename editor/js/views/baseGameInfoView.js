import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'

export default class BaseGameInfoView {
    constructor(source, container, delegates) {
        this.view = HTMLUtilityTools.createInstanceOfTemplate("basicGameInfoTemplate");
        container.appendChild(this.view);

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
        }

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