# Using vanilla Javascript to render reactive markup

> In the era of dynamic web content, the emergence of the web 2.0 has led to a plethora of techniques, all aimed at making rendering web content not just faster, but also more efficient and more automated. The level of abstraction used to achieve this can sometimes obscure the important fundamentals that make these feats possible. This article is an attempt to peel back the layers and explores the basic operations that underpin the more complex abstractions.

At the core level, DOM rendering boils down to adding and removing DOM nodes, and choosing the most efficient way to do this. There is also a lot of improvements that have been build around the DOM to provide alternative and hopefully more efficient ways of rendering. Let's start from a barebone, static html table.

```
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
</head>

<body>
    <div id='main'>
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>State</th>
                    <th>Age</th>
                </tr>
            </thead>
            <tboby>
                <tr>
                    <td>Steve</td>
                    <td>Madison</td>
                    <td>WI</td>
                    <td>36</td>
                </tr>
            </tbody>
        </table>
    </div>
</body>

</html>
```
This a a simple table that displays just one row of data. The table could however display multiple rows of data if there was more data available. This data is mostly available from external sources like REST APIs and in different formats like json, csv or xml. The table also currently displays just four columns and the columns names are static. The table could however display a different number of columns and the columns could have different names. To achieve this level of flexibility, a static html table is definately not going to take you far.

> Imagine having a static table for each dataset you could possibly have. It is infisible to try and use static markup.

As a starting point, create a 'dynamic.js' file in the same directory as your index.html file. Extract all the static data from this table and use a javascript variable to represent it.

```
const tableData = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: ['Steve', 'Madison', 'WI', '36']
}
```

With that out of the way, we can render this table markup using javascript's templating feature. Replace the body content with the snippet below;

```
<body>
    <div id='main'></div>
    <script src='dynamic.js'></script>
</body>
```

Now, create a variable to hold the table markup, and using string extrapolation, replace the static values with those from the tableData variable.

```dynamic.js
const tableData = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: ['Steve', 'Madison', 'WI', '36']
}

const tableMarkup = `
<table>
    <thead>
        <tr>
            <th>${tableData.columns[0]}</th>
            <th>${tableData.columns[1]}</th>
            <th>${tableData.columns[2]}</th>
            <th>${tableData.columns[3]}</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>${tableData.rows[0]}</td>
            <td>${tableData.rows[1]}</td>
            <td>${tableData.rows[2]}</td>
            <td>${tableData.rows[3]}</td>
        </tr>
    </tbody>
</table>
`
```
With these changes, we see that the table markup now no longer contains static data, and instead, the data is injected through substituting values from the tableData using a javascript template. This is a big leap, but still severely ineffectiver because it can display only one row. 

Furthermore, the table is still not rendered on the page, so this needs to be done. There are several ways this can be achived, and each different way has its own merits and shortcomings. Let's take a quick detour and dig into a few of these ways.

### Using innerHTML

Add this to the _dynamic.js_ file

```
document.getElementById('main').innerHTML = tableMarkup
```

> If you haven't done so already, it might be prudent to spin up a static content server to render your page. You can follow these steps if you so choose
1. npm init -y (initialize a node project in your current folder)
2. npx http-server . -p 8080 -d false (this will download and start the http-server without adding it to your dependencies)

> Alternatively, you could download the http-server dependency and use a script to start it
3. npm i -D http-server
4. Add the script _"start": "npx http-server . -p 8080 -d false"_ to your package.json
4. run _npm run start_ to start the server

> Open you browser and navigate to _http://127.0.0.1:8080_. 

1. Use a hard refresh in the browser to view changes made to the source files
2. With this step, you have the table rendered in the page, but unfortunately you cannot add more rows of data to it at this time.

Merits

1. Super easy to use

Drawbacks

1. The string markup is not validated, and the browser will make a best effort to render what it can.

### Using _document.createElement()_

Add this to the _dynamic.js_ file

```
const newTable = document.createElement('template');
newTable.innerHTML = tableMarkup;
document.getElementById('main').appendChild(newTable.content.firstChild);
```

