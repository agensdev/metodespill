import d from './debug.mjs';
import ErrorMessages from './l8n.mjs'
import { copy, merge, validateConditions, animateCSS } from './util.mjs'
import Badges from './badges.mjs'
import { Profile } from './profile.mjs'

export default class Game {
    constructor(gameID, container, presetState) {

        if (Game._instance) {
            throw new Error("Singleton classes can't be instantiated more than once.")
        }
        Game._instance = this;

        this.gameID = gameID;
        this.sourceCode = null;
        this.container = container;

        this.state = presetState || null;
        this.scenes = null;
        this.currentSceneId = null;
        this.currentSceneData = null;
        this.currentSceneUI = null;

        this.overlay = null;

        this.badges = null;

        this.player = Profile.storedProfile()

    }

    reset(gameID, container, presetState) {
        this.gameID = gameID;
        this.sourceCode = null;
        this.container = container;
        this.state = presetState || null;
        this.scenes = null;
        this.currentSceneId = null;
        this.currentSceneData = null;
        this.currentSceneUI = null;
        this.overlay = null;
        this.badges = null;
    }

    run() {
        d("Run game")

        if (this.sourceCode.initialState == null || this.sourceCode.initialState == undefined) {
            this.sourceCode.initialState = {}
        }

        this.state = this.state ? merge(copy(this.sourceCode.initialState), this.state) : copy(this.sourceCode.initialState);
        this.scenes = copy(this.sourceCode.scenes);
        this.badges = new Badges(this.sourceCode.badges)

        this.badges.addPreviouslyEarndBadges(this.player.badges);

        this.overlay = document.body.querySelector(".exp");
        this.overlay.addEventListener("click", e => {
            d("Remove modal")
            this.overlay.classList.remove("clickable")
            animateCSS(this.overlay.firstChild, "fadeOutDownBig").then(evt => {
                this.overlay.removeChild(this.overlay.firstChild);
                // Hvorfor virker ikke this.currentSceneUI her?
                window.document.querySelector(".footer").classList.remove("disabled");
            });
        })

        this.loadScene(this.sourceCode.start, this.scenes)
    }

    loadScene(sceneId, scenes) {
        d("Load Scene");
        this.sceneId = sceneId;
        this.currentSceneData = this.findScene(sceneId, this.scenes);

        let sceneIsReset = false;
        //if (!this.currentSceneUI || this.currentSceneData.clearSceneHistory) {
        d("Reset scene flow")
        sceneIsReset = true;
        this.clearScene();
        this.currentSceneUI = document.querySelector("#sceneTemplate").content.cloneNode(true);
        this.container.appendChild(this.currentSceneUI);
        this.currentSceneUI = this.container.querySelector("#holder");
        /*} else {
            d("Add scene flow")
            this.disableAllButtonsIn(this.currentSceneUI.querySelector(".content"));
        }*/

        if (this.currentSceneData) {
            d("construct scene")
            this.addBookmark(this.sceneId, this.currentSceneUI.querySelector(".content"));

            this.applyStatChanges(this.currentSceneData.statechange);
            this.applyHeaderImage(this.currentSceneData.headerImage, this.currentSceneUI);
            this.applyHeader(this.currentSceneData.header, this.currentSceneUI);
            this.applyContent(this.currentSceneData.content, this.currentSceneUI);
            this.applyActions(this.currentSceneData.actions, this.currentSceneUI);
            this.applyAuxiliaryContent(this.currentSceneData.auxiliaryContent, this.currentSceneUI)

            let newBadges = this.badges.findNewlyEarndBadges(this.state);
            if (newBadges.length > 0) {

                let overlay = document.getElementById("overlay");

                newBadges.forEach(badge => {
                    let display = document.createElement("img");
                    display.src = badge.img;
                    overlay.appendChild(display);
                    this.player.badges.push(badge);

                });

                this.player.save()
                overlay.classList.remove("hidden")

                overlay.onclick = () => {
                    overlay.classList.add("hidden")
                    overlay.innerHTML = "";
                }

            }

        } else {
            //TODO : skall vi ha falback for feil. ?
        }


    }


    addBookmark(bookmarkID, container) {
        const bookmark = document.createElement("a");
        bookmark.href = `#${bookmarkID}`
        container.appendChild(bookmark);
    }

    disableAllButtonsIn(container) {
        const buttons = container.querySelector("button");
        buttons.forEach(bt => {
            bt.setAttribute("disabled", "true")
        });
    }

