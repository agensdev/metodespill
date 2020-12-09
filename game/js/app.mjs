
import Game from './game.mjs'
import d from './debug.mjs'

class Application {

    constructor() {
        this.game = null;
    }

    async loadGame(gameID) {
        gameID ||= "default";
        this.game = new Game(gameID,container)
        await this.game.load()
    }

    async registerServiceWorker() {
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
    await app.loadGame(window.location.hash);
    app.game.run();
}

