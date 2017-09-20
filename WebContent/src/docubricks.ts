/**
 * Deserialisation from XML
 * 
 * The following methods tidy up the common code required to create objects from their XML representation.
 */
 
const libxml = require("libxmljs");
const assert = require('assert');

interface CopiableFromXML {
	// All the DocuBricks types should implement this so they can be reconstituted from XML
    copyFromXML(xml: libxml.Element): void;
}
/*
function tagsFromXML(tag: string, xml: XMLDict, allowEmpty: boolean=true): Array<string|XMLDict>{
	// Retrieve the contents of the tags with a given name (tag) from the supplied XML
    if(tag=="$"){
        throw(Error("Error: the $ tag is reserved, you can't use it."));
    }
    if(xml[tag] == null){
        if(allowEmpty){
            return new Array<string|XMLDict>();
        }else{
            throw(Error("Error: there were no '"+tag+"' tags, and they are required."));
        }
    }
    return xml[tag] as Array<string|XMLDict>;
}
function tagFromXML(tag: string, xml: XMLDict): XMLDict|string|null{
    //extract the value of a tag from a parsed XML string - there should not be >1 tag present with that name.
    let tags = tagsFromXML(tag, xml);
    if(tags.length > 1){
        throw Error("Attempted to extract "+tag+" from XML but multiple tags existed");
    }
    if(tags.length < 0){
        return null;
    }
    return tags[0];
}
function stringFromXML(tag: string, xml: XMLDict, def: string|null=""): string{
	// retrieve the contents of a tag as a string (i.e. the tag shouldn't contain other tags)
    let element = tagFromXML(tag, xml);
    if(element == null){
        if(def != null){
            return def;
        }else{
            throw(Error("Error: there was no '"+tag+"' tag, and one is required."));
        }
    }
    if(typeof element == "string"){
        return element as string;
    }else{
        try{
            // if we're using "explicit children" we may need to ask for the "_" element
            let contents = element['_'];
            if(typeof contents == "string"){
                // This should work if there's exactly one string involved
                return contents as string;
            }
            if(typeof contents == "Array"){
                if(contents.length == 1){
                    let content = contents[0];
                    if(typeof content == "string"){
                        // this guards against multiple strings
                        return content as string;
                    }
                }
            }
        }catch(e){
            console.log("Warning: tried to extract a string from tag <"+tag+"> in XML snippet:\n",xml,"Got something else instead: ",element);
            throw(Error("Tried to retrieve a string from tag <"+tag+"> but it wasn't a string!"));
        }
    }
}
function xmlDictToString(xml: XMLDict): string{
	// Concatenate together the strings and tags in an XMLDict to produce a valid XML string
    // NB this will only work if the parser is set to preserveChildrenOrder and has explicitChildren and includes text elements.
	console.log("xmldicttostring");
    console.log(xml['$$']);
	//var builder = new xml2js.Builder({headless:true});
	//return builder.buildObject(xml);
    let output = "";
    let elements = xml['$$'];
    for(let e in elements){
        console.log(e);
    }
    return output;
}*/
function stringOfHTMLFromXML(xpath: string, xml: libxml.Node, def: string|null=" "): string{
	// retrieve the contents of a tag as a string, allowing HTML tags (for now, allows anything...?!)
    let nodes = xml.find(xpath, null);
    if(nodes.length == 0){
		// if the element is missing, return the default value if present, or throw an error.
        if(def != null){
            return def;
        }else{
            throw(Error("Error: there was no '"+xpath+"' tag, and one is required."));
        }
    }
    assert(nodes.length == 1, "Got multiple elements matching '"+xpath+"' but exactly 1 was required.");
    let node = nodes[0];
    if(typeof node === "string"){
		// a string is assumed to be valid HTML.  TODO: validate this...
        return node;
    }else{
        if(node instanceof libxml.Node){
		// if we have an libxml.Node, make a new XML document with it as root, and generate a string
        let xmlDoc = libxml.Document();
        xmlDoc.root(node);
        return xmlDoc.toString();
        }
    }
}
/*
// it would be nice to handle strings in the same way as everything else - nice, but hard it seems!
class LoadableString extends string implements CopiableFromXML{
    copyFromXML(xml: XMLelement): void{
        
}*/
function attributeFromXML(attributeName: string, xml: libxml.Node, def: string|null = ""): string{
    let attr = xml.attr(attributeName).value();
    if(attr instanceof libxml.Attribute){
        return attr.value();
    }else{
        if(typeof def === "string"){
            return def;
        }else{
            throw "Attribute "+attributeName+" is missing, but it is required.";
        }
    }
}
function idFromXML(xml: libxml.Node): string{
	// convenience property to retrieve the id property of a tag
    return attributeFromXML("id", xml);
}
function arrayFromXML<T extends CopiableFromXML>(c: new () => T, xpath: string, xmlelement: libxml.Node, allowEmpty: boolean=true): Array<T>{
    //Copy all XML tags with a given tag name ("key") into an array, converting each to the given type
    let nodes = xmlelement.find(xpath, null); //retrieve nodes matching the given path
    if(!allowEmpty) assert(nodes.length > 0, "Error: couldn't find a node matching '"+xpath+"'");
    try{
        let objects = new Array<T>();
        for(let n of nodes){
            if(n instanceof libxml.Node){
                let o = new c();
                o.copyFromXML(n);
                objects.push(o);
            }else{
                throw "Got nodes in the result that were not Element instances."
            }
        }
        return objects;
    }catch(e){
        console.log("Error: couldn't load objects matching '"+xpath+"' error: "+e);
    }
}
function objectFromXML<T extends CopiableFromXML>(c: new () => T, xpath: string, xmlelement: libxml.Node, allowEmpty: boolean=true):T|null{
	// restore XML tags to objects, given the constructor of a class that contains the tags.
    let objects = arrayFromXML(c, xpath, xmlelement, allowEmpty);
    assert(objects.length <= 1, "Error: multiple nodes matched '"+xpath+"' and at most one was required.");
    if(objects.length == 1) return objects[0];
    else return null;
}
function stringArrayFromXML(xpath: string, xmlelement: libxml.Node, allowEmpty: boolean=true): Array<string>{
    // Return an array with the text values of all the tags of a given type
    // NB may have trouble if the text values are missing, or the XPath matches non-Element nodes
    let nodes = xmlelement.find(xpath, null); //retrieve nodes matching the given path
    let strings = new Array<string>();
    try{
        for(let n of nodes){
            strings.push(n.text());
        }
        if(!allowEmpty) assert(nodes.length > 0, "Error: couldn't find a node matching '"+xpath+"'");
    }catch(e){
        console.log("Missing property: "+xpath+" error: "+e);
    }
}
function stringFromXML(xpath: string, xmlelement: libxml.Node, allowEmpty: boolean=true): string{
    // Return the text stored in a given tag (specified by the xpath), checking there's only one tag.
    let objects = stringArrayFromXML(xpath, xmlelement, allowEmpty);
    assert(objects.length <= 1, "Error: multiple nodes matched '"+xpath+"' and at most one was required.");
    if(objects.length == 1) return objects[0];
    else return null;
}