> You could alternatively create DOM elements for each of the table elements, and nest them together into the desired shape. But as the markup size grows larger, this would very quick get tedious trying to compose the _createElement_ calls manually. We'll infact revisit this topic at some point later on. However, this approach is superior to appending raw markup to your document tree. Using recursive calls to walk down the tree nodes would make this approach significantly tennable. Infact, some frameworks like React use some specialized syntax _(JSX)_ to abstract away the low-level _createElement_ and at the same time provide an alternative way to traverse the DOM, specifically the shadow DOM

Merits

1. The markup is validated before being added to the template element. Try misspelling a _body_ tag as for example _boby_ - you will notice that the table will not be rendered in the page

Drawbacks

1. Although still easy to use, there are additional steps needed to successfully create a new table node.
2. Using recursion to walk the document tree will significantly rise the level of complexity

### Using the DOMParser

The _DOMParser_ interface provides the ability to parse XML or HTML source code from a string into a DOM Document.

> const doc = domparser.parseFromString(string, mimeType)

Add this to the _dynamic.js_ file

```
const parser = new DOMParser();
const newTable = parser.parseFromString(tableMarkup, 'text/html');
document.getElementById('main').appendChild(newTable.body.firstChild);
```

Merits

1. Just like with the _createElement()_ approach, the markup is validated before being added to the template element. Try misspelling a _body_ tag as for example _boby_ - you will notice that the table will not be rendered in the page

Drawbacks

1. Although still easy to use, there are additional steps needed to successfully create a new table node.

### Using the DocumentFragment

The _DocumentFragment_ interface represents a minimal document object that has no parent. It is used as a lightweight version of Document that stores a segment of a document structure comprised of nodes just like a standard document. 

> DocumentFragment() Creates and returns a new DocumentFragment object.

Add this to the _dynamic.js_ file

```
const fragment = new DocumentFragment();
//attach elements to the fragment, just like you would to the actual document
const parser = new DOMParser();
const newTable = parser.parseFromString(tableMarkup, 'text/html');
fragment.appendChild(newTable.body.firstChild);
//when finally ready, attach fragment to the document
document.getElementById('main').appendChild(fragment);
```

Merits

1. It has all the merits of using createElement or DOMParser.
2. Changes made to the fragment don't affect the document (even on reflow) or incur any performance impact when changes are made.

Drawbacks

1. Significantly more operations are required to manipulate document nodes successfully, but the approach is still pretty straight-forward.

> I hope that this detour has helped shed some light on a few techniques that you could use to render the table. I will be using any of these approaches interchangibly moving forward without any strong opinions of why I made that choice, so feel free to mix and match them as well.

## Rendering more than one row

The table we have can only display onw row. Let's change that and have it display a variable number of rows, depending on the size of the data avaiable. So instead of the _rows_ field having a list of primitive values, let's instead use a list of object values.

```
const tableData = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{name: 'Steve', city: 'Madison', state: 'WI', age: '36'},
        {name: 'Mike', city: 'Wichita', state: 'KS', age: '24'},
        {name: 'Annie', city: 'Detroit', state: 'MI', age: '33'}
    ]
}
```

We could create row in the _tbody_ manually, but this would be very inefficient. We will use a map function to make this more tennable. Remember to join the mapped rows together to form a string

```
const tableBody = (rows) => rows.map(row => `
<tr>
    <td>${row.name}</td>
    <td>${row.city}</td>
    <td>${row.state}</td>
    <td>${row.age}</td>
</tr>
`).join("");

const tableMarkup = `
<table>
    <thead>
        <tr>
            <th>${tableData.columns[0]}</th>
            <th>${tableData.columns[1]}</th>
            <th>${tableData.columns[2]}</th>
            <th>${tableData.columns[3]}</th>
        </tr>
    </thead>
    <tbody>
        ${tableBody(tableData.rows)}
    </tbody>
</table>
`
```

If the table columns match the data keys in the row objects, you could optionally also further refactor the _thead_ element creation. In this case, let's assume that is indeed the case and simply transform the data keys to column names by capitalizing the key value.

```
const tableHead = (keys) => keys.map(key => `
<th>${key[0].toUpperCase().concat(key.substring(1))}</th>
`).join("");

const tableMarkup = `
<table>
    <thead>
        <tr>
            ${tableHead(Object.keys(tableData.rows[0]))}
        </tr>
    </thead>
    <tbody>
        ${tableBody(tableData.rows)}
    </tbody>
