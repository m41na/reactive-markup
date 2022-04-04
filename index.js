import { tableData, formData } from './data.js';
import UserTable from './userTable.js';
import UserForm from './userForm.js';
import Component, { proxify } from './library.js';

const connectUserForm = (form) => {
    const formElement = new UserForm();
    formElement.form = formData;
    return formElement;
}

const connectUserTable = ({ columns, rows }) => {
    const table = new UserTable();
    table.rows = rows;
    table.columns = columns;
    return table;
}

class App extends Component {

    template() {
        const appData = proxify({ tableData, formData }, this.onDataChanged.bind(this));

        return `
        <div class='app'>
        ${this.attach(connectUserTable(appData.tableData))}
        ${this.attach(connectUserForm(appData.formData))}
        </div>
        `;
    }
}

document.getElementById("main").appendChild(new App().render());