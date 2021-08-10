const Actions = {
    button: (action, context) => {
        let btn = document.createElement("button");
        btn.innerText = context.parseText(action.description);
        btn.title = action.title;
        btn.onclick = (e) => {
            if (action.statechange) {
                context.applyStateChanges(action.statechange);
            }
            this.loadScene(action.target || context.sceneId, context.scenes);
        };
        return btn;
    },
    numberInput: (action, context) => {
        const correctAnswer = action.answer;
        let form = document.createElement("form");
        let input = document.createElement("input");
        input.setAttribute("type", "number");
        input.setAttribute("placeholder", "Enter a number");
        input.classList.add("numberInput");

        let btn = document.createElement("button");

        btn.title = action.title;
        btn.innerText = context.parseText(action.description);
        btn.onclick = (e) => {
            if (action.statechange) {
                context.applyStateChanges(action.statechange);
            }

            const currentAnswer = Number(form.querySelector("input").value);

            console.log({ currentAnswer });

            const isCorrect =
                Number(correctAnswer) &&
                Number(correctAnswer) === currentAnswer;

            const nextScene =
                action.target && action.optionalTarget && isCorrect
                    ? action.target
                    : action.optionalTarget;

            context.loadScene(nextScene || context.sceneId, context.scenes);
        };

        form.appendChild(input);
        form.appendChild(btn);

        return form;
    },
    multipleChoice: (action, context) => {
        const correctAnswers = JSON.stringify(action.answers.sort());
        let form = document.createElement("form");

        form.classList.add("multipleChoice");

        action.choices.map((choice, idx) => {
            let container = document.createElement("div");
            let input = document.createElement("input");
            let label = document.createElement("label");
            let checkbox = document.createElement("span");
            checkbox.classList.add("checkbox");
            input.setAttribute("type", "checkbox");
            input.setAttribute("id", ["choice", idx].join("-"));
            input.setAttribute("value", choice);
            label.setAttribute("for", ["choice", idx].join("-"));
            label.innerText = choice;
            label.appendChild(checkbox);
            container.appendChild(input);
            container.appendChild(label);
            form.appendChild(container);
        });

        let btn = document.createElement("button");
        btn.title = action.title;
        btn.innerText = context.parseText(action.description);
        btn.onclick = (e) => {
            if (action.statechange) {
                context.applyStateChanges(action.statechange);
            }

            const currentAnswers = [
                ...document.querySelectorAll(".multipleChoice input:checked"),
            ].map((answer) => {
                return answer.value;
            });

            const isCorrect =
                correctAnswers === JSON.stringify(currentAnswers.sort());

            const nextScene =
                action.target && action.optionalTarget && isCorrect
                    ? action.target
                    : action.optionalTarget;

            context.loadScene(nextScene || context.sceneId, context.scenes);
        };

        form.appendChild(btn);
        return form;
    },
};

export default Actions;
