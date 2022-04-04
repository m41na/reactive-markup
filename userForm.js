import Component from "./library.js";
import textInput from './textInput.js'
import buttonInput from './buttonInput.js'

class UserForm extends Component {

    constructor() {
        super();
        this._form;
    }

    set form(value){
        this._form = value;
    }

    get form(){
        return this._form;
    }

    template() {
        return `
        <form>
            ${this.attach(textInput({ name: 'name', onChange: e => this._form.name = e.target.value }))}
            <br/>
            ${this.attach(textInput({ name: 'city', onChange: e => this._form.city = e.target.value }))}
            <br/>
            ${this.attach(textInput({ name: 'state', onChange: e => this._form.state = e.target.value }))}
            <br/>
            ${this.attach(textInput({ name: 'age', onChange: e => this._form.age = e.target.value }))}
            <br/>
            ${this.attach(buttonInput({ value: "Click Me", onClick: () => console.log(this._form) }))}
            <br/>
            <div>${this._form.name} ${this._form.city} ${this._form.state} ${this._form.age}</div>
        </form>
        `
    }
}

export default UserForm;
