import { parse as htmlParse } from 'node-html-parser';
import {ISelector} from './types'
import {toObject} from './Builder'
const DomParser = require('react-native-html-parser').DOMParser
const isEmptyOrSpaces =(str?: string | null)=>{
  return !str || str === null || str.match(/^ *$/) !== null || str.length <= 0;
}

const parse = (html: string) => {
    try {
      var h = new DomParser().parseFromString('<div>' + html + '</div>', 'text/html');
      return htmlParse(h);
    } catch (error) {
      console.log(error)
    }
   return htmlParse(html);
  }

const findAt=<T>(item: any, index: number)=>{
  if (!item)
    return undefined as any;
  if (index < 0 || index >= item.length)
    return undefined as any;

  return item[index] as T;
}

const last=<T>(item: any)=> {
    return (item && item.length != undefined && item.length>0 ? item[item.length - 1] : undefined) as T;
}

const single=<T>(item: any)=> {
  return (item && item.length > 0 ? item[0] : undefined) as T;
}
export class OnlineParser {
  homePage?: string;
  constructor(homePage?: string) {
    this.homePage = homePage;
  }
  
  attr(selector: string, el?: Element | null) {
    return el?.getAttribute?.(selector) ?? '';
  }

  uurl(str?: string | null) {
    var url = str;
    if (isEmptyOrSpaces(url) || isEmptyOrSpaces(this.homePage)) return str ?? "";

    url = url.trim();
    if (url.startsWith('https') || url.startsWith('http') || url.startsWith('www'))
      return url;

    if (url.startsWith('//')) return 'https:' + url;
    if (url.startsWith('/')) url = url.substring(1);
    if (this.homePage && this.homePage.endsWith('/')) this.homePage = this.homePage.slice(0, -1);
    return this.homePage + '/' + url; // relative url
  }

  innerHTML(el?: HTMLElement | null) {
    return el?.innerHTML ?? '';
  }

  outerHTML(el?: HTMLElement | null) {
    return el?.outerHTML ?? '';
  }

  text(el?: HTMLElement | null, structuredText?: boolean) {
    var htmlOrText = el?.innerHTML?? ""
    if (!htmlOrText || htmlOrText.trim() == '') return '';
    if (!/(<([^>]+)>)/gi.test(htmlOrText))
      return htmlOrText
        .replace(/(?=&)(.*?)(;)/g, '')
        .replace(/^[ ]+/g, '')
        .replace(/(?:\r\n|\r|\n)/g, '')
        .trim();
    htmlOrText = htmlOrText.replace(/h5>|h1>|h2>|h3>|h4>|h6>|li>/g, 'p>');
    if (structuredText === false)
      return parse(`<div>${htmlOrText}</div>`)
        .innerText.trim()
        ?.replace(/(?=&)(.*?)(;)/g, '')
        .replace(/^[ ]+/g, '');
    return parse(`<div>${htmlOrText}</div>`)
      .structuredText.trim()
      ?.replace(/(?=&)(.*?)(;)/g, '')
      .replace(/^[ ]+/g, '');
  }
}

export class Selector implements ISelector {
  element?: any;
  value?: string;
  onlineParser: OnlineParser;
  constructor(element: any, onlineParser: OnlineParser, value?: any) {
    if (typeof element === "string")
        element = parse(element);
    this.element = Array.isArray(element) && !element.map ? Array.from(element) : element;
    if (this.element && this.element.select)
      this.element = this.element.element;
    this.onlineParser = onlineParser;
    this.value = value;
  }

  find(selector: string) {
    var el = this.element;
    if (el) {
      if (el.querySelectorAll) el = Array.from(el.querySelectorAll(selector));
      else if (el.forEach) {
        el = Array.from(el).map((x: any) => x.querySelectorAll(selector));
      }
    }

    return new Selector(el, this.onlineParser);
  }

  toObject<T extends {}>(){
   return toObject<T>(this);
  }

  closest(selector: string) {
    var el = this.element;
    if (el) {
      if (el.closest) el = el.closest(selector);
      else if (el.forEach) {
        el = Array.from(el)
          .map((x: any) => x.closest(selector))
          .find((x) => x && x != null);
      }
    }

    return new Selector(el, this.onlineParser);
  }

