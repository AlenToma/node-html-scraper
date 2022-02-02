const should = require('should');
const parseHTML = require("./").default.parseHtml;
console.log(parseHTML)
const DomParser = require('advanced-html-parser')
describe('HTML Parser', function () {
    var html = `<div id="chapter-container" class="chapter-content font_roboto" itemprop="description" style="font-size: 16px;">
    <p>  khasdkljasldkj</p>
    <script> lkjadlkjasd </script>
    </div>`;

    var container = DomParser.parse('<div>' + html + '</div>').documentElement;
    const doc = parseHTML(container)

    console.log(doc.find(".chapter-content").text(true));
    //doc.documentElement.toString().should.eql(html);
});