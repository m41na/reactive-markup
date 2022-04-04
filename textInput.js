import Component from "./library.js";

class TextInput extends Component {

    constructor(props = {}) {
        super();
        const { name, id, className, onChange } = props;
        this.id = id;
        this.name = name;
        this.className = className;
        this.value = '';
        this.onChange = onChange;
    }

    template() {
        return `
            <input name=${this.name} />
        `
    }
}

export default (props) => {
    return new TextInput(props);
}