</table>
`
```

> You could also optionally use the filter transformation on a list to leave out some rows based on a criteria you come up with before applying the map transformation to the result. So with just _filter_ and _map_, you can already start seeing how you can compose more complex transformations on the data before finally rendering it to the DOM.

One enhancement we can make at this point is to encapsulate the functionality we currently have floating around in the script inside a class.

```
class UserTable {
    constructor({ columns, rows }) {
        this.columns = columns
        this.rows = rows;
    }

    tableBody(rows) {
        return rows.map(row => `
        <tr>
            <td>${row.name}</td>
            <td>${row.city}</td>
            <td>${row.state}</td>
            <td>${row.age}</td>
        </tr>
        `).join("");
    }

    tableHead(keys) {
        return keys.map(key => `
        <th>${key[0].toUpperCase().concat(key.substring(1))}</th>
        `).join("");
    }

    template() {
        return `
        <table>
            <thead>
                <tr>
                    ${this.tableHead(Object.keys(this.rows[0]))}
                </tr>
            </thead>
            <tbody>
                ${this.tableBody(this.rows)}
            </tbody>
        </table>
        `
    }

    render() {
        const parser = new DOMParser();
        const newTable = parser.parseFromString(this.template(), 'text/html');
        return newTable.body.firstChild;
    }
}

document.getElementById("main").appendChild(new UserTable({ ...tableData }).render());
```

## Reactivity - Updating the DOM dynamically

This is a totally different dimension as far as rendering to the DOM is concerned, and this is where different frameworks start to differentiate themselves - it's holy grail, the ultimate goal that is always slightly different based on the nature of the web application and the goals it strives to meet. Reactivity is the concept where the DOM content changes dynamically based on the state of the data it is showing.

### Reactivity using Javascript proxy

> The Proxy object enables you to create a proxy for another object, which can intercept and redefine fundamental operations for that object.

You create a Proxy with two parameters:

- target: the original object which you want to proxy
- handler: an object that defines which operations will be intercepted and how to redefine intercepted operations.

A very basic example would look like this

```
const target = {
  message1: "hello",
  message2: "everyone"
};

const handler1 = {};

const proxy1 = new Proxy(target, handler1);

//Now invoking the proxy

console.log(proxy1.message1); // hello
console.log(proxy1.message2); // everyone
```

In this case above, the handler is empty, and so this proxy behaves just like the original target. However, the handler can target different methods on objects. These intercepting methods are called _Traps_.

```
get (oTarget, sKey) 

set: function (oTarget, sKey, vValue)

deleteProperty: function (oTarget, sKey)

ownKeys: function (oTarget, sKey)

has: function (oTarget, sKey)

defineProperty: function (oTarget, sKey, oDesc)

getOwnPropertyDescriptor: function (oTarget, sKey)
```

You could now therefore modify the handler to for example intercept the _get_ operation and inject new behavior when a property is accessed in the target object. For instance, any _get_ operation on the target will simply return _'world_' instead of the actual value

```
const handler2 = {
  get(target, prop, receiver) {
    return "world";
  }
};

const proxy2 = new Proxy(target, handler2);

//Now invoking the proxy

console.log(proxy2.message1); // world
console.log(proxy2.message2); // world
```

With this behavior, you can now have the table re-render when the data is transformed.

### Proxying the table data

Let's create a proxy from the table data. For purposes of illustration, keep the table data at the top level of the script so that it stays in the browser window's global scope.

> By keeping the data in the global scope, we will be able to modify it through the _Developer Tools_

```
const proxyHandler = {
    set(obj, prop, newval) {
        let oldval = obj[prop];

        console.log(prop, 'changed from', oldval, 'to', newval)

        // The default behavior to store the value
        obj[prop] = newval;

        // Indicate success
        return true;
    }
};

//apply proxy recursively to table data, depth-first
const proxify = (obj) => {
    if (Array.isArray(obj)) {
        let i = 0;
        for (item of obj) {
           obj[i] = proxify(item);
           i++;
        }
        return new Proxy(obj, proxyHandler)
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            obj[key] = proxify(obj[key])
        }
        return new Proxy(obj, proxyHandler)
    }
    else {
        return obj;
    }
}

const tableDataProxy = proxify(tableData);

//change the constructor value of UserTable as well
document.getElementById("main").appendChild(new UserTable({ ...tableDataProxy }).render());
```

