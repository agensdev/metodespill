import d from './debug.mjs';
import ErrorMessages from './l8n.mjs'
import { copy, merge, validateConditions } from './util.mjs'
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
        this.currentSceneUI = document.querySelector("#sceneTemplate").content.cloneNode(true);
        this.currentSceneData = this.findScene(sceneId, this.scenes);

        if (this.currentSceneData) {
            this.applyStatChanges(this.currentSceneData.statechange)
            this.applyHeaderImage(this.currentSceneData.headerImage)
            this.applyHeader(this.currentSceneData.header)
            this.applyContent(this.currentSceneData.content);
            this.applyActions(this.currentSceneData.actions);

            let newBadges = this.badges.findNewlyEarndBadges(this.state);
            if (newBadges.length > 0) {
                d(newBadges);
            }

        } else {
            //TODO : skall vi ha falback for feil. ?
        }

        this.container.appendChild(this.currentSceneUI);

    }

    applyHeaderImage(headerImage) {
        if (headerImage) {
            let img = this.currentSceneUI.querySelector("img");
            img.src = headerImage.src;
            img.alt = headerImage.alt;
        }
    }

    applyHeader(content) {
        let header = this.currentSceneUI.querySelector("header");
        if (content.header) {
            content.header.forEach(node => {
                let p = this.createTextNode(content.header);
                header.appendChild(p);
            });
        } else {
            //Hide ?
        }
    }

    applyContent(content) {
        if (content) {
            let contentUI = this.currentSceneUI.querySelector(".content")
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

    applyActions(actions) {
        if (actions) {
            let actionsUI = this.currentSceneUI.querySelector(".actions");
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
            case "dialogue": node = this.createDialogueNode(description)
                break;
            case "text": node = this.createTextNode(description)
                break;
            case "link": node = this.createLinkNode(description)
                break;
            case "img": node = this.createImageNode(description)
                break;
            default: d(`Typen ${description.type} is not a recognized type`);
        }
        return node;
    }

    createDialogueNode(description) {

        let node = document.querySelector("dialogueTemplate").cloneNode(true);
        let portrait = node.querySelector("npcPortrait");
        portrait.src = description.portrait;

        let name = node.querySelector("#actorName");
        name.innerText = description.npcName;


        let dioalouge = node.querySelector(".dialogue");
        let p = createTextNode(description);
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

    createTextNode(description) {
        let p = document.createElement("p");
        p.innerText = this.parsText(description.text);
        return p;
    }

    parsText(text) {
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

