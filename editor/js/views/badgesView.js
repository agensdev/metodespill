import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'

export default class BadgesView {
    constructor(source, container, delegates) {
        this.view = HTMLUtilityTools.createInstanceOfTemplate("badgesSectionTemplate");
        container.appendChild(this.view);
        this.delegates = delegates
        this.addBadgeButton = document.getElementById("addNewBadgeBt");
        this.badgesDisplay = document.getElementById("regBadges");

        this.addBadgeButton.onclick = async () => {
            let badge = await delegates.onAddNewBadge();
            if (source.badges == null || source.badges == undefined) {
                source.badges = [];
            }
            source.badges.push(badge)
            await delegates.onChange();
            this.populateBadges(this.badgesDisplay, source)
        }

    }


    populateBadges(tbl, source) {
        let tbody = tbl.getElementsByTagName("tbody")[0];
        tbody.innerHTML = ""; ///TODO: Fiks dette, til å slette elementer riktig.

        if (source.badges) {

            console.log(source.badges)

            source.badges.forEach(badge => {

                const row = tbody.insertRow();
                const titleCell = row.insertCell();
                const descriptionCell = row.insertCell();
                const rulesCell = row.insertCell();
                const imageCell = row.insertCell();
                imageCell.classList.add("text-right");

                titleCell.appendChild(document.createTextNode(badge.name))
                descriptionCell.appendChild(document.createTextNode(badge.description))

                const conditions = badge.conditions.reduce((acc, val, index, arr) => {

                    acc += val.target + " : " + val.value;
                    return acc;
                }, "");

                rulesCell.appendChild(document.createTextNode(conditions))

                imageCell.appendChild(document.createTextNode(badge.img));

            });


        }

    }
}