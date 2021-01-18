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


    static async loadAndEmbedTemplate(templateURL) {
        let source = await fetch(templateURL);
        source = await source.text();
        let container = document.createElement("div");
        container.innerHTML = source
        let template = container.firstElementChild;
        document.body.appendChild(template);
    }

    static createInstanceOfTemplate(templateId, optionalUniqueId) {
        let template = document.querySelector(`#${templateId}`).content;
        if (optionalUniqueId) {
            template.firstElementChild.id = optionalUniqueId;
        }
        return template.cloneNode(true);
    }

    static setAttribute(attribute, value, targets) {
        targets.forEach(item => {
            item.setAttribute(attribute, value)
        });
    }

    static removeAttribute(attribute, targets) {
        targets.forEach(item => {
            item.removeAttribute(attribute)
        });
    }

    static hide(targets) {
        targets.forEach(item => {
            item.classList.add("d-none");
        })
    }


    static show(targets) {
        targets.forEach(item => {
            item.classList.remove("d-none");
        })
    }


}


export { HTMLSelectorTools, HTMLUtilityTools }