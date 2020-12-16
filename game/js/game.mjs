import d from './debug.mjs';
import ErrorMessages from './l8n.mjs'
import { copy, merge, validateConditions, animateCSS } from './util.mjs'
import Badges from './badges.mjs'

export default class Game {
    constructor(gameID, container, presetState) {
        this.gameID = gameID;
        this.sourceCode = null;
        this.container = container;

        this.state = presetState || null;
        this.scenes = null;
        this.currentSceneId = null;
        this.currentSceneData = null;
        this.currentSceneUI = null;

        this.badges = null;
    }

    run() {
        this.state = this.state ? merge(copy(this.sourceCode.initialState), this.state) : copy(this.sourceCode.initialState);
        this.scenes = copy(this.sourceCode.scenes);
        this.badges = new Badges(this.sourceCode.badges)
        this.loadScene(this.sourceCode.start, this.scenes)
    }

    loadScene(sceneId, scenes) {
        this.clearScene();
        this.sceneId = sceneId;
        this.currentSceneData = this.findScene(sceneId, this.scenes);

        let sceneIsReset = false;
        if (!this.currentSceneUI || this.currentSceneData.clearSceneHistory) {
            sceneIsReset = true;
            this.currentSceneUI = document.querySelector("#sceneTemplate").content.cloneNode(true);
        }

        if (this.currentSceneData) {
            this.applyStatChanges(this.currentSceneData.statechange);
            this.applyHeaderImage(this.currentSceneData.headerImage, this.currentSceneUI);
            this.applyHeader(this.currentSceneData.header, this.currentSceneUI);
            this.applyContent(this.currentSceneData.content, this.currentSceneUI);
            this.applyActions(this.currentSceneData.actions, this.currentSceneUI);

            this.applyAuxiliaryContent(this.currentSceneData.auxiliaryContent, this.currentSceneUI)

            let newBadges = this.badges.findNewlyEarndBadges(this.state);
            if (newBadges.length > 0) {
                d(newBadges);
            }

        } else {
            //TODO : skall vi ha falback for feil. ?
        }

        if (sceneIsReset) {
            this.container.appendChild(this.currentSceneUI);
        }
    }

    disableAllButtonsIn() {

    }

    applyAuxiliaryContent(contnet, container) {
        const footer = container.querySelector(".footer");
        if (contnet) {
            const node = document.querySelector("#peekTemplate").content.cloneNode(true);
            const img = node.querySelector("img");
            img.src = contnet.peek.img;
            const msg = node.querySelector("#peekMessage")
            msg.innerText = this.parsText(contnet.peek.text);
            footer.appendChild(node)

            footer.addEventListener("click", () => {
                this.displayAuxiliaryContent(this.currentSceneData.auxiliaryContent, this.currentSceneUI)
            })
        }
    }

    displayAuxiliaryContent(content, container) {

        const modal = document.createElement("div");
        modal.style.setProperty('--animate-duration', '2s');
        modal.classList.add("modal", "animate__animated");




        document.body.querySelector(".wrapper").prepend(modal)
        modal.classList.add("animate__fadeInUpBig");
    }

    applyHeaderImage(headerImage, container) {
        let header = container.querySelector("header");
        if (headerImage) {
            header.style.backgroundImage = `url(images/${headerImage.src})`;
            header.classList.add("headerWithBgImage");
        } else {
            header.classList.remove("headerWithBgImage");
            header.style.backgroundImage = ""
        }
    }

    applyHeader(content, container) {
        let header = container.querySelector("header > #headerContent");
        if (content) {
            content.forEach(node => {
                let p = this.createTextNode(node.text);
                header.appendChild(p);
            });
        } else {
            //Hide ?
        }
    }

    applyContent(content, container) {
        if (content) {
            let contentUI = container.querySelector(".content")
            content.forEach(element => {
                if (validateConditions(element.conditions, this.state)) {
                    let node = this.createContentNode(element);
                    if (node) {
                        contentUI.appendChild(node);
                    }
                }
            });
        }
    }

