class Component {
    _template = '';
    _styles = [];
    _data = {};

    constructor(template, data = {}, styles = {}) {
        this._template = template;
        this._data = data;
        this._styles = styles;
    }

    build() {
        let funcs = [];

        const funList = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter((m) =>
            !['build', 'constructor', 'setTemplate', 'setStyles'].includes(m));

        if (funList) {
            funList.forEach((f) => {
                funcs.push(this[f]);
            });
        }

        return {
            template: this._template,
            functions: funcs,
            model: this._data,
            styles: this._styles,
        };
    }

    setTemplate(template) {
        this._template = template;
    }

    setStyles(styles) {
        this._styles = styles;
    }
}