In the Developer Tools _Console_ tab, change the age of the first user in the table data

```
tableDataProxy.rows[0].age=30
dynamic.js:13 age changed from 36 to 30
30
```

When we view the table data now, we can see the first row's age value changed, but the table rendered in the DOM has no idea this happened - it does not get re-rendered.

```
tableDataProxy
Proxy {columns: Proxy, rows: Proxy}
columns: Proxy {0: 'Name', 1: 'City', 2: 'State', 3: 'Age'}
rows: Proxy
0: Proxy {name: 'Steve', city: 'Madison', state: 'WI', age: 30}
1: Proxy {name: 'Mike', city: 'Wichita', state: 'KS', age: '28'}
2: Proxy {name: 'Annie', city: 'Detroit', state: 'MI', age: '32'}
length: 3
```

The proxy presents us with an opportunity to react when the table data changes.

### Reacting to data change

Let's now take another step and examine how the table can be re-rendered. This will require a little bit of refactoring the _UserTable_ class

1. Create private fields for _rows_ and _columns_ and expose their respective setters and getters. This way the table can be created without needing to have data ready to pass into the constructor
2. Add a new method to the class which reacts to the change in data. 

```
constructor() {
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

onDataChanged(property, oldValue, newValue) {
    console.log(property, 'changed from', oldValue, 'to', newValue);
    const parent = document.getElementById("main");
    parent.replaceChild(this.render(), parent.firstChild);
}
```

The re-rendering is pretty inefficient as it currently stands - it replaces the entire component each time data changes. Ideally, we'd like to reduce the DOM footprint affected by re-rendering. A targeted re-rendering strategy would be more optimal in this regard. This is a topic we'll revisit later on when we refactor this code, but for now let's charge forward with the current sub-optimal rendering

To begin, let's modify the _proxyHandler_ to be a closure that will accept a listener and which will in turn get notified when data changes in the model

```
const proxyHandler = (listener) => {
    const handler = listener;
    return ({
        set(obj, prop, newval) {
            let oldval = obj[prop];

            // The default behavior to store the value
            obj[prop] = newval;

            //add new behavior - notify listeners of change
            handler(prop, oldval, newval);

            // Indicate success
            return true;

        }
    });
};
```

The _proxify_ method will also need some modification to accomodate a new parameter - the _listener_ - which will be passed down recursively depth-first as well to the nested objects

```
//apply proxy recursively to table data, depth-first
const proxify = (obj, listener) => {
    if (Array.isArray(obj)) {
        let i = 0;
        for (item of obj) {
            obj[i] = proxify(item, listener);
            i++;
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            obj[key] = proxify(obj[key], listener)
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else {
        return obj;
    }
}
```

With those changes in places, let's now also mofify the way the table component is creeated and rendered initially.

```
const table = new UserTable();

const { columns, rows } = proxify(tableData, table.onDataChanged.bind(table));
table.rows = rows;
table.columns = columns;

document.getElementById("main").appendChild(table.render());
```

> The table's _onDataChanged_ method is passed to the _proxify_ function to receive nofitication when data changes. Remeber to use bind - _table.onDataChanged.bind(table)_ - when passing this method, so that the _this_ reference will always be pointing to the table component.

Now back in the _Developer Tools_, head to the _Console_tab, and change the age of the first row data

```
table.rows[0].age=33
dynamic.js:72 age changed from 36 to 33
33
```

And just like that, the table is re-rendered with new values.

But what about if a new row is added? Head back to the _Console_ tab, and add a new row

```
table.rows.push(proxify({name: 'Annie', city: 'Los Angeles', state: 'CA', age: '20'}, table.onDataChanged.bind(table)))
dynamic.js:72 3 changed from undefined to Proxy {name: 'Annie', city: 'Los Angeles', state: 'CA', age: '20'}
dynamic.js:72 length changed from 4 to 4
6
```

And as we'd expect, the table is re-rendered with the new row

