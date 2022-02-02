"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translate = exports.parseHtml = exports.toObject = void 0;
const Jq_1 = require("./Jq");
const isFunc = (value) => {
    return value.toString().indexOf('function') !== -1;
};
const getColumns = (fn) => {
    if (!isFunc(fn))
        return fn;
    var str = fn.toString();
    if (str.indexOf('.') !== -1) {
        str = str.substring(str.indexOf('.') + 1);
    }
    if (str.indexOf('[') !== -1) {
        str = str.substring(str.indexOf('[') + 1);
    }
    str = str
        .replace(/\]|'|"|\+|return|;|\.|\}|\{|\(|\)|function| /gim, '')
        .replace(/\r?\n|\r/g, '');
    return str;
};
const toObject = (jg) => new ObjectContructor(jg);
exports.toObject = toObject;
const parseHtml = (html, baseUrl) => new Jq_1.Selector(html, new Jq_1.OnlineParser(baseUrl));
exports.parseHtml = parseHtml;
const translate = (config) => {
    var funs = [];
    for (var item of config) {
        var searchPath = {};
        var jqPath = '';
        var selectors = item.path.split('&');
        for (var str of selectors) {
            var props = str.split('=');
            var key = props[0];
            var value = props[props.length - 1];
            switch (key) {
                case 's':
                    jqPath += `.select('${value}')`;
                    break;
                case 'f':
                    jqPath += `.find('${value}')`;
                    break;
                case 'te':
                    jqPath += `.text(${value})`;
                    break;
                case 'at':
                    jqPath += `.attr('${value}')`;
                    break;
                case 'ch':
                    jqPath += `.cleanInnerHTML()`;
                    break;
                case 'ih':
                    jqPath += `.innerHTML()`;
                    break;
                case 'oh':
                    jqPath += `.outerHTML()`;
                    break;
                case 'pa':
                    jqPath += `.parent()`;
                    break;
                case 'eq':
                    jqPath += `.eq(${value})`;
                    break;
                case 'ft':
                    jqPath += `.eq(0)`;
                    break;
                case 'lt':
                    jqPath += `.last()`;
                    break;
                case 'ct':
                    jqPath += `.closest('${value}')`;
                    break;
                case 'ul':
                    jqPath += `.url()`;
                    break;
            }
        }
        if (!item.nested)
            funs.push({ c: item.column, funcString: 'x' + jqPath });
        else {
            jqPath += `.map(function(a) {
          return {
            ${translate(item.nested)
                .map((x) => `${x.c} : a${x.funcString.substring(1)}`)
                .join(',')}
            } 
          })`;
            funs.push({ c: item.column, funcString: 'x' + jqPath, isArray: item.isArray });
        }
    }
    return funs;
};
exports.translate = translate;
class ObjectContructor {
    constructor(jg) {
        this.funs = [];
        this.__jq = jg;
    }
    field(field, htmlItem) {
        this.funs.push({ c: getColumns(field), func: htmlItem });
        return this;
    }
    translate(config) {
        translate(config).forEach((x) => {
            var fn = new Function('x', 'return ' + x.funcString);
            this.funs.push({
                c: x.c,
                func: fn,
                isArray: x.isArray,
            });
        });
        return this;
    }
    htmlParser() {
        return this.__jq;
    }
    toList() {
        return this.__jq.map((x) => {
            var item = {};
            this.funs.forEach((f) => {
                var value = f.func(x);
                if (f.isArray === undefined || f.isArray === true)
                    item[getColumns(f.c)] = value;
                else
                    item[getColumns(f.c)] = value.length > 0 ? value[0] : undefined;
            });
            return item;
        });
    }
}
//# sourceMappingURL=Builder.js.map