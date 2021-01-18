import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'




export default class SectionView {

    static SECTION_TYPES = {
        MONOLOG: "monolog",
        DIALOGUE: "dialogue",
        SHOUT: "shout",
        LINK: "link",
        IMAGE: "img"
    }

    static sourceView = null

    constructor(title, source, container, delegates) {

        this.title = title;
        this.source = source;
        this.container = container;
        this.delegates = delegates
        this.sectionID = window.crypto.getRandomValues(new Uint8Array(10)).join("-");

        let template = HTMLUtilityTools.createInstanceOfTemplate("sectionViewTemplate", this.sectionID);
        const anchor = this.container.firstElementChild.nextSibling || this.container.firstElementChild;
        this.view = this.container.insertBefore(template, anchor)
        //this.view = this.container.appendChild(template);
        this.view = document.getElementById(this.sectionID); ///??? Uklart hvorfor jeg må gå via  this.view = document.getElementById(this.sectionID);

        this.setupTitleEdit(this.source)
        this.setupDisplaySource(this.title, this.source);


        let deleteBT = this.view.querySelector("button[data-role=deleteSection]");
        deleteBT.onclick = async () => {
            delete this.source.scenes[this.title];
            this.view.parentNode.removeChild(this.view);
            await this.delegates.onChange();
        }

        //this.clearHistorySwitch = document.getElementById("clearSceneHistorySwitch");

        /*
        this.headerImage = document.getElementById("headerImagePicker");
        this.headerType = "txt";
        this.headerText = document.getElementById("") */
    }

    setupDisplaySource(title, source) {

        if (SectionView.sourceView == null) {
            let template = HTMLUtilityTools.createInstanceOfTemplate("sourceEditModal",);
            SectionView.sourceView = document.body.appendChild(template);

            let addBt = document.querySelector("#saveSourcecodeChange");
            let cancelBt = document.querySelector("#cancelSourceCodeEdit");

            cancelBt.onclick = () => {
                halfmoon.toggleModal('source-view');
            }
            addBt.onclick = async () => {
                this.source.scenes[this.title] = JSON.parse(sourceCodeView.innerText); ///TODO: valider at json parse er vellyket.
                halfmoon.toggleModal('source-view');
                await this.delegates.onChange();
            }
        }

        let sourceCodeView = document.querySelector("#sourceCode")

        const soruceViewBT = this.view.querySelector("button[data-role=displaySource]");
        soruceViewBT.onclick = () => {
            sourceCodeView.innerText = JSON.stringify(source.scenes[this.title], null, "   ");
            halfmoon.toggleModal('source-view');
        }
    }

    setupTitleEdit(source) {

        let titleTxt = this.view.querySelector("#sectionName");
        const editBT = this.view.querySelector("button[data-role=edit]");
        const saveBT = this.view.querySelector("button[data-role=save]");
        const cancelBT = this.view.querySelector("button[data-role=cancel]");

        HTMLUtilityTools.setAttribute("data-target", "sectionName", [editBT, saveBT, cancelBT]);

        titleTxt.innerText = this.title;
        let orgTitle = this.title;

        editBT.onclick = (e) => {
            let targetId = e.currentTarget.getAttribute("data-target");
            let target = this.view.querySelector(`#${targetId}`);
            HTMLUtilityTools.show([saveBT, cancelBT]);
            HTMLUtilityTools.hide([editBT]);
            target.setAttribute("contenteditable", true)
        }

        saveBT.onclick = async (e) => {
            let targetId = e.currentTarget.getAttribute("data-target");
            let target = this.view.querySelector(`#${targetId}`);
            HTMLUtilityTools.hide([saveBT, cancelBT]);
            HTMLUtilityTools.show([editBT]);

            let newTitle = target.innerText.replaceAll(" ", "");
            if (newTitle !== orgTitle) {
                this.source.scenes[newTitle] = JSON.parse(JSON.stringify(source.scenes[orgTitle]));
                delete this.source.scenes[orgTitle];
                orgTitle = newTitle;
                this.title = newTitle;
                target.innerText = newTitle;
                await this.delegates.onChange();
            }

            target.removeAttribute("contenteditable")
        }

        cancelBT.onclick = (e) => {
            let targetId = e.currentTarget.getAttribute("data-target");
            let target = this.view.querySelector(`#${targetId}`);
            HTMLUtilityTools.hide([saveBT, cancelBT]);
            HTMLUtilityTools.show([editBT]);
            target.innerText = orgTitle;
            target.removeAttribute("contenteditable")
        }
    }



}