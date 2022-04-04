import Component from "./library.js";

class ButtonInput extends Component {

    constructor(props = {}) {
        super();
        const { id, className, value, onClick } = props;
        this.id = id;
        this.className = className;
        this.value = value;
        this.onClick = onClick;
    }

    template() {
        return `
            <input type='button' value='${this.value}' />
        `
    }
}

export default (props) => {
    return new ButtonInput(props);
}