import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'
import { readLocalBinaryFile, saveToLocalCache, getFromLocalCache } from '../utils.js'
import Suggestion from '../suggestion.js'

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
        this.view = document.getElementById(this.sectionID);

        this.setup()

    }

    setup() {
        this.setupDisplaySource(this.title, this.source);
        this.setupTitleEdit(this.source);
        this.setupHeaderEdit();
        this.setupContentEdit();
        this.setupActionsEdit();
        this.setupStateEdit();
        this.setupAuxEdit();
        this.setupDelete()
    }

    setupDelete() {
        let deleteBT = this.view.querySelector("button[data-role=deleteSection]");
        deleteBT.onclick = async () => {
            delete this.source.scenes[this.title];
            this.view.parentNode.removeChild(this.view);
            await this.delegates.onChange();
        }
    }

    setupAuxEdit() {
        let scene = this.source.scenes[this.title]
        const contentView = this.view.querySelector("textarea[data-role=sceneExtended]");

        let addExtended = this.view.querySelector("button[data-role=extended]");
        let addContent = this.view.querySelector("button[data-role=extendedContent]");
        let addContentVideo = this.view.querySelector("button[data-role=extendedContentVideo]");

        const structures = {
            extended: {
                "peek": {
                    "img": "images/xxxxxx.xxx",
                    "name": "xxxxx xxxx xx",
                    "text": "xxxx xxx xxxxxx xxxx xxx xxx "
                },
                "content": [

                ]
            },
            monolog: {
                type: "monolog",
                layout: "right",
                img: "images/xxxxxx.xxx",
                name: "xxxxx xxxxx"
            },
            dialogue: {
                "type": "dialogue",
                "layout": "left x||x right",
                "img": "images/xxxxx.xxx",
                "name": "xxxxxx xxxx",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            text: {
                "type": "text",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            shout: {
                "type": "shout",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            link: {
                "type": "link",
                "url": "https://xxxxxxx.xx/xxxx",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            image: {
                "type": "img",
                "src": "images/xxxxxx.xxx",
                "alt": "xxxxxxx xxxxx xxxx xxxxx"
            },
            video: {
                "type": "video",
                "src": "xxxx Embed Code xxxx",
                "alt": "xxxxxxx xxxxx xxxx xxxxx"
            }
        };

        addExtended.onclick = async e => {
            try {
                scene.auxiliaryContent = JSON.parse(JSON.stringify(structures.extended))
                contentView.value = JSON.stringify(scene.auxiliaryContent, null, 3);
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Extension contains errors that must be fixed before adding new content");
            }
        }

        addContent.onclick = async e => {
            try {
                let current = JSON.parse(contentView.value)
                if (current.content == null || current.content == undefined) {
                    current.content = [];
                }
                current.content.push(JSON.parse(JSON.stringify(structures.dialogue)));
                scene.auxiliaryContent = current;
                contentView.value = JSON.stringify(scene.auxiliaryContent, null, 3);
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Extension contains errors that must be fixed before adding new content");
            }
        }

        addContentVideo.onclick = async e => {
            try {
                let current = JSON.parse(contentView.value)
                if (current.content == null || current.content == undefined) {
                    current.content = [];
                }
                current.content.push(JSON.parse(JSON.stringify(structures.video)));
                scene.auxiliaryContent = current;
                contentView.value = JSON.stringify(scene.auxiliaryContent, null, 3);
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Extension contains errors that must be fixed before adding new content");
            }
        }


        if (scene.auxiliaryContent) {
            contentView.value = JSON.stringify(scene.auxiliaryContent, null, 3);
        } else {
            contentView.value = ""
        }

        contentView.onchange = async e => {
            try {
                scene.auxiliaryContent = JSON.parse(contentView.value)
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Extension contains errors that must be fixed before continuing");
            }
        }

    }



    setupStateEdit() {
        let scene = this.source.scenes[this.title]
        const contentView = this.view.querySelector("textarea[data-role=sceneStateChanges]");

        let addStatebt = this.view.querySelector("button[data-role=state]");

        addStatebt.onclick = async e => {
            try {
                let state = await this.delegates.onAddNewState();
                if (scene.statechange == null || scene.statechange == undefined) {
                    scene.statechange = [];
                }
                scene.statechange.push({ type: state.type, target: state.key, value: state.value })
                contentView.value = JSON.stringify(scene.statechange, null, 3);
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Actions contains errors that must be fixed before adding new content");
            }
        }



        if (scene.statechange && scene.statechange.length > 0) {
            contentView.value = JSON.stringify(scene.statechange, null, 3);
        } else {
            contentView.value = ""
        }

        contentView.onchange = async e => {
            try {
                scene.statechange = JSON.parse(contentView.value)
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Actions contains errors that must be fixed before continuing");
            }
        }

    }


    setupActionsEdit() {
        let scene = this.source.scenes[this.title]
        const contentView = this.view.querySelector("textarea[data-role=sceneActions]");

        let addActionbt = this.view.querySelector("button[data-role=action]");

        const structures = {
            action: {
                "type": "button",
                "title": "xxxx",
                "description": "xxx xxxxxx xxxxx xxxxx xxx",
                "target": "xxxxxxxxxx",
                "statechange": []
            }
        };

        [addActionbt].forEach(bt => {
            bt.onclick = async e => {
                try {
                    let currentScene = contentView.value ? JSON.parse(contentView.value) : [];
                    let key = e.currentTarget.getAttribute("data-role");
                    let newStruct = { ...structures[key] }
                    currentScene.push(newStruct);
                    contentView.value = JSON.stringify(currentScene, null, 3);
                    scene.actions = [...currentScene]
                    await this.delegates.onChange();
                } catch (error) {
                    console.log(error);
                    ///TODO: Bedre tilbake melding om hva feilen er
                    this.delegates.onError("Actions contains errors that must be fixed before adding new content");
                }
            }
        });


        if (scene.actions && scene.actions.length > 0) {
            contentView.value = JSON.stringify(scene.actions, null, 3);
        } else {
            contentView.value = ""
        }

        contentView.onchange = async e => {
            try {
                scene.actions = JSON.parse(contentView.value)
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Actions contains errors that must be fixed before continuing");
            }
        }

    }


    setupContentEdit() {
        let scene = this.source.scenes[this.title]
        const contentView = this.view.querySelector("textarea[data-role=sceneContent]");

        let addMonologbt = this.view.querySelector("button[data-role=monolog]");
        let addDialoguebt = this.view.querySelector("button[data-role=dialogue]");
        let addTextbt = this.view.querySelector("button[data-role=text]");
        let addShoutbt = this.view.querySelector("button[data-role=shout]");
        let addLinkbt = this.view.querySelector("button[data-role=link]");
        let addImagebt = this.view.querySelector("button[data-role=image]");
        let addVideobt = this.view.querySelector("button[data-role=video]");

        const structures = {
            monolog: {
                type: "monolog",
                layout: "right",
                img: "images/xxxxxx.xxx",
                name: "xxxxx xxxxx"
            },
            dialogue: {
                "type": "dialogue",
                "layout": "left x||x right",
                "img": "images/xxxxx.xxx",
                "name": "xxxxxx xxxx",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            text: {
                "type": "text",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            shout: {
                "type": "shout",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            link: {
                "type": "link",
                "url": "https://xxxxxxx.xx/xxxx",
                "text": "xxxxxxx xxxxx xxxx xxxxx"
            },
            image: {
                "type": "img",
                "src": "images/xxxxxx.xxx",
                "alt": "xxxxxxx xxxxx xxxx xxxxx"
            },
            video: {
                "type": "video",
                "src": "xxxx Embed Code xxxx",
                "alt": "xxxxxxx xxxxx xxxx xxxxx"
            }
        };

        [addMonologbt, addDialoguebt, addTextbt, addShoutbt, addLinkbt, addImagebt, addVideobt].forEach(bt => {
            bt.onclick = async e => {
                try {
                    let currentScene = contentView.value ? JSON.parse(contentView.value) : [];
                    let key = e.currentTarget.getAttribute("data-role");
                    let newStruct = { ...structures[key] }
                    currentScene.push(newStruct);
                    contentView.value = JSON.stringify(currentScene, null, 3);
                    scene.content = [...currentScene]
                    await this.delegates.onChange();
                } catch (error) {
                    console.log(error);
                    ///TODO: Bedre tilbake melding om hva feilen er
                    this.delegates.onError("Scene contains errors that must be fixed before adding new content");
                }
            }
        });


        if (scene.content && scene.content.length > 0) {
            contentView.value = JSON.stringify(scene.content, null, 3);
        } else {
            contentView.value = ""
        }

        contentView.onchange = async e => {
            try {
                scene.content = JSON.parse(contentView.value)
                await this.delegates.onChange();
            } catch (error) {
                console.log(error);
                ///TODO: Bedre tilbake melding om hva feilen er
                this.delegates.onError("Scene contains errors that must be fixed before continuing");
            }
        }

    }

    setupHeaderEdit() {

        let scene = this.source.scenes[this.title]
        const imagePicker = this.view.querySelector("#header-image-selector");
        const description = this.view.querySelector("input[data-role=header-text]");
        const imageDisplay = this.view.querySelector("img[data-role=image-display]");

        description.onchange = async (e) => {
            scene.header = [{
                "type": "text",
                "text": description.value
            }]
            await this.delegates.onChange();
        }

        if (scene.header && scene.header.length > 0) {
            description.value = scene.header[0].text;
        }

        imagePicker.setAttribute("list", Suggestion.IMAGES);
        imagePicker.onchange = async (e) => {
            scene.headerImage = scene.headerImage || {};
            scene.headerImage.src = imagePicker.value
            scene.headerImage.alt = "decorative header" ///TODO: UI for å sette alt tekst.
            await this.delegates.onChange();
        }

        /*imagePicker.onchange = async (e) => {
            const file = e.target.files[0];
            try {
                const image = await readLocalBinaryFile(file);
                imageDisplay.src = URL.createObjectURL(file);
                imageDisplay.classList.remove("d-none");
                saveToLocalCache(file.name, image, true);

                scene.headerImage = scene.headerImage || {};
                scene.headerImage.src = `images/${file.name}`
                scene.headerImage.alt = "decorative header" ///TODO: UI for å sette alt tekst.

                await this.delegates.onChange();
            } catch (error) {
                console.error(error);
                this.delegates.onError("Could not load image");
            }
        }

        try {
            if (scene.headerImage && scene.headerImage.src) {
                let key = this.source.scenes[this.title].headerImage.src.replaceAll("images/", "");
                console.log(key)
                getFromLocalCache(key, true).then(image => {
                    if (image) {
                        imageDisplay.classList.remove("d-none");
                        imageDisplay.setAttribute("src", image)
                    }
                });
            }
        } catch (error) {
            console.log(error)
        }*/



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

                this.source.scenes[this.title] = JSON.parse(sourceCodeView.innerText, null, 3); ///TODO: valider at json parse er vellyket.
                halfmoon.toggleModal('source-view');
                await this.delegates.onChange();
                this.setup();
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