/**
 * Bill of materials
 */

export class Bom {
    public bom: Map<string,number>=new Map<string,number>();  //part-id

   /**
    * Add to BOM
    * 
    * @param p The part
    * @param n Quantity
    */
    public addPart(p:string,n:number){
        if(n==0)
            n=1;
        if(this.bom.has(p))
            this.bom.set(p,this.bom.get(p)+n);
        else
            this.bom.set(p,n)
    }
    

    public addBom(b:Bom,n:number){
        if(n==0)
            n=1;
        for(let p of b.bom.keys()){
            this.addPart(p,b.bom.get(p)*n);
        }
        
    }
    public isEmpty():boolean{
        return this.bom.size==0;
    }
    
}

/**
 * One author
 */
export class Author implements CopiableFromXML{
    public id: string; //Secondary copy
    
    public name: string;
    public email: string;
    public orcid: string;
    public affiliation: string;

    /**
     * Copy (for parsing)
     */
    copyfrom(o:Author):void{
        Object.assign(this,o);
    }
    copyFromXML(xml: libxml.Element): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.name = stringFromXML("name", xml);
        this.email = stringFromXML("email", xml);
        this.orcid = stringFromXML("orcid", xml);
        this.affiliation = stringFromXML("affiliation", xml);
    }
}

/**
 * One brick
 */
