import { HTMLUtilityTools } from './uiExt.js'
import { Storage } from './util.mjs'

const PROFILE_KEY = "player.profile.storage.key"


class Profile {

    constructor(profile) {

        this.name = profile.name || null;
        this.avatar = profile.avatar || null;
        this.badges = profile.badges || [];

        this.save();
    }

    async show(container) {
        const view = HTMLUtilityTools.createInstanceOfTemplate("playerProfile");
        container.appendChild(view);

        let avatar = document.getElementById("playerAvatar")

        let name = document.getElementById("playerName")
        name.innerText = this.name;

        let badges = document.getElementById("badgesListing")

        this.badges.forEach(badge => {
            const img = document.createElement("img");
            img.src = badge.img;
            img.alt = badge.name;
            img.classList.add("badge")
            badges.appendChild(img);
        });

        return new Promise((res, reject) => {
            const bt = document.getElementById("continueBt");
            bt.addEventListener("click", () => {
                console.log("Exiting profile view")
                res(this)
            }, { once: true })
        });
    }

    save() {
        Storage.save(PROFILE_KEY, JSON.stringify({ name: this.name, avatar: this.avatar, badges: this.badges }));
    }

    static storedProfile() {
        let profile = JSON.parse(Storage.retrive(PROFILE_KEY));
        if (profile) {
            return new Profile(profile);
        }
        return null;
    }

}



class ProfileBuilder {

    constructor(container) {
        this.container = container;
        this.view = HTMLUtilityTools.createInstanceOfTemplate("createPlayerProfile");
        container.appendChild(this.view);
    }

    async queryProfile() {
        return new Promise((res, reject) => {
            const profile = JSON.parse(Storage.retrive(PROFILE_KEY))

            if (profile) {
                res(profile);
            } else {
                const bt = document.getElementById("saveProfileBt");
                bt.addEventListener("click", () => {
                    let name = document.getElementById("profileName").value
                    let avatar = document.getElementById("profileAvatar").value
                    const p = { name: name, avatar: avatar, badges: [] }
                    res(p)
                }, { once: true })
            }

        });
    }
}


export { ProfileBuilder, Profile }