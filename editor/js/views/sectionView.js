export default class SectionView {

    static SECTION_TYPES = {
        MONOLOG: "monolog",
        DIALOGUE: "dialogue",
        SHOUT: "shout",
        LINK: "link",
        IMAGE: "img"
    }

    constructor(source, container, delegates) {

        this.delegates = delegates
        this.gameNameView = document.getElementById("sectionNameTxt");
        this.clearHistorySwitch = document.getElementById("clearSceneHistorySwitch");

        this.headerImage = document.getElementById("headerImagePicker");
        this.headerType = "txt";
        this.headerText = document.getElementById("")



    }

}