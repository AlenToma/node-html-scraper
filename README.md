# node-html-scraper
This is a typescript library that will help you parser, search and scrap data from html.
with this library it will be very easy to convert the html to json with a very little code.

## Installation
```sh
npm i node-html-scraper
```

## Usage

```js
interface ITest {
  name: string;
  image: string;
  children: IChild[];
}

interface IChild {
  name: any;
}

```

```js
import {toObject, parseHtml} from 'node-html-scraper'
var url = "www.google.se";
var fetchedHtml=`<html>
<div class="item">
<p class="title">Item header 1</p>
<img src="/test.png" />
<ul>
<li>item 1</li>
<li>item 2</li>
</ul>
</div>
<div class="item">
<p class="title">Item header 2</p> 
<img src="/test2.png" />
<ul>
<li>item 1</li>
<li>item 2</li>
</ul>
</div>
</html>`
// we add the url here is to be able to complete the image src if its a relative path.
var parsedHtml = parseHtml(fetchedHtml, url);
var items = toObject<ITest>(htmlParser.find(".item"))
            .field(x => x.name, a => a.select('.title').text())
            .field(x=> x.image, x=> x.select("img").attr("src").url())   
            .field(x => x.children, x => x.find("ul > li").map(m=> { 
                 return {
                     name: m.text(),  
                 };
                })
            ).toList();  
        console.log(item);  
```

### Result 
This is how items will look like when its returned

```json
▼0:
name:"Item header 1"
image:"www.google.se/test.png"
▼children:
►0:{name:"item 1"}
►1:{name:"item 2"}

▼1:
name:"Item header 2"
image:"www.google.se/test2.png"
▼children:
►0:{name:"item 1"}
►1:{name:"item 2"}
```

## ISelector

```ts
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

```