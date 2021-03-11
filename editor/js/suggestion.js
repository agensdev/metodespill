export default class Suggestion {

    static IMAGES = "uploaded.Images.Data.List"
    static SECTION = "created.Sections.Data.List"

    static addSuggestion(value, target) {
        let list = this.getListFor(target);
        if (list) {
            let option = document.createElement("option");
            option.innerText = value;
            list.appendChild(option)
        }
    }


    static getListFor(target) {
        let list = document.getElementById(target);
        if (list === null) {
            list = document.createElement("datalist");
            list.setAttribute("id", target);
            document.body.appendChild(list);
        }

        return list;
    }

}