But what about if an existing row is deleted? Head back to the _Console_ tab, and delete the second row

```
table.rows.splice(1, 1)
dynamic.js:72 1 changed from Proxy {name: 'Annie', city: 'Detroit', state: 'MI', age: '32'} to Proxy {name: 'Jane', state: 'NY', age: '30'}
dynamic.js:72 2 changed from Proxy {name: 'Jane', state: 'NY', age: '30'} to Proxy {name: 'Annie', city: 'Los Angeles', state: 'CA', age: '20'}
dynamic.js:72 length changed from 4 to 3
```

And as we'd expect, the table is re-rendered without the deleted row

> _splice_ and _push_ operations are both caught by the _set_ trap in the _proxyHandler_. To use an operation like _delete_, you need to set the _deleteProperty_ trap in the _proxyHandler_ as well


## Targeted re-rendering

I had pointed out earlier that we'd re-visit the _onDataChanged_ method of the _UserTable_ component since it was too aggressive in its update strategy - it replaces the entire component with a newly rendered copy. By replacing the existing component, any existing event bindings get lost as well, and would have to be done all over again. Clearly, this is not an optimal solution. Can we do better?

### Shadow DOM

One strategy would be to use the shadow DOM to compare the existing element with the new one before updating the changed elements only. The shadow DOM allows you to render outside the actual DOM but still have the same exact tree of nodes that the actual DOM would have. 

> In this example, the component being used is pretty simple, and so will be the comparison algorithm. But as you would image, a more elaborate component would have a more complex comparison algorithm as well

Let's first require that when using a _map_ to generate markup, then a key should be associated with each top-level node.

```
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
```

For good measure, let's also update the _render()_ method to return a document fragment

```
render() {
    const fragment = new DocumentFragment();
    //attach elements to the fragment, just like you would to the actual document
    const parser = new DOMParser();
    const newTable = parser.parseFromString(this.template(), 'text/html');
    fragment.appendChild(newTable.body.firstChild);
    return fragment
}
```

And to get synced up, I will paste here the content of the current script which you can copy and follow along with the rest of the conversation.

```
const tableData = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{ name: 'Steve', city: 'Madison', state: 'WI', age: '36' },
    { name: 'Mike', city: 'Wichita', state: 'KS', age: '28' },
    { name: 'Annie', city: 'Detroit', state: 'MI', age: '32' }
    ]
}

const proxyHandler = (listener) => {
    const handler = listener;
    return ({
        set(obj, prop, newval) {
            let oldval = obj[prop];

            // The default behavior to store the value
            obj[prop] = newval;

            //add behavior - notify listeners of change
            handler(prop, oldval, newval);

            // Indicate success
            return true;

        }
    });
};

//apply proxy recursively to table data, depth first
const proxify = (obj, listener) => {
    if (Array.isArray(obj)) {
        let i = 0;
        for (item of obj) {
            obj[i] = proxify(item, listener);
            i++;
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            obj[key] = proxify(obj[key], listener)
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else {
        return obj;
    }
}

class UserTable {
    constructor() {
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

    onDataChanged(property, oldValue, newValue) {
        console.log(property, 'changed from', oldValue, 'to', newValue);
        const parent = document.getElementById("main");
        const existingComponent = parent.firstChild;
        const newComponent = this.render();
        parent.replaceChild(newComponent, existingComponent);
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

    render() {
        const fragment = new DocumentFragment();
        //attach elements to the fragment, just like you would to the actual document
        const parser = new DOMParser();
        const newTable = parser.parseFromString(this.template(), 'text/html');
        fragment.appendChild(newTable.body.firstChild);
        return fragment
    }
}

const table = new UserTable();

const { columns, rows } = proxify(tableData, table.onDataChanged.bind(table));
table.rows = rows;
table.columns = columns;

document.getElementById("main").appendChild(table.render());
```

Let's introduce a new method _compareAndUpdate_ in the _UserTable_ component. This method will walk down the tree nodes and compare the _nodeValue_ of _Node.TEXT_NODE_ nodes for equality, and if they are not the same, the existing node's value will be updated to that in the component rendered in the shadowDOM. The _onDataChanged_ also needs to use the _compareAndReplace_ method istead of the _document.replaceChild()_ function

