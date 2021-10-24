import { Selector, OnlineParser } from './Jq';
import { ISelector, IObjectContructor, IObjectConfig } from './types';

const isFunc = (value: any) => {
  return value.toString().indexOf('function') !== -1;
};

const getColumns = (fn: any) => {
  if (!isFunc(fn)) return fn;
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

const toObject = <T>(jg: ISelector) =>
  new ObjectContructor<T>(jg) as IObjectContructor<T>;
const parseHtml = (html: string, baseUrl?: string) => new Selector(html, new OnlineParser(baseUrl)) as ISelector;

const translate = (config: IObjectConfig[]) => {
  var funs: { c: string; funcString: string; isArray?: boolean }[] = [];
  for (var item of config) {
    var searchPath = {} as any;
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
    if (!item.nested) funs.push({ c: item.column, funcString: 'x' + jqPath });
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

class ObjectContructor<T extends {}> implements IObjectContructor<T> {
  private __jq: ISelector;
  private funs: {
    c: string;
    func: (x: ISelector) => any;
    isArray?: boolean;
  }[] = [];
  constructor(jg: ISelector) {
    this.__jq = jg;
  }

  field<B>(field: ((x: T) => B) | string, htmlItem: (x: ISelector) => B) {
    this.funs.push({ c: getColumns(field), func: htmlItem });
    return this;
  }

  translate(config: IObjectConfig[]) {
    translate(config).forEach((x) => {
      var fn = new Function('x', 'return ' + x.funcString) as (
        x: ISelector
      ) => any;
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
      var item = {} as any;
      this.funs.forEach((f) => {
        var value = f.func(x);
        if (f.isArray === undefined ||f.isArray === true ) item[getColumns(f.c)] = value;
        else   item[getColumns(f.c)] =  value.length >0 ? value[0] : undefined
      });
      return item as T;
    });
  }
}

export { toObject, parseHtml, translate };
