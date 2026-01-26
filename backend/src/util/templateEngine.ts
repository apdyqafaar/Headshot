import fs from "fs/promises"
import path from "path"

const templatesDir=path.join(process.cwd(), "src/templates/emails")

// interpolate or change the content
function interpolate(template:string, data:Record<string, any>):string{
 return template.replace(/{{(.*?)}}/g, (match, key)=>(
    data[key] !==undefined?data[key]:match
 ))
}



// render html template
async function renderHTML(templateName:string, data:Record<string, any>):Promise<string> {
    const templatePathName=path.join(templatesDir, templateName+".html")
    const template=await fs.readFile(templatePathName, "utf-8")
    return interpolate(template, data)
}

// render text template
async function renderTEXT(templateName:string, data:Record<string, any>):Promise<string> {
    const templatePathName=path.join(templatesDir, templateName+".txt")
    const template=await fs.readFile(templatePathName, "utf-8")
    return interpolate(template, data)
}

export const templateEngine={
    renderHTML, renderTEXT
}