```
onDataChanged(property, oldValue, newValue) {
    console.log(property, 'changed from', oldValue, 'to', newValue);
    const parent = document.getElementById("main");
    const existingComponent = parent.firstChild;
    const newComponent = this.render();
    this.compareAndReplace(newComponent.firstChild, existingComponent);
}

compareAndReplace(newComponent, existingComponent) {
    if (existingComponent.nodeType === Node.TEXT_NODE) {
        if (newComponent.nodeValue !== existingComponent.nodeValue) {
            existingComponent.nodeValue = newComponent.nodeValue;
        }
    }
    else if (existingComponent.children.length > 0) {
        for (let i = 0; i < existingComponent.childNodes.length; i++) {
            const currentNode = existingComponent.children[i];
            if(currentNode != null){
                const newNode = newComponent.children[i];
                this.compareAndReplace(newNode, currentNode);
            }
        }
    } else {
        this.compareAndReplace(newComponent.firstChild, existingComponent.firstChild)
    }
}
```

And sure enough, when we update the table data, only the affected _TextNode_ is updated and absolutely nothing is replaced.

```
table.rows[0].age=33
dynamic.js:72 age changed from 36 to 33
33
```

This is a far more efficient approach to updating the DOM compared to the last method - replacing the entire component, but it's not necessarily complete or exhaustive - it's just illustrative of how a component can be updated transparently.

## Multiple components

How much complexity would be introduced if threw in some more components into the mix? I think the first step to take should be to think of using modules and splicing up the code into logical units. First, in the _index.html_ file import the javascript as a module.

```
<body>
    <div id='main'></div>
    <script src='index.js' type="module"></script>
</body>
```

The _index.js_ is a typical standard entry point into the module graph. From here, let's see how we can render the same table.

```index.js
import { tableData } from './data.js';
import { proxify } from './library.js';
import userTableComponent from './userTable.js';

document.getElementById("main").appendChild(userTableComponent(tableData, proxify).render());
```

I have seperated the original content into three files to accomodate reuse. The first is the _data_ file. This is an abstraction of the data store.

```data.js
export const tableData = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{ name: 'Steve', city: 'Madison', state: 'WI', age: '36' },
    { name: 'Mike', city: 'Wichita', state: 'KS', age: '28' },
    { name: 'Annie', city: 'Detroit', state: 'MI', age: '32' }
    ]
}
```

The second file comprises of the code which is reusable, and is not specific to a particular component

```library.js
const proxyHandler = (listener) => {
    const handler = listener;
    return ({
        set(obj, prop, newval) {
            let oldval = obj[prop];

            // The default behavior to store the value
            obj[prop] = newval;

            //add behavior - notify listeners of change
            handler(prop, oldval, newval);

            // Indicate success
            return true;

        }
    });
};

//apply proxy recursively to table data, depth first
export const proxify = (obj, listener) => {
    if (Array.isArray(obj)) {
        let i = 0;
        for (let item of obj) {
            obj[i] = proxify(item, listener);
            i++;
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else if (typeof obj === 'object' && obj !== null) {
        for (const key of Object.keys(obj)) {
            obj[key] = proxify(obj[key], listener)
        }
        return new Proxy(obj, proxyHandler(listener))
    }
    else {
        return obj;
    }
}

export default class Component {

    onDataChanged(property, oldValue, newValue) {
        console.log(property, 'changed from', oldValue, 'to', newValue);
        const parent = document.getElementById("main");
        const existingComponent = parent.firstChild;
        const newComponent = this.render();
        this.compareAndReplace(newComponent.firstChild, existingComponent);
    }

    compareAndReplace(newComponent, existingComponent) {
        if (existingComponent != null) {
            if (existingComponent.nodeType === Node.TEXT_NODE) {
                if (newComponent.nodeValue !== existingComponent.nodeValue) {
                    existingComponent.nodeValue = newComponent.nodeValue;
                }
            }
            else if (existingComponent.children.length > 0) {
                for (let i = 0; i < existingComponent.childNodes.length; i++) {
                    const currentNode = existingComponent.children[i];
                    if (currentNode != null) {
                        const newNode = newComponent.children[i];
                        this.compareAndReplace(newNode, currentNode);
                    }
                }
            } else {
                this.compareAndReplace(newComponent.firstChild, existingComponent.firstChild)
            }
        }
    }

    render() {
        const fragment = new DocumentFragment();
        //attach elements to the fragment, just like you would to the actual document
        const parser = new DOMParser();
        const newTable = parser.parseFromString(this.template(), 'text/html');
        fragment.appendChild(newTable.body.firstChild);
        return fragment
    }
}
```

