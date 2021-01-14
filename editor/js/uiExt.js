class HTMLSelectorTools {

    static addOptionsTo(select, options) {
        options.forEach(sceneName => {
            let item = document.createElement("option");
            item.value = sceneName;
            item.text = sceneName;
            select.add(item)
        })
    }

}

class HTMLUtilityTools {

    static createInstanceOfTemplate(templateId) {
        return document.querySelector(`#${templateId}`).content.cloneNode(true);
    }

}

export { HTMLSelectorTools, HTMLUtilityTools }