    applyAuxiliaryContent(contnet, container) {
        const footer = container.querySelector(".footer");
        if (contnet && contnet.peek) {
            const node = document.querySelector("#peekTemplate").content.cloneNode(true);
            const img = node.querySelector("img");
            img.src = contnet.peek.img;
            const msg = node.querySelector("#peekMessage")
            msg.innerText = this.parsText(contnet.peek.text);
            footer.appendChild(node)

            footer.addEventListener("click", (e) => {
                footer.classList.add("disabled")
                this.displayAuxiliaryContent(this.currentSceneData.auxiliaryContent.content)
            })
        }
    }

    displayAuxiliaryContent(content) {
        d("Display modal")
        const container = document.body.querySelector(".exp");
        const modal = document.createElement("div");
        modal.classList.add("modal");
        const div = document.createElement("div");
        div.classList.add("content");
        modal.appendChild(div);


        this.applyContent(content, modal)

        container.appendChild(modal);
        animateCSS(modal, "fadeInUpBig").then(e => {
            container.classList.add("clickable");
        })
    }

    applyHeaderImage(headerImage, container) {
        let header = container.querySelector("header");
        if (headerImage) {
            header.style.backgroundImage = `url(${headerImage.src})`;
            header.classList.add("headerWithBgImage");
        } else {
            header.classList.remove("headerWithBgImage");
            header.style.backgroundImage = ""
        }
    }

    applyHeader(content, container) {
        let header = container.querySelector("header > #headerContent");
        if (content && content.length > 0) {
            content.forEach(node => {
                let p = this.createTextNode(node.text);
                header.appendChild(p);
            });
        } else {
            header.style.visibility = "hidden";
        }
    }

    applyContent(content, container) {
        if (content) {
            let contentUI = container.querySelector(".content")
            content.forEach(element => {
                if (validateConditions(element.conditions, this.state)) {
                    let node = this.createContentNode(element);
                    if (node) {
                        node = contentUI.appendChild(node);

                        /* if (element.type === "dialogue") {
                              if (element.aling === "left") {
                                  animateCSS(node, "bounceInLeft");
                              } else {
                                  animateCSS(node, "bounceInRight");
                              }
                          }*/

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
                    bt.onclick = e => {
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
                        d(`No such state opperation ${change.type}`)

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
            case "shout": node = this.createShoutNode(description.text);
                break;
            case "shout": node = this.createTextNode(description.text);
                break;
            case "link": node = this.createLinkNode(description);
                break;
            case "img": node = this.createImageNode(description);
                break;
            case "video": node = this.createVideoNode(description);
                break;
            default: d(`Typen ${description.type} is not a recognized type`);
        }
        return node;
    }

    createMonologNode(description) {

        let node = document.querySelector("#monologTemplate").content.cloneNode(true);
        let portrait = node.querySelector(".portrait");
        portrait.src = this.parsText(description.img);

        let name = node.querySelector(".actorName");
        name.innerText = this.parsText(description.name);


        let monolog = node.querySelector(".monologContent");
        let p = this.createTextNode(description.text);
        monolog.appendChild(p);

        return node;
    }

    createDialogueNode(description) {

        const node = document.querySelector("#dialogueTemplate").content.cloneNode(true);
        const header = node.querySelector("header");

        const aling = description.layout || "right";
        header.classList.add(aling);

        if (aling === "left") {
            node.querySelector(".dialogue").classList.add("dialogueLeft");
        }

        const portrait = node.querySelector(".portrait");
        portrait.src = this.parsText(description.img);

        const name = node.querySelector("#actorName");
        name.innerText = this.parsText(description.name);


        const dioalouge = node.querySelector(".dialogueContent");
        const p = this.createTextNode(description.text);
        dioalouge.appendChild(p);

        return node;
    }

    createVideoNode(description) {
        let a = document.createElement("a");
        a.src = "#";
        a.innerText = description.alt;
        a.classList.add("videoLink")
        a.onclick = () => {
            let overlay = document.getElementById("overlay");
            overlay.innerHTML = ""
            let frame = document.createElement("iframe");
            overlay.appendChild(frame);
            frame.setAttribute("src", `https://www.youtube.com/embed/${description.src}`)
            overlay.classList.remove("hidden")

            overlay.onclick = () => {
                overlay.classList.add("hidden")
                overlay.innerHTML = "";
            }
        }
        return a;
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
        a.innerText = this.parsText(description.text)
        return a;
    }

    createTextNode(text) {
        let p = document.createElement("p");
        p.innerHTML = this.parsText(text);
        return p;
    }

    createShoutNode(text) {
        let h = document.createElement("h1");
        h.innerHTML = this.parsText(text);
        return h;
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

    testGame(gameName, source, container, state) {
        this.reset(gameName, container, state);
        this.sourceCode = JSON.parse(source);
        this.run()
    }

    findScene(sceneId, scenes) {
        let scene = Object.entries(scenes).find(item => item[0] == sceneId)
        return scene ? scene[1] : null;
    }
}

