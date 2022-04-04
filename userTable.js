import Component from "./library.js";

class UserTable extends Component {

    constructor() {
        super();
        this._rows = [];
        this._columns = [];
    }

    set rows(rows) {
        this._rows = rows;
    }

    get rows() {
        return this._rows;
    }

    set columns(columns) {
        this._columns = columns;
    }

    get columns() {
        return this._columns;
    }

    tableBody(rows) {
        return rows.map((row, index) => `
        <tr key=${index}>
            <td>${row.name}</td>
            <td>${row.city}</td>
            <td>${row.state}</td>
            <td>${row.age}</td>
        </tr>
        `).join("");
    }

    tableHead(keys) {
        return keys.map((key, index) => `
        <th key=${index}>${key[0].toUpperCase().concat(key.substring(1))}</th>
        `).join("");
    }

    template() {
        return `
        <table>
            <thead>
                <tr>
                    ${this.tableHead(this._columns)}
                </tr>
            </thead>
            <tbody>
                ${this.tableBody(this._rows)}
            </tbody>
        </table>
        `
    }
}

export default UserTable;