    applyActions(actions, container) {
        if (actions) {
            let actionsUI = container.querySelector(".actions");
            actions.forEach(action => {
                if (validateConditions(action.conditions, this.state)) {
                    let bt = document.createElement("button");
                    bt.innerText = this.parsText(action.description);
                    bt.title = action.title;
                    bt.onclick = (e) => {
                        if (action.statechange) {
                            this.applyStatChanges(action.statechange);
                        }
                        this.loadScene(action.target || this.sceneId, this.scenes);
                    };

                    actionsUI.appendChild(bt);
                }
            });
        }
    }

    applyStatChanges(changes) {
        if (changes) {
            changes.forEach(change => {
                switch (change.type) {
                    case "set": this.state[change.target] = change.value;
                        break;

                    case "dec": this.state[change.target] = (this.state[change.target] || 0) - change.value;
                        break;

                    case "inc": this.state[change.target] = (this.state[change.target] || 0) + change.value;
                        break;


                    case "apend": this.state[change.target] = (this.state[change.target] || "") + change.value;
                        break;

                    case "remove": this.state[change.target] = (this.state[change.target] || 0).replace(change.value, "");
                        break;

                    default:
                        d("No such state opperation ${}")

                }
            })
        }
    }

    createContentNode(description) {
        let node = null;
        switch (description.type) {
            case "monolog": node = this.createMonologNode(description);
                break;
            case "dialogue": node = this.createDialogueNode(description);
                break;
            case "text": node = this.createTextNode(description.text);
                break;
            case "link": node = this.createLinkNode(description);
                break;
            case "img": node = this.createImageNode(description);
                break;
            default: d(`Typen ${description.type} is not a recognized type`);
        }
        return node;
    }

    createMonologNode(description) {

        let node = document.querySelector("#monologTemplate").content.cloneNode(true);
        let portrait = node.querySelector(".npcPortrait");
        portrait.src = description.img;

        let name = node.querySelector(".actorName");
        name.innerText = description.npcName;


        let monolog = node.querySelector(".monologContent");
        let p = this.createTextNode(description.text);
        monolog.appendChild(p);

        return node;
    }

    createDialogueNode(description) {

        let node = document.querySelector("#dialogueTemplate").content.cloneNode(true);
        let portrait = node.querySelector("npcPortrait");
        portrait.src = description.img;

        let name = node.querySelector("#actorName");
        name.innerText = description.npcName;


        let dioalouge = node.querySelector(".dialogue");
        let p = createTextNode(description.text);
        dioalouge.appendChild(p);

        return node;
    }

    createImageNode(description) {
        let img = document.createElement("img");
        img.src = description.src;
        img.alt = description.alt;
        img.innerText = description.alt;
        return img;
    }

    createLinkNode(description) {
        let a = document.createElement("a");
        a.href = this.parsText(description.url);
        a.target = "_blank";
        return a;
    }

    createTextNode(text) {
        let p = document.createElement("p");
        p.innerHTML = this.parsText(text);
        return p;
    }

    parsText(text) {
        if (text) {
            const stateKeys = /{\$\S+}/gm;
            let matches = text.match(stateKeys);
            if (matches) {
                matches.forEach(match => {
                    let key = match.replace(/[{,\$,}]/g, "").trim();
                    let stateValue = this.state[key];
                    text = text.replace(match, stateValue);
                });
            }
            return text;
        }
        return '';
    }

    clearScene() {
        this.container.innerHTML = ""
    }

    async load() {
        let response = await fetch(`games/${this.gameID}.json`);
        if (response.status < 400) {
            try {
                this.sourceCode = await response.json();
            } catch (err) {
                throw ErrorMessages.no.errror_broken_game;
            }
        } else {
            throw ErrorMessages.no.error_no_such_game;
        }
    }

    findScene(sceneId, scenes) {
        let scene = Object.entries(scenes).find(item => item[0] == sceneId)
        return scene ? scene[1] : null;
    }
}

