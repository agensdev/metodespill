import { HTMLUtilityTools, HTMLSelectorTools } from '../uiExt.js'

export default class BadgesView {
    constructor(source, container, delegates) {
        this.view = HTMLUtilityTools.createInstanceOfTemplate("badgesSectionTemplate");
        container.appendChild(this.view);
        this.delegates = delegates

    }
}