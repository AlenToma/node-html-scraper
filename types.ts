export interface ISelector {
  /** find(querySelectorAll) items by its selector. available selector is css5  */
  find: (selector: string) => ISelector;
    /** find(querySelector) an item by its selector. available selector is css5  */
  select: (selector: string) => ISelector;
    /** get  closest by selector */
  closest: (selector: string) => ISelector;
   /** get attr of the element, eg .attr("title|alt").text()
    * This will try to find "title" if it failed or its empty it will try "alt" instead.
    */
  attr: (selector: string) => ISelector;
     /** get the full url. if the attr is full url then return it or return the baseurl/attr value
      * eg .attr("src").url()
       */
  url: () => string;
   /** get the last element of the selected items */
  last: () => ISelector;
   /** get the selected text, this differ from innerhtml as the text will be cleaned */
  text: (structuredText?: boolean) => string;
   /** selected node value  */
  nodeValue: () => string | undefined;
   /** attr value without changing it  */
  attValue: () => string | undefined;
    /** remove script, style , input etc and clean the html object before returned it  */
  cleanInnerHTML: () => string;
    /** the orginal innerhtml without changing it  */
  innerHTML: () => string;
   /** the orginal outerhtml without changing it  */
  outerHTML: () => string;
     /** return all innertext of the selected items  */
  textArray: () => string[];
     /** the selected attr has value  */
  hasValue: () => boolean;
     /** the selected element exists  */
  hasElement: () => boolean;
    /** the selected elements exists  */
  hasElements: () => boolean;
    /** length of the selected elements  */
  length:()=> number;
    /** remove selected items. available selector is css5   */
  remove: (selector: string) => ISelector;
     /** loop throw each item  */
  forEach:<T>(func: (jq: ISelector, index?: number, arr?: T[]) => void)=> void;
     /** loop throw each item and do a manual seach  */
  where:<T>(func: (jq: ISelector, index?: number, arr?: T[]) => boolean) => ISelector;
     /** loop throw each item and return the desire extracted result   */
  map:<T>(func: (jq: ISelector, index?: number, arr?: T[]) => T) => T[];
  reduce: <T>(func: (itemType: any, jq: ISelector, index?: number, arr?: T[]) => void,itemType: any) => any;
       /** parent of the selected item   */
  parent:()=> ISelector;
     /** find at index of the selected items   */
  eq: (index: number) => ISelector;
       /** children of the selected item   */
  children: ()=> ISelector;

  toObject:<T extends {}>() => IObjectContructor<T>
}

export interface IObjectConfig {
column: string;
path: string;
isArray?: boolean; 
nested?: IObjectConfig[];
}

export interface IObjectContructor<T extends {}>{
   /** Assign a value to a field eg field(x=> x.name, x=> x.select(".title").text());   */
  field:<B>(field: ((x: T) => B) | string, htmlItem: (x: ISelector) => B) => IObjectContructor<T>;
  /** translate  IObjectConfig to object  */
  translate: (config: IObjectConfig[]) => IObjectContructor<T>;
    /** the result of the parsed item   */
  toList:() => T[]; 
}

