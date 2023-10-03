const path = require('path');
const ApiDocumenter = require(`../temp/ytmusic_api_unofficial.api.json`);
const fs = require("fs");
const { copySync} = require("fs-extra");
const {join} = require("path");
const {writeFileSync} = require("fs");

const MozillaType = {
	'boolean': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean',
	'number': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number',
	'string': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String',
	'object': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object',
	'array': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
	'function': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function',
	'undefined': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined',
	'null': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null',
	'any': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/any',
	'void': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/void',
	'promise': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
	'buffer': 'https://nodejs.org/api/buffer.html',
	'date': 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date',
}
const dir = "./docs/docs";
const defaultDir = "./docs/default";
const vitepressConfig = "./docs/.vitepress/config.js";
const types = {
	Method:{
		pos:1,
		path:path.join(__dirname, `../${dir}/method/`),
		data: [],
		url: '/docs/method/',
		name: 'Methods'
	},
	Class:{
		pos:2,
		path:path.join(__dirname, `../${dir}/class/`),
		data: [],
		url: '/docs/class/',
		name: 'Classes'
	},
	Interface:{
		pos:3,
		path:path.join(__dirname, `../${dir}/interface/`),
		data: [],
		url: '/docs/interface/',
		name: 'Interfaces'
	},
	Param: {
		pos:4,
		path:path.join(__dirname, `../${dir}/param/`),
		data:[],
		url: '/docs/param/',
		name: 'Params'
	}
}
//Clear folder
try{
	fs.rmSync(dir, { recursive: true });
}catch (_){}
// Create folder
if(!fs.existsSync(dir)) fs.mkdirSync(dir);
ApiDocumenter.members[0].members.forEach(member => {
	createFile(member)
});

function createFile(member){
	const {kind, name, docComment, summary, returns, parameters, fileUrlPath, typeParameters, decorators, signatures, members} = member;
	const linkToType = types[attributeType(member)];
	if(!linkToType?.path) return //console.log(`No path for ${attributeType(kind, name)}, ${name}`);
	linkToType.data.push(member);
	if(!fs.existsSync(linkToType.path)) fs.mkdirSync(linkToType.path);
	const fileName = `${name}.md`;
	const filePath = path.join(linkToType.path, fileName);

	//if(!name.includes('downloadManager')) return 'Method'
	let fileContent = '<!-- This file is generated by a script. Do not edit directly -->\n'+
		`# ${name} - ${attributeType(member)}\n`+
		`${docComment}\n\n---\n`

	const subMembersContent = subMembers(members)

	if(subMembersContent.functions.length && subMembersContent.properties.length){
		const proprs = []
		subMembersContent.properties.forEach((prop, i) => {
			proprs.push(`[${prop.name}](#${prop.name.toLowerCase()})`)
		})
		const funcs = []
		subMembersContent.functions.forEach((func, i) => {
			funcs.push(`[${func.name}](#function-${func.name.toLowerCase()})`)
		})
		fileContent += createTab([generateDetailDisclosure('Properties', proprs.join('\n')), generateDetailDisclosure('Functions', funcs.join('\n'))])
	}else if(subMembersContent.functions.length){
		fileContent += createTab([generateDetailDisclosure('Functions', subMembersContent.functions.map(e => `[${e.name}](#function-${e.name.toLowerCase()})`).join('\n'))])
	}else if(subMembersContent.properties.length) {
		fileContent += createTab([generateDetailDisclosure('Properties', subMembersContent.properties.map(e => `[${e.name}](#${e.name.toLowerCase()})`).join('\n'))])
	}


	if(subMembersContent.functions.length){
		fileContent += `\n\n\n # Functions\n\n`
		subMembersContent.functions.forEach(func => {
			const {title, docParams} = extractDataFormDocComment(func.docComment)
			fileContent += `\n## Function ${func.name}():\n`+
				`${title || ''}\n`+
				`**Builder**:\n`+
				`\`\`\`\`javascript\n`+
				`${name}.${func.name}(${func.parameters.map(e=>e.parameterName).join(', ')})\n`+
				`\`\`\`\`\n\n`
			if(func.parameters.length) {
				fileContent += `### Parameters\n`+
					`${createTab(['Parameter', 'Type', 'Description', 'Optional'],func.parameters.map(e=>{
						return {
							parameter: e.parameterName,
							type: typeUrlGenerator(func.excerptTokens[e.parameterTypeTokenRange.endIndex-1] || {text:'any'}),
							description: docParams.find(p=>p.param === e.parameterName)?.doc || '',
							optional: e.isOptional? '✓':'𐄂'
						}
					}), [0,1,2,3])}`
			}
			fileContent += `\n\n**Returns:**\n`+
				`<span class="flex_return">${func.excerptTokens.slice(func.returnTypeTokenRange.startIndex, func.returnTypeTokenRange.endIndex).map(e=>{
					return typeUrlGenerator(e, func.returnTypeTokenRange.endIndex - func.returnTypeTokenRange.startIndex === 1)
				}).join('').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`

		})
	}
	if(subMembersContent.properties.length){

		fileContent += `\n\n\n # Properties\n\n`
		subMembersContent.properties.forEach(prop => {
			fileContent += `\n## ${prop.name}:\n`

			fileContent += `\n\n**Returns:**\n`+
				`<span class="flex_return">${prop.excerptTokens.slice(prop.propertyTypeTokenRange.startIndex, prop.propertyTypeTokenRange.endIndex).map(e=>{
					return typeUrlGenerator(e, prop.propertyTypeTokenRange.endIndex - prop.propertyTypeTokenRange.startIndex === 1)
				}).join('').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`
		})
	}

	// Save file
	fs.writeFileSync(filePath, fileContent);
}

