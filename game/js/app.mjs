
import Game from './game.mjs'
import d from './debug.mjs'


class Application {

    constructor() {
        this.game = null;
    }

    async loadGame(gameID, gamePresetState) {
        gameID ||= "default";
        this.game = new Game(gameID, container, gamePresetState)
        await this.game.load()
    }

    async registerServiceWorker() {
        const urlParams = new URLSearchParams(window.location.search);
        const reset = urlParams.get('resetPWA');

        if (reset) {
            d("Deliting PWA cache")
            caches.delete("metodeSpillPWA");
        }

        if ('serviceWorker' in navigator) {
            await navigator.serviceWorker.register('/js/sw.js').catch(err => console.log(err));
        }
    };
}

const app = new Application();
const container = document.createElement("div");
container.classList.add("wrapper");
document.body.appendChild(container)

window.onload = async () => {
    await app.registerServiceWorker()
    let name = "";
    while (name.length == 0) {
        name = window.prompt("Hva heter du?");
    }
    await app.loadGame(window.location.hash, { playerName: name });
    app.game.run();
}

