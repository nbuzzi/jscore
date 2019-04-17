((data) => {
    'use strict';

    const $ = document;

    const {
        components,
        container
    } = data;

    const attributes = ['click', 'change', 'blur', 'focus', 'keypress', 'keydown',
        'keyup', 'mousedown', 'mousemove', 'moseover', 'mouseout', 'submit',
    ];

    const setup = () => {
        let counter = 0;

        const containerElement = container ? $.querySelector(container) : $.querySelector(`#app`);

        const createDOM = (stringTemplate = `<!doctype html><html><head></head><body></body></html>`, format = "text/html") => {
            return new DOMParser().parseFromString(stringTemplate, format);
        };

        const isObject = (obj) => {
            return (typeof (obj) == 'object' && !(obj.length));
        };

        const isFunction = (obj) => {
            return (typeof (obj) == 'function');
        };

        const getAttribute = (element, attributeName) => {
            if (element && element.attributes) {
                return element.getAttribute(attributeName);
            }
        };

        const replacerObject = (source, data, proper, firstProp) => {
            let stringReplaced = source;
            let regex = undefined;

            regex = new RegExp(`{{${proper}.${firstProp}}}`, 'g');
            let parent = `{{)([aA-zZ]{0,}`;

            if (!source.match(regex)) {
                regex = new RegExp(`(${parent}).(${proper}).(${firstProp})(}})`, 'g');

                let tries = 20;
                while (!source.match(regex)) {
                    current = `(${parent}).(${parent}).(${proper}).(${firstProp})(}})`
                    regex = new RegExp(current, 'g');

                    current += `(${parent}).`;
                    tries--;

                    if (tries <= 1) break;
                }
            }

            stringReplaced = stringReplaced.replace(regex, data[firstProp]);

            return stringReplaced;
        };

        const replaceCodeByLogic = (str, data, obj) => {
            let source = str;
            let prop = '([aA-zZ]+)';
            let regex = new RegExp(`{{${obj.iterator}.${prop}}}`, 'g');

            let match = source.match(regex);
            if (match) {
                for (let i in match) {
                    if (isFunction(match[i])) break;
                    let propName = null;

                    if (match[i].split) {
                        propName = match[i].split(".");
                        if (propName && propName.length && propName.length <= 1) {
                            propName = propName[0].replace(/{{/g, '').replace(/}}/g, '');
                        } else {
                            propName = propName[propName.length - 1].replace('}}', '');
                        }
                    }

                    if (propName == null) break;

                    for (let e in data) {
                        if (isFunction(data[e])) break;
                        if (data[e][propName]) {
                            source = source.replace(new RegExp(match[i]), data[e][propName]);
                        } else if (data[propName]) {

                            let matcher = new RegExp(match[i]);

                            if (source.match(matcher)) {
                                source = source.replace(matcher, data[propName]);
                            } else if (source.match('undefined')) {
                                source = source.replace('undefined', data[propName]);
                            }
                        }
                    }
                }
            }

            return source;
        };

        const replaceFinal = (str, data, pattern) => {

            let source = str;
            let match = source.match(pattern);

            if (match) {
                source = source.replace(pattern, data);
            }

            return source;
        };

        const applyLogic = (str, doc, data) => {
            let source = str,
                codeElement = '',
                pattern = '',
                tagName = '',
                iterator = '',
                operator = '',
                comparer = '',
                nameIterator = '',
                nameComparer = '';
            let spacesRegex = new RegExp("[#]+", "g");

            let logicList = doc.querySelectorAll('[vdom-if]');

            if (logicList && logicList.length) {
                for (let i in logicList) {
                    codeElement = '';
                    let element = logicList[i];
                    if (!element instanceof HTMLElement || typeof (element) == 'number') break;

                    tagName = element.tagName.toLowerCase();

                    let attribute = getAttribute(element, 'vdom-if');

                    let characters = ['<', '>', '==', '<=', '>=', '!=', '+', '-', '*', '/'];
                    for (let char in characters) {
                        if (attribute && attribute.indexOf && attribute.indexOf(characters[char]) >= 0) {
                            let resul = attribute;

                            if (resul && attribute.replace) {
                                resul = attribute.replace(/( )/g, '').split(characters[char]);
                            }

                            if (resul && resul.length) {
                                iterator = resul[0].replace(/( )/g, '');
                                operator = characters[char];
                                comparer = resul[resul.length - 1].replace(/( )/g, '');

                                break;
                            }
                        }
                    }

                    nameIterator = iterator;
                    nameComparer = comparer;

                    if (data[iterator] != null) {
                        iterator = `data["${iterator}"]`;
                    }

                    if (data[comparer] != null) {
                        comparer = `data["${comparer}"]`;
                    }

                    codeElement = element.innerHTML.replace(/[\n\r]+|([ ]+)/g, '#');

                    const replacerIn = (str, data, del) => {
                        let source = str;

                        let finPatternCode = `<${tagName} vdom-if=("|')${attribute}("|')>${codeElement}</${tagName}>`;

                        finPatternCode = finPatternCode.replace(/[\n\r]+|([ ]+)/g, '#');
                        pattern = new RegExp(finPatternCode, 'g');

                        if (!del) {
                            //Has logic
                            if (codeElement.match(/(({{)(([aA-zZ]+)|([aA-zZ]+.[aA-zZ]+))(}}))/g)) {
                                codeElement = replaceCodeByLogic(codeElement, data, {
                                    iterator: nameIterator,
                                    data: data
                                });
                            }

                            let replacedSpaces = source.replace(/[\n\r]+|([ ]+)/g, '#');
                            let preSource = replaceFinal(replacedSpaces, codeElement, pattern);

                            preSource = preSource.replace(new RegExp("[#]+", "g"), " ");

                            source = replaceFinal(replacedSpaces, codeElement, pattern);

                        } else {
                            source = source.replace(/[\n\r]+|([ ]+)/g, '#');

                            const match = source.replace(/[\n\r]+|([ ]+)/g, '#').match(pattern);
                            if (match) {
                                source = source.replace(pattern, '');
                            }

                            source = source.replace(/[\n\r]+|([ ]+)/g, ' ');
                        }

                        return source;
                    }

                    if (eval(`${iterator}${operator}${comparer}`.replace(/( )/g, ''))) {
                        source = replacerIn(source, data);
                    } else {
                        source = replacerIn(source, data, true);
                    }

                }
            }

            logicList = doc.querySelectorAll('[vdom-repeat]');

            if (logicList && logicList.length) {
                for (let i in logicList) {
                    codeElement = '';
                    const element = logicList[i];
                    if (!element instanceof HTMLElement || typeof (element) == 'number') break;

                    tagName = element.tagName.toLowerCase();

                    const attribute = getAttribute(element, 'vdom-repeat').split(' ');

                    const iterator = attribute[0];
                    const list = attribute[attribute.length - 1];

                    const elementCode = `<${tagName}>${element.innerHTML}</${tagName}>`;

                    if (data[list]) {
                        for (let inc = 0; inc < data[list].length; inc++) {
                            codeElement += elementCode;
                        }

                        const patternCode = codeElement.split ? codeElement.split(`<${tagName}>`)[1].split(`</${tagName}>`)[0] : '';
                        let finPatternCode = `<${tagName} vdom-repeat=("|')${iterator} in ${list}("|')>${patternCode}</${tagName}>`;

                        finPatternCode = finPatternCode.replace(/[\n\r]+|([ ]+)/g, '#');
                        pattern = new RegExp(finPatternCode, 'g');

                        codeElement = replaceCodeByLogic(codeElement, data[list], {
                            iterator: iterator,
                            data: list
                        });

                        const replacedSpaces = source.replace(/[\n\r]+|([ ]+)/g, '#');
                        let preSource = replaceFinal(replacedSpaces, codeElement, pattern);

                        preSource = preSource.replace(new RegExp("[#]+", "g"), " ");

                        source = replaceFinal(replacedSpaces, codeElement, pattern);
                    } else {
                        console.error(`Property ${list} not defined`);
                    }
                }

            }

            return source.replace(spacesRegex, " ");
        };

        const replaceCode = (str, data, proper = '', subchild = false, applied = false, subData = null) => {

            let needReplace = false;
            let source = str;

            if (subData) {
                const {
                    prop,
                    id,
                    newValue
                } = subData;

                counter++;
                data[prop][id] = newValue;
            }

            const resolveDirectives = (string, data) => {

                let sourc = string;
                let regx = '';
                let characters = ['<', '>', '==', '<=', '>=', '!=', '+', '-', '*', '/'];
                let iterator, operator, comparer, replaceStringCode;

                for (let i in directivesMatch) {
                    let dir = directivesMatch[i];

                    replaceStringCode = dir;
                    if (dir && dir.replace) {
                        dir = dir.replace(/{{/g, '').replace(/}}/g, '');
                    }

                    for (let char in characters) {
                        if (dir && dir.indexOf && dir.indexOf(characters[char]) >= 0) {
                            let resul = dir.split(characters[char]);

                            iterator = resul[0].replace(/( )/g, '');
                            operator = characters[char];
                            comparer = resul[resul.length - 1].replace(/( )/g, '');

                            break;
                        }
                    }

                    if (!operator) sourc;

                    let result = '',
                        nameIterator = iterator,
                        nameComparer = comparer;

                    if (data[iterator] != null) {
                        iterator = `data["${iterator}"]`;
                    }

                    if (data[comparer] != null) {
                        comparer = `data["${comparer}"]`;
                    }

                    result = eval(`${iterator} ${operator} ${comparer}`);

                    let finOperator = operator;
                    if (operator == '+' || operator == '/' || operator == '*') finOperator = `\\${operator}`;

                    regx = new RegExp(`(({{)(${nameIterator})( |)(${finOperator})( |)(${nameComparer})(}}))`, 'g');

                    sourc = sourc.replace(regx, result);
                }

                needReplace = true;
                return sourc;
            };

            //Comenzamos a buscar primero directivas sin resolver
            const patternDirective = /(({{)([aA-zZ]+|[0-9]+)( |)(-|\+|>|<|==|<=|>=|!=|\*|\/)( |)([aA-zZ]+|[0-9]+)(}}))/g;
            const directivesMatch = source.match(patternDirective);
            if (directivesMatch) {
                source = resolveDirectives(source, data);
            }

            //Esta en mejora todavía, no funciona bien.
            if (!applied) {
                if (needReplace) {
                    source = applyLogic(source, new DOMParser().parseFromString(source, 'text/html'), data);
                } else {
                    source = applyLogic(str, new DOMParser().parseFromString(str, 'text/html'), data);
                }
            }

            for (let prop in data) {
                if (isObject(data[prop])) {

                    source = replaceCode(source, data[prop], prop, true, true);
                } else if (subchild) {
                    let regex = undefined;

                    regex = new RegExp(`{{${proper}.${prop}}}`, 'g');
                    if (!source.match(regex)) {
                        source = replacerObject(source, data, proper, prop);
                    } else {
                        source = source.replace(regex, data[prop]);
                    }
                } else {
                    let regex = new RegExp(`{{${prop}}}`, 'g');
                    source = source.replace(regex, data[prop]);
                }
            }

            counter = 0;

            return source;
        };

        const getRandomInt = (min, max) => {
            return Math.floor(Math.random() * (max - min)) + min;
        };

        const $html = (componentName, customHTML = null) => {
            const component = new components[componentName];

            const {
                functions,
                styles,
                model,
                template,
            } = component.build();

            if (containerElement && containerElement.innerHTML != null) {
                const element = customHTML ? document.querySelector(`#${componentName}`) : document.createElement('div');

                if (!customHTML) {
                    element.id = componentName;
                }

                element.innerHTML = customHTML ? customHTML : renderComponent({
                    template,
                    model,
                    componentName,
                });

                containerElement.appendChild(element);
            }

            for (let at in attributes) {
                const attrib = attributes[at];

                $.querySelectorAll(`[${attrib}]`).forEach((element) => {
                    const attributeClick = element.getAttribute(`${attrib}`);
                    if (attributeClick) {
                        const functionToBind = functions.find((m) => m.name === 'bound ' + attributeClick.replace(`()`, ''));

                        if (functionToBind) {
                            element.addEventListener(`${attrib}`, functionToBind);
                        }
                    }
                });
            }

            for (let i in styles) {
                if (styles[i] && styles[i].element) {
                    const el = styles[i].element;
                    const elObj = $.querySelectorAll(el.selector);
                    const styleObj = el.style;

                    if (elObj && styleObj) {
                        for (let e in styleObj) {
                            for (let single in elObj) {
                                elObj[single] && elObj[single].style ?
                                    elObj[single].style[e] = styleObj[e] : '';
                            }
                        }
                    }
                }
            }
        };

        const renderComponent = (t) => {
            const {
                template,
                model,
                componentName,
            } = t;

            // TODO: Review logic to watch children props.
            const setWatches = (subProp = null, recursive = false) => {
                const m = (subProp ? subProp : model);
                for (let prop in m) {
                    if (Array.isArray(m[prop])) {
                        setWatches(m[prop], true);
                    } else {
                        const mdl = isNaN(prop) ? m : m[prop];

                        if (recursive && typeof (mdl) === 'object') {
                            for (let f in mdl) {
                                mdl.watch(f, componentName, (id, oldValue, newValue, component) => {
                                    if (counter > 0) return;

                                    const backup = Object.assign([], m);

                                    const html = replaceCode(template, backup, null, null, null, {
                                        prop,
                                        id,
                                        newValue
                                    });

                                    return $html(component, html);
                                });
                            }
                        } else {
                            mdl.watch(prop, componentName, (id, oldValue, newValue, component) => {
                                const newModel = {
                                    ...m,
                                };
                                newModel[id] = newValue;

                                const html = replaceCode(template, newModel);

                                $html(component, html);
                            });
                        }
                    }
                }
            };

            setWatches();

            return replaceCode(template, model);
        };

        if (containerElement) {
            for (let i in components) {
                $html(i);
            }
        }
    }

    $.addEventListener('DOMContentLoaded', setup);
})(spaPage);