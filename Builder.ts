import { Selector, OnlineParser } from './Jq';
import { ISelector, IObjectContructor } from './types';

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
const parseHtml = (html: string, baseUrl?: string) =>
  new Selector(html, new OnlineParser(baseUrl)) as ISelector;

class ObjectContructor<T extends {}> implements IObjectContructor<T> {
  private __jq: ISelector;
  private funs: { c: string; func: (x: ISelector) => any }[] = [];
  constructor(jg: ISelector) {
    this.__jq = jg;
  }

  field<B>(field: ((x: T) => B) | string, htmlItem: (x: ISelector) => B) {
    this.funs.push({ c: getColumns(field), func: htmlItem });
    return this;
  }

  htmlParser() {
    return this.__jq;
  }

  toList() {
   return this.__jq.map((x) => {
      var item = {} as any;
      this.funs.forEach((f) => (item[getColumns(f.c)] = f.func(x)));  
      return item as T;
    });
  }
}

export { toObject, parseHtml };
