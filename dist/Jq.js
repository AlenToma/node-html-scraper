"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Selector = exports.OnlineParser = void 0;
const Builder_1 = require("./Builder");
const advanced_html_parser_1 = __importDefault(require("advanced-html-parser"));
const isEmptyOrSpaces = (str) => {
    return !str || str === null || str.match(/^ *$/) !== null || str.length <= 0;
};
const parse = (html) => {
    try {
        return advanced_html_parser_1.default.parse('<div>' + html + '</div>', 'text/html').documentElement;
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
const findAt = (item, index) => {
    if (!item)
        return undefined;
    if (index < 0 || index >= item.length)
        return undefined;
    return item[index];
};
const last = (item) => {
    return (item && item.length != undefined && item.length > 0 ? item[item.length - 1] : undefined);
};
const single = (item) => {
    return (item && item.length > 0 ? item[0] : undefined);
};
class OnlineParser {
    constructor(homePage) {
        this.homePage = homePage;
    }
    attr(selector, el) {
        var _a, _b;
        return (_b = (_a = el === null || el === void 0 ? void 0 : el.getAttribute) === null || _a === void 0 ? void 0 : _a.call(el, selector)) !== null && _b !== void 0 ? _b : '';
    }
    uurl(str) {
        var url = str;
        if (isEmptyOrSpaces(url) || isEmptyOrSpaces(this.homePage))
            return str !== null && str !== void 0 ? str : "";
        url = url === null || url === void 0 ? void 0 : url.trim();
        if (url) {
            if (url.startsWith('https') || url.startsWith('http') || url.startsWith('www'))
                return url;
            if (url.startsWith('//'))
                return 'https:' + url;
            if (url.startsWith('/'))
                url = url.substring(1);
        }
        if (this.homePage && this.homePage.endsWith('/'))
            this.homePage = this.homePage.slice(0, -1);
        return this.homePage + '/' + url;
    }
    innerHTML(el) {
        var _a;
        return (_a = el === null || el === void 0 ? void 0 : el.innerHTML) !== null && _a !== void 0 ? _a : '';
    }
    outerHTML(el) {
        var _a;
        return (_a = el === null || el === void 0 ? void 0 : el.outerHTML) !== null && _a !== void 0 ? _a : '';
    }
    text(el, structuredText) {
        var _a, _b, _c;
        var htmlOrText = (_a = el === null || el === void 0 ? void 0 : el.innerHTML) !== null && _a !== void 0 ? _a : "";
        if (!htmlOrText || htmlOrText.trim() == '')
            return '';
        if (!/(<([^>]+)>)/gi.test(htmlOrText))
            return htmlOrText
                .replace(/(?=&)(.*?)(;)/g, '')
                .replace(/^[ ]+/g, '')
                .replace(/(?:\r\n|\r|\n)/g, '')
                .trim();
        if (structuredText === false)
            return (_b = parse(`<div>${htmlOrText}</div>`)
                .innerText().trim()) === null || _b === void 0 ? void 0 : _b.replace(/(?=&)(.*?)(;)/g, '').replace(/^[ ]+/g, '');
        return (_c = parse(`<div>${htmlOrText}</div>`)
            .text().trim()) === null || _c === void 0 ? void 0 : _c.replace(/(?=&)(.*?)(;)/g, '').replace(/^[ ]+/g, '');
    }
}
exports.OnlineParser = OnlineParser;
class Selector {
    constructor(element, onlineParser, value) {
        if (typeof element === "string")
            element = parse(element);
        this.element = Array.isArray(element) && !element.map ? Array.from(element) : element;
        if (this.element && this.element.select)
            this.element = this.element.element;
        this.onlineParser = onlineParser;
        this.value = value;
    }
    find(selector) {
        var el = this.element;
        if (el) {
            if ((el).querySelectorAll)
                el = Array.from(el.querySelectorAll(selector));
            else if (el.forEach) {
                el = Array.from(el).map((x) => x.querySelectorAll(selector)).find(x => x.length > 0);
            }
        }
        return new Selector(el, this.onlineParser);
    }
    toObject() {
        var item = (0, Builder_1.toObject)(this);
        return item;
    }
    closest(selector) {
        var el = this.element;
        if (el) {
            if (el.closest)
                el = el.closest(selector);
            else if (el.forEach) {
                el = Array.from(el)
                    .map((x) => x.closest(selector))
                    .find((x) => x && x != null);
            }
        }
        return new Selector(el, this.onlineParser);
    }
    select(selector) {
        var el = this.element;
        if (el) {
            if (el.querySelector)
                el = el.querySelector(selector);
            else if (el.forEach) {
                el = Array.from(el)
                    .map((x) => x.querySelector(selector))
                    .find((x) => x && x != null);
            }
        }
        return new Selector(el, this.onlineParser);
    }
    attr(selector) {
        var value = this.value;
        var selectors = selector.split('|').filter((x) => !isEmptyOrSpaces(x));
        selectors.forEach((x) => {
            if ((!value || isEmptyOrSpaces(value)) && x.length > 0)
                if (this.element) {
                    if (Array.isArray(this.element))
                        value = this.onlineParser.attr(x.trim(), findAt(this.element, 0));
                    else
                        value = this.onlineParser.attr(x.trim(), this.element);
                }
        });
        return new Selector(this.element, this.onlineParser, value);
    }
    url() {
        return this.onlineParser.uurl(this.value);
    }
    last() {
        var el = this.element;
        if (el) {
            if (Array.isArray(el))
                el = last(this.element);
        }
        return new Selector(el, this.onlineParser, this.value);
    }
    text(structuredText) {
        if (!this.value) {
            if (this.element && Array.isArray(this.element))
                return this.element
                    .map((x) => this.onlineParser.text(x, structuredText))
                    .join(',');
            return this.onlineParser.text(this.element, structuredText);
        }
        return this.value.toString();
    }
    nodeValue() {
        if (this.element && this.element.nodeValue != undefined)
            return this.element.nodeValue;
        return undefined;
    }
    attValue() {
        return this.value;
    }
    clone() {
        var el = Array.isArray(this.element) ? (this.length() > 1 ? this.parent().element : this.element[0]) : this.element;
        if (el)
            return new Selector(el.cloneNode(true), this.onlineParser);
        return null;
    }
    cleanInnerHTML() {
        var node = this.clone();
        if (node)
            return node.remove('script, style, input').innerHTML();
        return "";
    }
    innerHTML() {
        if (!this.value || this.value == '') {
            if (this.element && Array.isArray(this.element))
                return this.element
                    .map((x) => this.onlineParser.innerHTML(x))
                    .join(',');
            return this.onlineParser.innerHTML(this.element);
        }
        return this.value.toString();
    }
    outerHTML() {
        if (!this.value || this.value == '') {
            if (this.element && Array.isArray(this.element))
                return this.element
                    .map((x) => this.onlineParser.outerHTML(x))
                    .join(',');
            return this.onlineParser.outerHTML(this.element);
        }
        return this.value.toString();
    }
    textArray() {
        if (!this.value || this.value == '') {
            if (this.element && Array.isArray(this.element))
                return this.element
                    .map((x) => this.onlineParser.text(x, false))
                    .filter((x) => x && x != '');
            return [this.onlineParser.text(this.element, false)].filter((x) => x && x != '');
        }
        return [this.value.toString()].filter((x) => x && x != '');
    }
    hasValue() {
        if (this.value && this.value != '' && !isEmptyOrSpaces(this.value))
            return true;
        return false;
    }
    hasElement() {
        return this.element != null && this.element ? true : false;
    }
    hasElements() {
        return (this.element != null &&
            this.element &&
            this.element.length != undefined &&
            this.element.length > 0);
    }
    length() {
        return this.element && this.element.length != undefined
            ? this.element.length
            : 0;
    }
    remove(selector) {
        var el = [];
        if (this.element) {
            if (Array.isArray(this.element))
                el = this.element;
            else
                el = [this.element];
        }
        el.forEach((x) => {
            if (x.querySelectorAll)
                x.querySelectorAll(selector).forEach((a) => a.remove());
        });
        return new Selector(this.element, this.onlineParser, this.value);
    }
    forEach(func) {
        var el = [];
        if (this.element) {
            if (Array.isArray(this.element))
                el = this.element;
            else
                el = [this.element];
        }
        el.forEach((x, index, arr) => {
            func(new Selector(x, this.onlineParser), index, arr);
        });
        return this;
    }
    map(func) {
        var el = [];
        if (this.element) {
            if (Array.isArray(this.element))
                el = this.element;
            else
                el = [this.element];
        }
        return el
            .map((x, index, arr) => {
            return func(new Selector(x, this.onlineParser), index, arr);
        })
            .filter((x) => x);
    }
    reduce(func, itemType) {
        var el = [];
        if (this.element) {
            if (Array.isArray(this.element))
                el = this.element;
            else
                el = [this.element];
        }
        el.forEach((x, index) => {
            func(itemType, new Selector(x, this.onlineParser), index);
        });
        return itemType;
    }
    where(func) {
        var el = [];
        if (this.element) {
            if (Array.isArray(this.element))
                el = this.element;
            else
                el = [this.element];
        }
        return new Selector(el.filter((x, index, arr) => func(new Selector(x, this.onlineParser), index, arr)), this.onlineParser, this.value);
    }
    parent() {
        var _a;
        var el = this.element;
        if (el) {
            if (Array.isArray(el))
                el = (_a = findAt(el, 0)) === null || _a === void 0 ? void 0 : _a.parentNode;
            else
                el = el.parentNode;
        }
        return new Selector(el, this.onlineParser);
    }
    eq(index) {
        if (this.length() > 0 && index < this.length())
            return new Selector(this.element[index], this.onlineParser);
        return this;
    }
    children() {
        var _a, _b, _c;
        var el = this.element;
        if (el) {
            if (Array.isArray(el))
                el = Array.from((_b = (_a = findAt(el, 0)) === null || _a === void 0 ? void 0 : _a.children) !== null && _b !== void 0 ? _b : []);
            else
                el = Array.from((_c = el.children) !== null && _c !== void 0 ? _c : []);
        }
        return new Selector(el, this.onlineParser);
    }
}
exports.Selector = Selector;
//# sourceMappingURL=Jq.js.map