export class Brick implements CopiableFromXML{
    public id:string; //Secondary store    
    public name: string;
    public abstract: string;
    public long_description: string;
    public notes: string;
    public license: string;
    public files: MediaFile[];
    public authors: string[]; //RWB27 changed this from [string] because the former implies only ever one author??
    public functions: BrickFunction[];  //should not be used after import //changed from [bf] by rwb27
    public mapFunctions:Map<string,BrickFunction>=new Map<string,BrickFunction>();
    public instructions: StepByStepInstruction[];


    /**
     * Get BOM as only what this particular brick contains
     */
    public getBom(proj:Project, recursive:boolean):Bom {
        var bom:Bom=new Bom();

        console.log("functions");
        console.log(this.functions);
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isPart()){
                    var p:Part=imp.getPart(proj);
                    //bom.addPart(p.id, +func.quantity);
                    bom.addPart(p.id, imp.quantity);
                } else if(imp.isBrick()){
                    if(recursive){
                        var b:Bom=imp.getBrick(proj).getBom(proj,true);
                        //bom.addBom(b,+func.quantity);                    
                        bom.addBom(b,imp.quantity);                    
                    }
                } else {
                    console.log("bad imp type"+imp.type);
                }
            });
        }
        console.log("bom");
        console.log(bom);
        return bom;
    }


    /**
     * Get bricks this brick has as direct children
     */
    public getChildBricks():Set<string> {
        var referenced:Set<string> = new Set<string>();
        //this.mapFunctions.values().forEach(function(func:BrickFunction){
        for(let func of this.mapFunctions.values()){
            func.implementations.forEach(function(imp:FunctionImplementation){
                if(imp.isBrick()){
                    referenced.add(imp.id);               
                }
            });
        }
        return referenced;
    }
    
    /**
     * Copy (for parsing)
     */
    copyfrom(o:Brick):void{
        Object.assign(this,o);
        this.functions=<[BrickFunction]>[];
        var t:Brick=this;
        //Copy sub-bricks and functions
        o.functions.forEach(function(ofunc:BrickFunction,index:number){
            var f:BrickFunction=new BrickFunction();
            f.copyfrom(ofunc);
            //t.functions.push(f);
            f.id=""+index;
            t.mapFunctions.set(""+index,f);
        });
    }

    copyFromXML(xml: libxml.Node): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.name = stringFromXML("name", xml);
        this.abstract = stringFromXML("abstract", xml);
        this.long_description = stringFromXML("long_description", xml);
        this.notes = stringFromXML("notes", xml);
        this.license = stringFromXML("license", xml);
        this.authors = stringArrayFromXML("authors", xml);
        this.functions = arrayFromXML(BrickFunction, "function", xml);
        this.instructions = arrayFromXML(StepByStepInstruction, "assembly_instruction", xml);
        this.files = mediaFilesFromXML(xml);
        for(let i in this.functions){
            this.mapFunctions.set(""+i, this.functions[i]);
        }
    }

}

/**
 * One function for a brick
 */
export class BrickFunction implements CopiableFromXML{
    public id: string;

    public description: string;
    public designator: string;
    public quantity: string;  //deprecated
    public implementations: FunctionImplementation[];


    copyfrom(o:BrickFunction):void{
        Object.assign(this,o);
        this.implementations=<[FunctionImplementation]>[];
        o.implementations.forEach((oi:FunctionImplementation,index:number) => {
            var f:FunctionImplementation=new FunctionImplementation();
            f.copyfrom(oi);
            this.implementations.push(f);
        });
    }
    copyFromXML(xml: libxml.Node): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.description = stringFromXML("description", xml);
        this.designator = stringFromXML("designator", xml);
        this.quantity = stringFromXML("quantity", xml);
        this.implementations = arrayFromXML(FunctionImplementation, "implementation", xml);
    }
}

export class FunctionImplementation implements CopiableFromXML{
    public type: string; //"part" or "brick"
    public id: string;
    public quantity: number;

    public isPart():boolean{
        return this.type=="part";
    }
    public isBrick():boolean{
        return this.type=="brick";
    }
    public getPart(proj:Project):Part{
        return proj.getPartByName(this.id);//parts[+this.id];
    }
    public getBrick(proj:Project):Brick{
        return proj.getBrickByName(this.id);//bricks[+this.id];
    }
    
    copyfrom(oi:FunctionImplementation){
        Object.assign(this,oi);
        /*this.id=oi.id;
        this.quantity=oi.quantity;
        this.type=oi.type;*/
    }

