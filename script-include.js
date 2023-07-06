const fs = require('fs/promises');
const xml2js = require('xml2js').parseStringPromise;

async function readXmlFile() {
    const data = await fs.readFile('./test.xml', 'utf-8');
    return data;
}

async function convertXmlToJson(xml) {
    const json = await xml2js(xml);
    return json;
}

function getCsFiles(json) {
    const itemCs = json["Project"]["ItemGroup"][1]["Compile"].filter((item) => {{
        if(!item["$"]["Include"].match(/(.Designer.|.designer.)/))  {
             return item["$"]["Include"];
        }
     }}).map((item) => { return item["$"]["Include"]; });
     return itemCs;
}
function getEEmbeddedResource(json) {
    return json["Project"]["ItemGroup"][4]["EmbeddedResource"].map((item) => { return item["$"]["Include"]; })
}




async function main() {
    const xml = await readXmlFile();
    const json = await convertXmlToJson(xml);
    const itemCs = getCsFiles(json)
    const embeddedResource = getEEmbeddedResource(json);
    console.log(embeddedResource);
}

main();