The third file is the code which is specific to a particular component, and which extends the library _Component_

```userTable.js
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

export default (tableData, proxify) => {
    const table = new UserTable();

    const { columns, rows } = proxify(tableData, table.onDataChanged.bind(table));
    table.rows = rows;
    table.columns = columns;
    return table;
}
```

And sure enough, when we refresh the window, all things should render just like before. One subtle difference is that the global variables were manipulating previously from the _Console_ tab in _Developer Tools_ are no longer available

So, with that initial refactoring, let try to wrap the _userTableComponent_ inside a parent _App_ component.

```index.js
import { tableData } from './data.js';
import userTableComponent from './userTable.js';
import Component, { proxify } from './library.js';

class App extends Component {

    userTable(){
        return userTableComponent(tableData, proxify)
    }

    template() {
        return `
        <div class='app'>
            ${this.userTable().render()}
        </div>
        `;
    }
}

document.getElementById("main").appendChild(new App().render());
```

If you now try to refresh the page, things fall apart. What gets rendered is:

```
[object DocumentFragment]
```

That's because the _this.userTable().render()_ produces a fragment and it's converted to a string literal in the _template()_ method. This is clearly not the desired outcome. We must introduce a way to tell between components and markup. 

A plausible way to achieve this goal would be to introduce another method to capture this child component, and instead return a placeholder which will later be substituted with the actual child node.

```
template() {
    return `
    <div class='app'>
    ${this.attach(this.userTable())}
    </div>
    `;
}
```

The _attach(component)_ method should be added to the _Component_ class, and the _Component_ class should have a list of its children. Add a constructor and initialize a new instance variable

```library.js
export default class Component {

    constructor(){
        this.element;
        this.children = []
    }

    attach(component){
        this.children.push(component);
        //return a placeholder
        return '<span class="child_placeholder"></span>'
    }

    ...rest remains the same
```

Update the _render()_ method in the _Component_ class to replace placeholders with the actual child node.

```
render() {
    const fragment = new DocumentFragment();
    //attach elements to the fragment, just like you would to the actual document
    const parser = new DOMParser();
    const newTable = parser.parseFromString(this.template(), 'text/html');
    fragment.appendChild(newTable.body.firstChild);
    //expand and replace placeholders with the child fragments
    const slots = fragment.querySelectorAll("span.child_placeholder");
    for(let i = 0; i < slots.length; i++){
        slots[i].replaceWith(this.children[i].render());
    }
    return fragment
}
```

And now things should render as before again.

Let's add a few more table components using different data

```data.js
export const tableData1 = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{ name: 'Steve', city: 'Madison', state: 'WI', age: '36' },
    { name: 'Mike', city: 'Wichita', state: 'KS', age: '28' },
    { name: 'Annie', city: 'Detroit', state: 'MI', age: '32' }
    ]
}

export const tableData2 = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{ name: 'Jamie', city: 'Las Vegas', state: 'NV', age: '33' },
    { name: 'Kasie', city: 'Boston', state: 'MA', age: '27' },
    { name: 'Bonni', city: 'Austin', state: 'TX', age: '40' }
    ]
}

export const tableData3 = {
    columns: ['Name', 'City', 'State', 'Age'],
    rows: [{ name: 'Jose', city: 'Seattle', state: 'WA', age: '36' },
    { name: 'Kim', city: 'Chicago', state: 'IL', age: '21' },
    { name: 'John', city: 'Jackson', state: 'MS', age: '32' }
    ]
}
```

Now update the _App_ component in _index.js_