    copyFromXML(xml: libxml.Node): void{
        this.id = idFromXML(xml); //do I want to do this??
        this.type = attributeFromXML("type", xml, null);
        if(this.type=="physical_part"){
            this.type="part";
        }
        this.quantity = Number(stringFromXML("quantity", xml));
    }
}

/**
 * One associated file
 */
export class MediaFile implements CopiableFromXML{
    public url: string;
    copyFromXML(xml: libxml.Node): void{
        this.url = attributeFromXML("url", xml);
    }
}
function mediaFilesFromXML(xml: libxml.Node): MediaFile[]{
    //convenience function for populating files lists from libxml.Node
    let media = xml.find("media", null);
    assert(media.length <= 1, "Error: there should only be one <media> tag");
    if(media.length==0) return[];
    if(media instanceof libxml.Node){
        return arrayFromXML(MediaFile, "file", media);
    }else{
        return [];
    }
}

/**
 * One part
 */
export class Part implements CopiableFromXML{
    public id: string; //secondary
    
    public name: string;
    public description: string;

    public supplier: string;
    public supplier_part_num: string;
    public manufacturer_part_num: string;
    public url: string;

    public material_amount: string;
    public material_unit: string;

    public files: MediaFile[];

    public manufacturing_instruction: StepByStepInstruction;

    copyfrom(o:Part):void{
        Object.assign(this,o);
    }
    copyFromXML(xml: libxml.Node): void{
        this.id = idFromXML(xml);
        this.name = stringFromXML("name", xml);
        this.description = stringFromXML("description", xml);
        if(this.name.length==0){
            this.name = this.description;
        }
        this.supplier = stringFromXML("supplier", xml);
        this.supplier_part_num = stringFromXML("supplier_part_num", xml);
        this.manufacturer_part_num = stringFromXML("manufacturer_part_num", xml);
        this.url = stringFromXML("url", xml);
        this.material_amount = stringFromXML("material_amount", xml);
        this.material_unit = stringFromXML("material_unit", xml);
        this.files = mediaFilesFromXML(xml);
        this.manufacturing_instruction = objectFromXML(StepByStepInstruction, "manufacturing_instruction", xml);
    }
}

/**
 * One step-by-step instruction
 */
export class StepByStepInstruction implements CopiableFromXML{
    public name: string;
    public steps: AssemblyStep[];

    copyFromXML(xml: libxml.Node): void{
        this.name = attributeFromXML("name", xml);
        this.steps = arrayFromXML(AssemblyStep, "step", xml); //load correctly from XML file
        //this.steps = [{components:[], description:"test step", files:[]}];//this works (untyped objects)
        
        /*let teststep = new AssemblyStep();
        teststep.files = [];
        teststep.components = [];
        teststep.description = "test step with correct type";
        this.steps = [teststep];//arrayFromXML(AssemblyStep, "step", xml);*/
    }
}

/**
 * One assembly step (or any instruction step)
 */
export class AssemblyStep implements CopiableFromXML{
    public description: string;
    public files: MediaFile[];
    public components: AssemblyStepComponent[];

    copyFromXML(xml: libxml.Node): void{
        this.description = stringOfHTMLFromXML("description", xml);
        this.files = mediaFilesFromXML(xml);
        this.components = arrayFromXML(AssemblyStepComponent, "component", xml);
    }
}

/**
 * reference - to be removed?
 */
export class AssemblyStepComponent implements CopiableFromXML{
    public quantity: string;
    public id: string;

    copyFromXML(xml: libxml.Node): void{
        this.quantity = stringFromXML("quantity", xml);
        this.id = idFromXML(xml);
    }
}


export class BrickTree{
    public brick:Brick;
    public children:BrickTree[]=[];
}




/**
 * One docubricks project
 */
export class Project implements CopiableFromXML{
    public bricks:Brick[]=[];
    public parts:Part[]=[];
    public authors:Author[]=[];
//    public mapBricks:Map<string,Brick>=new Map<string,Brick>();    //discards order. SHOULD use bricks[]
    public mapParts:Map<string,Part>=new Map<string,Part>();
    public mapAuthors:Map<string,Author>=new Map<string,Author>();
	public base_url:string="./project/";


    public getBrickByName(id:string):Brick{
        for(let b of this.bricks)
            if(b.id==id)
                return b;
        //var b:Brick=this.mapBricks.get(id)
        //if(b===undefined){
        console.error("---- no such brick \""+id+"\"");
        console.error(this.bricks)
        //for(let of of this.bricks)
        //    console.error(i);
        return null;
        //}
        //return b;
    }
    
