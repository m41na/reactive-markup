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

    constructor() {
        this.element;
        this.children = []
    }

    attach(component) {
        this.children.push(component);
        //return a placeholder
        return '<span class="child_placeholder"></span>'
    }

    onDataChanged(property, oldValue, newValue) {
        console.log(property, 'changed from', oldValue, 'to', newValue);
        const existingComponent = this.element;
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
}