  select(selector: string) {
    var el = this.element;
    if (el) {
      if (el.querySelector) el = el.querySelector(selector);
      else if (el.forEach) {
        el = Array.from(el)
          .map((x: any) => x.querySelector(selector))
          .find((x) => x && x != null);
      }
    }

    return new Selector(el, this.onlineParser);
  }

  attr(selector: string) {
    var value = this.value;
    var selectors = selector.split('|').filter((x) => !isEmptyOrSpaces(x));
    selectors.forEach((x) => {
      if ((!value || isEmptyOrSpaces(value)) && x.length > 0)
        if (this.element) {
          if (Array.isArray(this.element))
            value = this.onlineParser.attr(x.trim(), findAt(this.element,0));
          else value = this.onlineParser.attr(x.trim(), this.element);
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
      if (Array.isArray(el)) el = last(this.element)
    }
    return new Selector(el, this.onlineParser, this.value);
  }

  text(structuredText?: boolean) {
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
    if (this.element && this.element.nodeValue != undefined) return this.element.nodeValue;
    return undefined;
  }

  attValue() {
    return this.value;
  }

  cleanInnerHTML() {
    var value = this.outerHTML();
    if (value) {
      return new Selector(parse(value), this.onlineParser)
        .remove('script, style, input')
        .innerHTML();
    }
    return value;
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
      return [this.onlineParser.text(this.element, false)].filter(
        (x) => x && x != ''
      );
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
    return (
      this.element != null &&
      this.element &&
      this.element.length != undefined &&
      this.element.length > 0
    );
  }

  length() {
    return this.element && this.element.length != undefined
      ? this.element.length
      : 0;
  }

  remove(selector: string) {
    var el = [];
    if (this.element) {
      if (Array.isArray(this.element)) el = this.element;
      else el = [this.element];
    }

    el.forEach((x: any) => {
      if (x.querySelectorAll)
        x.querySelectorAll(selector).forEach((a: any) => a.remove());
    });

    return new Selector(this.element, this.onlineParser, this.value);
  }

  forEach<T>(func: (jq: Selector, index?: number, arr?: T[]) => void) {
    var el = [];
    if (this.element) {
      if (Array.isArray(this.element)) el = this.element;
      else el = [this.element];
    }

    el.forEach((x, index, arr) => {
      func(new Selector(x, this.onlineParser), index, arr);
    });
    return this;
  }

  map<T>(func: (jq: Selector, index?: number, arr?: T[]) => T) {
    var el = [];
    if (this.element) {
      if (Array.isArray(this.element)) el = this.element;
      else el = [this.element];
    }

    return el
      .map((x, index, arr) => {
        return func(new Selector(x, this.onlineParser), index, arr);
      })
      .filter((x) => x);
  }

  reduce<T>(
    func: (itemType: any, jq: Selector, index?: number, arr?: T[]) => void,
    itemType: any
  ) {
    var el = [];
    if (this.element) {
      if (Array.isArray(this.element)) el = this.element;
      else el = [this.element];
    }

    el.forEach((x, index) => {
      func(itemType, new Selector(x, this.onlineParser), index);
    });

    return itemType;
  }

  where(func: (jq: Selector, index?: number, arr?: any) => boolean) {
    var el = [];
    if (this.element) {
      if (Array.isArray(this.element)) el = this.element;
      else el = [this.element];
    }

    return new Selector(
      el.filter((x, index, arr) =>
        func(new Selector(x, this.onlineParser), index, arr)
      ),
      this.onlineParser,
      this.value
    );
  }

  parent() {
    var el = this.element;
    if (el) {
      if (Array.isArray(el)) el = findAt<HTMLElement>(el, 0)?.parentElement;
      else el = el.parentElement;
    }
    return new Selector(el, this.onlineParser);
  }

  eq(index: number) {
    if (this.length() > 0 && index < this.length())
      return new Selector(this.element[index], this.onlineParser);
    return this;
  }

  children() {
    var el = this.element;
    if (el) {
      if (Array.isArray(el))
        el = Array.from(findAt<HTMLElement>(el,0)?.children ?? []);
      else el = Array.from(el.children ?? []);
    }
    return new Selector(el, this.onlineParser);
  }
}
