const fs = require('fs/promises');
const xml2js = require('xml2js').parseStringPromise;

async function readXmlFile() {
    const data = await fs.readFile('./poc-migration/poc-migration.csproj', 'utf-8');
    return data;
}

async function convertXmlToJson(xml) {
    const json = await xml2js(xml);
    return json;
}

function getCsFiles(json) {
    const itemCs = json["Project"]["ItemGroup"][1]["Compile"]
        .filter((item) => {
            return !item["$"]["Include"].match(/(.Designer.|.designer.)/) && item["$"]["Include"].startsWith(`Migrations`);
        })
        .map((item) => item["$"]["Include"]);
     return itemCs;
}
function getCsDesingFiles(json) {
    const itemCs = json["Project"]["ItemGroup"][1]["Compile"]
        .filter((item) => item["$"]["Include"].match(/(.Designer.|.designer.)/)  && item["$"]["Include"].startsWith(`Migrations`))
        .map((item) => item["$"]["Include"]);
     return itemCs;
}
function getEEmbeddedResource(json) {
    return json["Project"]["ItemGroup"][4]["EmbeddedResource"].map((item) => { return item["$"]["Include"]; })
}




async function main() {
    const xml = await readXmlFile();
    const json = await convertXmlToJson(xml);
    const itemCs = getCsFiles(json)
    const itemDesingCs = getCsDesingFiles(json)
    const embeddedResource = getEEmbeddedResource(json);
    const error = {};

    ignore = ['Migrations\\Configuration.cs'];
    
    let notFound = itemCs.some((item) => {

    const [name, surename] = item.split('.');
        let foundDesing= itemDesingCs.find((itemDesing) => {
            return itemDesing.toUpperCase() === `${name}.Designer.${surename}`.toUpperCase();
        })

        let foundEmbedded = embeddedResource.find((itemEmbedded) => {
            return itemEmbedded.toUpperCase() === `${name}.resx`.toUpperCase();
        })

        if(foundDesing && foundEmbedded || item.includes(ignore)) {
            return false;
        }
        
        if(!foundDesing) {
            error["message"] = `${name}.Designer.${surename} Designer not found`;
        }

        if(!foundEmbedded) {
            error["message"] = `${name}.resx Embedded not found`;
        }

        return true;
    })

    if(notFound) {
        console.error(error.message);
        process.exit(1); 
    }
}

main();