```index.js
import { tableData1, tableData2, tableData3 } from './data.js';
import userTableComponent from './userTable.js';
import Component, { proxify } from './library.js';

class App extends Component {

    userTable1(){
        return userTableComponent(tableData1, proxify)
    }

    userTable2(){
        return userTableComponent(tableData2, proxify)
    }

    userTable3(){
        return userTableComponent(tableData3, proxify)
    }

    template() {
        return `
        <div class='app'>
        ${this.attach(this.userTable1())}
        ${this.attach(this.userTable2())}
        ${this.attach(this.userTable3())}
        </div>
        `;
    }
}
```

So with those additions, the three table components are rendered just as you would expect.

## Adding event handlers

So far we have only dealt with DOM elements are not talked out DOM events. How will these be treated? To try this out, let's add a new _userForm.js_ file and create a form component to update the table data.

```userForm.js
import Component from "./library.js";

class UserForm extends Component {

    constructor() {
        super();
        this.name = '';
        this.city = '';
        this.state = '';
        this.age = '';
    }

    template() {
        return `
        <form>
            <input name='name' onChange=${e => this.name = e.target.value} />
            <br/>
            <input name='city' onChange=${e => this.city = e.target.value} />
            <br/>
            <input name='state' onChange=${e => this.state = e.target.value} />
            <br/>
            <input name='age' type='number' onChange=${e => this.age = e.target.value} />
            <br/>
            <input type='button' onclick=${() => console.log(this.name, this.city, this.state, this.age)} />
            <br/>
            <div>${this.name} ${this.city} ${this.state} ${this.age}</div>
        </form>
        `
    }
}

export default () => {
    return new UserForm();
}
```

Let's render this as a child of the __App_component_ in _index.js_

```index.js
import userFormComponent from './userForm.js';
import Component from './library.js';

class App extends Component {

    userForm(){
        return userFormComponent();
    }

    template() {
        return `
        <div class='app'>
        ${this.attach(this.userForm())}
        </div>
        `;
    }
}

document.getElementById("main").appendChild(new App().render());
```

When the page is rendered, it is completely not anything we expected to see. The event handlers are treated as string literals in the _template_ method. This may sound familiar if you remember when we first tried to nest components in the page.

A plausible solution might be to create base components for form controls, like in this case, the TextInput and ButtonInput

```textInput.js
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
```

```buttonInput.js
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
```

The two components are very basic, but they illustrate how you encapsulate the attributes of the form controls they represents. With this change, the _App_ component should be updated to reflect the new form controls

```index.js
import { formData } from './data.js';
import userFormComponent from './userForm.js';
import Component, { proxify } from './library.js';

class App extends Component {

    template() {
        return `
        <div class='app'>
        ${this.attach(userFormComponent(formData, proxify))}
        </div>
        `;
    }
}

document.getElementById("main").appendChild(new App().render());
```

But we still have not determined how to add the event handlers to their respective controls. Well, this can be done in the _render()_ function which will check to see if the _Component_ contains handler functions


```library.js
render() {
        const fragment = new DocumentFragment();
        //attach elements to the fragment, just like you would to the actual document
        const parser = new DOMParser();
        const newElement = parser.parseFromString(this.template(), 'text/html');
        this.element = newElement.body.firstChild;
        fragment.appendChild(this.element);
        //expand and replace placeholders with the child fragments
        const slots = fragment.querySelectorAll("span.child_placeholder");
        for (let i = 0; i < slots.length; i++) {
            slots[i].replaceWith(this.children[i].render());
        }
        //attach handlers
        if (this.onChange) {
            this.element.addEventListener('change', this.onChange)
        }
        if (this.onClick) {
            this.element.addEventListener('click', this.onClick)
        }
        return fragment
    }
```

At this point, the form is rendered on the page, and the events fire as expected. Since the element is rendered only once and not replaced later on, then the even handlers will remain attached to these element for the enterity of their lifetime.

### Updating data using the form

Now it's time to add link the table component with the form component and see how they interact. But first, refactor both _userTable.js_ and _userForm.js" to only export the class. We'll connect the components to the data they need in the _App_ component.

```index.js
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
```

The page should continue to render just as it was before the refactor step, but there's a few wrinkles. Are you able to spot them?

I think this is a nice spot to hit pause. It's been quite a journey exploring the different way you can use vanilla javascript to implement reactivity. There is a lot of great and battle-tested frameworks that already do this and that have a lot more and far more advanced features. It's my hope that this inspires you to be always curious