import { ISelector, IObjectContructor } from '../src/types'


declare namespace Parser {
    const parseHtml: (html: string, baseUrl: string) => ISelector;
    const toObject: <T>(jq: ISelector) => IObjectContructor<T>;
}

export default Parser;