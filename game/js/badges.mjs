import { copy, validateConditions } from './util.mjs'

export default class BadgeManager {

    constructor(badges) {
        this.badges = badges;
        this.collected = []
    }

    findNewlyEarndBadges(state) {
        return this.badges.filter(badge => {
            let collect = false;
            if (!this.collected.find(c => badge.name == c.name)) {
                if (validateConditions(badge.conditions, state)) {
                    this.collected.push(copy(badge));
                    collect = true;
                }
            }
            return collect;;
        });
    }


}