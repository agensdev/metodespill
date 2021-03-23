
import Game from './game.mjs'
import { ProfileBuilder, Profile } from './profile.mjs'
import d from './debug.mjs'
import { copy, merge, validateConditions, animateCSS, Storage } from './util.mjs'
import { HTMLUtilityTools } from './uiExt.js'

class Application {

    constructor() {
        this.game = null;
        this.player = null;
    }

    async loadGame(gameID, gamePresetState) {
        gameID ||= "default";
        this.game = new Game(gameID, container, gamePresetState)
        await this.game.load()
    }

    async playerProfile() {
        let p = Profile.storedProfile()
        if (p === null) {
            let profileData = await (new ProfileBuilder(container)).queryProfile();
            p = new Profile(profileData)
        } else {
            await p.show(container);
        }
        this.player = p;
        return p;
    }

    testGame(source) {
        if (!this.game) {
            this.game = new Game("EditorGame", container, null)
        }
        this.game.testGame("EditorGame", source, container, null);
    }

    async registerServiceWorker() {
        const urlParams = new URLSearchParams(window.location.search);
        const reset = urlParams.get('resetPWA');

        if (reset) {
            d("Deliting PWA cache")
            caches.delete("metodeSpillPWA");
            Storage.clear()
        }

        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('./js/sw.js').catch(err => console.log(err));
        }
    };
}

const app = new Application();
const container = document.createElement("div");
container.classList.add("wrapper");
document.body.appendChild(container)

window.onload = async () => {
    await app.registerServiceWorker()

    try {
        await HTMLUtilityTools.loadAndEmbedTemplate("components/dialogue.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/monolog.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/peek.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/profile.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/scene.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/createProfile.html");
        await HTMLUtilityTools.loadAndEmbedTemplate("components/avatarselection.html");
    } catch (error) {
        console.error(error);
    }

    await app.playerProfile()
    await app.loadGame(window.location.hash, { playerName: app.player.name, playerAvatar: app.player.avatar });
    app.game.run();
}

window.addEventListener("message", async (event) => {
    let newGame = JSON.stringify(event.data);
    await app.playerProfile()
    d("Runing sync game")
    app.testGame(newGame);

}, false);