    public getPartByName(id:string):Part{
        if(this.mapParts.get(id) == null){
            console.log("BAD PART ID: "+id);
        }
        return this.mapParts.get(id);
    }
    
    public getAuthorById(id:string):Author{
        return this.mapAuthors.get(id);
    }
    
    
    /**
     * Get all the roots. Hopefully only one
     */
    public getRootBricks():string[]{
        //See what is referenced
        var referenced:Set<string> = new Set<string>();
   
        //for(let b of this.mapBricks.values()){
        for(let b of this.bricks){
            for(let c of b.getChildBricks())
                referenced.add(c);
        }
        //Pick unreferenced bricks as roots
        var roots:string[]=[];
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                roots.push(b.id);
        
        //Backup: Pick anything as the root. Not great but better
        if(roots.length==0)
            for(let b of this.bricks){
                roots.push(b.id);
                break;
            }
        return roots;
    }


    public getBrickTree():[BrickTree]{
        var thetree:[BrickTree]=<[BrickTree]>[];
    
        
        //Pick unreferenced bricks as roots
        var roots:string[]=this.getRootBricks();
        var referenced:Set<string> = new Set<string>();
        for(let b of this.bricks)
            if(!referenced.has(b.id))
                thetree.push(this.getBrickTreeR(this, b, referenced));
        return thetree;
    }

    getBrickTreeR(thisProject:Project, thisbrick:Brick, referenced:Set<string>): BrickTree {
        var t:BrickTree=new BrickTree();
        t.brick=thisbrick;//this.mapBricks.get(thisbrick);//bricks[+thisbrick];
        referenced.add(thisbrick.id);
        var children:Set<string>=thisbrick.getChildBricks();
        for(let c of children){
            if(!referenced.has(c)){
                t.children.push(thisProject.getBrickTreeR(thisProject, 
                        thisProject.getBrickByName(c), referenced));
            }
        }
        return t;
    }
    
    
    /**
     * For parsing only
     */
    public copyfrom(o:Project):void{
        //Copy bricks
        for(let ob of o.bricks){
            //var ob:Brick=o.bricks[index];
            var b:Brick=new Brick();
            b.copyfrom(ob);
            //var si:string=""+index;
            //b.id=si;
            this.bricks.push(b);
            //this.mapBricks.set(si,b);
        };
        //Copy parts
        for(let op of o.parts){
            var p:Part=new Part();
            p.copyfrom(op);
            this.mapParts.set(p.id,p);
        };
        //Copy authors
        for(let oa of o.authors){
            var a:Author=new Author();
            a.copyfrom(oa);
            this.mapAuthors.set(a.id,a);
        };
        
        
    }
    public copyFromXML(xml: libxml.Node): void{
        console.log("Parsing bricks");
        this.bricks = arrayFromXML(Brick, "brick", xml);
        console.log("Parsing parts");
        this.parts = arrayFromXML(Part, "physical_part", xml);
        console.log("Parsing authors");
        this.authors = arrayFromXML(Author, "author", xml);
        console.log("Parsed project, building maps...");
        for(let p of this.parts){
            this.mapParts.set(p.id,p);
        }
        for(let a of this.authors){
            this.mapAuthors.set(a.id,a);
        }
        console.log("Project successfully reconstructed from XML")
    }

    /**
     * Get the name of the project - use the name of the root brick
     */
    public getNameOfProject():string{
        var roots:string[] = this.getRootBricks();
        if(roots.length>0){
            var root:Brick=this.getBrickByName(roots[0]);
            return root.name;
        } else
            return "";
    }
}


    
   

export function docubricksFromJSON(s:string):Project{
    var proj:Project=<Project>JSON.parse(s);    

    var realproj:Project=new Project();
    realproj.copyfrom(proj);
    console.log("successfully created docubricks project ",realproj);
    return realproj;
}

export function docubricksFromXML(s:string, callback: (p: Project)=>any ){
    var proj:Project=new Project();
    var xmlDoc = libxml.parseXMLString(s);
    
    //Copy bricks
    proj.copyFromXML(xmlDoc.get("/docubricks", null));
    console.log("successfully created docubricks project ",proj);

    callback(proj); //I really hate JS callbacks
}



// WEBPACK FOOTER //
// ./src/docubricks.ts