function subMembers(members){
	const returnVal = {
		properties: [],
		functions: [],
	}

	members && members.forEach(member => {
		const {kind, name, docComment, summary, returns, parameters, fileUrlPath, typeParameters, decorators, signatures, members} = member;
		switch (kind) {
			case 'Property':
				returnVal.properties.push(member)
				break;
			case 'Function':
				returnVal.functions.push(member)
				break;
			case 'Method':
				returnVal.functions.push(member)
				break;
			default:
				break;
		}
	});
	return returnVal;

}

function createTab(header=[], properties=[], center=[]){
	let tab = '';
	header.forEach((head, i) => {
		tab += `| ${head} `
		if(i === header.length-1) {
			tab+= '|\n'
			header.forEach((head, i)=>{
				tab += `| ${center.includes(i)?':':''}---${center.includes(i)?':':''} `
				if(i === header.length-1) {
					tab += `|\n`
				}
			})
		}
	})
	properties.forEach((prop, i) => {
		header.forEach((head, i) => {
			tab += `| ${prop[head.toLowerCase()] || ''} `
		})
		tab += '|\n'
	})
	return tab;

}

function attributeType(method, v2=false){
	switch (method.kind) {
		case 'Class':
			if(method.fileUrlPath.includes('src/types')) return 'Interface'
			else return method.kind
		case 'Namespace':
			if(method.name.includes('Manager')) return 'Method'
			return method.kind
		case 'TypeAlias':
			if(method.name.includes('_param')) return 'Param'
			if(v2 && method.fileUrlPath.includes('src/types')) return 'Interface'
			else return method.kind
		default:
			return method.kind
	}
}

function extractDataFormDocComment(docComment){
	const title = docComment.match(/^(?:\W+)?\*(?:\s+)?(\w.+?)\n/gm)?.map(e=>e.replace(/^(?:\W+)?\*(?:\s+)?/gm, ''))
	const docParams = [...docComment.matchAll(/^(?:\W+)?\*(?:\s+)?@param[s]?\s(?<param>\w+)\s-\s(?<doc>.+)\n/gm)].map(e=>e.groups)
	return {title, docParams}
}

function typeUrlGenerator(type, isSingle = false){
	if(type.kind !== 'Reference') return type.text
	const TypeLower = type.text.toLowerCase();
	if(MozillaType[TypeLower]) {
		return `[${TypeLower}![Link](../assets/img/external_link.svg)](${MozillaType[TypeLower]})`
	}else {
		const dt = ApiDocumenter.members[0].members.find(e=>e.canonicalReference.includes(`~${type.text}:`))
		if(dt && attributeType(dt, true)){
			return `[${type.text}](${path.join(types[attributeType(dt, true)].url, type.text)})`
		}else return `[${type.text}![Link](../assets/img/external_link.svg)](https://www.google.com/search?q=${type.text})`
	}
}

function generateDetailDisclosure(title, content){
	title = title.replace(/\n/g, '<br>')
	content = content.replace(/\n/g, '<br>')
	return `<details open><summary>${title}</summary><p>${content}</p></details>`
}
copySync(defaultDir, dir, { overwrite: true });
generateSidebar()
function generateSidebar(){
	const version = require('../package.json').version
	const sidebar = `- **Version: ${version}**\n` +
		'- [Introduction](README)\n' +
		'- **Methods**' +
		types.Method.data.map(m => `\n  - [${m.name}](/method/${m.name})`).join('') +
		'\n- **Classes**' +
		types.Class.data.map(c => `\n  - [${c.name}](/class/${c.name}.md)`).join('') +
		'\n- **Interfaces**' +
		types.Interface.data.map(t => `\n  - [${t.name}](/interface/${t.name}.md)`).join('') +
		'\n- **Links**\n' +
		'- [![Github](/assets/img/github.svg)Github](https://github.com/Alexis06030631/ytmusic_api/)\n' +
		'- [![NPM](/assets/img/npm.svg)NPM](https://www.npmjs.com/package/ytmusic_api_unofficial)\n' +
		'- [![Instagram](/assets/img/instagram.svg)@Leko_system](https://instagram.com/leko_system)'

	//writeFileSync(join(dir, 'sidebar.md'), sidebar)

	// Open vitepressConfig file
	let config = fs.readFileSync(vitepressConfig, 'utf8')
	eval('var obj='+config.replace(/export default /g, '').replace(/;/, ''))
	config = obj

	// Replace sidebar
	config.themeConfig.sidebar = []
	Object.keys(types).forEach(key => {
		config.themeConfig.sidebar.push({
			text: types[key].name,
			items: types[key].data.map(e => {
				return {
					text: e.name,
					link: `${types[key].url}${e.name}`
				}
			})
		})
	})

	// Save file
	fs.writeFileSync(vitepressConfig, `export default ${JSON.stringify(config, null, 2)}`);
}