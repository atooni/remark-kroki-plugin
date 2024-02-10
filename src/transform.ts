import { Md5 } from 'ts-md5/dist/md5';
import visit from 'unist-util-visit';
import { Node, Code } from 'mdast'
import { Position } from 'unist'
import fetch from 'node-fetch';
import fs from 'fs';

type OptionString = string | undefined;

export interface KrokiOptions {
  krokiBase: string,
  imgDir: string,
  imgRefDir: string,
  lang: string,
  langAliases: string[]
  verbose: boolean
}

function get<V>(v: (V | undefined)): V {
  if (v === undefined) {
    throw new Error("Mandatory variable is not defined")
  } else {
    return v
  }
}

class ImageBlock {
  constructor(
    readonly node: any,
    readonly options: KrokiOptions,
    readonly imgType: string,
    readonly imgAlt: OptionString,
    readonly imgTitle: OptionString,
    readonly imageCode: string,
    readonly position: Position
  ) { }

  private md5 = Md5.hashStr(this.imageCode);

  private imgFile =
    (this.options.imgDir.startsWith("/")) ?
      this.options.imgDir + "/" + this.md5 + ".svg" :
      process.cwd() + "/" + this.options.imgDir + "/" + this.md5 + ".svg";

  private krokiUrl = this.options.krokiBase + "/" + this.imgType + "/svg";

  private getImage = async () => {

    if (this.options.verbose)
      console.log("Fetching image from kroki @ " + this.krokiUrl + " ...");

    const response = await fetch(this.krokiUrl, {
      method: 'POST',
      body: this.imageCode,
      headers: { 'Content-Type': 'text/plain' }
    });

    if (this.options.verbose)
      console.log(`Got response from kroki: ${response.status} ${response.statusText}`);

    return response;
  }

  createNode = async (vfile: any) => {

    if (fs.existsSync(this.imgFile)) {
      if (this.options.verbose)
        console.log("Reusing image file [" + this.imgFile + "].");
    } else {
      const imgText = await this.getImage();

      if (!imgText.ok) {
        throw new Error(`Unable to get image text from kroki @ ${vfile.path}:${this.position.start.line}:${this.position.start.column}: ${this.imageCode}`)
      } else {
        const svg = await imgText.text();
        if (this.options.verbose)
          console.log(`Writing image file [${this.imgFile}] with ${svg.length} bytes.`);;
        fs.writeFileSync(this.imgFile, svg, "utf-8");
      }
    }

    const imgNode: any = {
      type: "image",
      url: this.options.imgRefDir + "/" + this.md5 + ".svg",
      title: this.imgTitle,
      alt: this.imgAlt === undefined ? this.md5 : this.imgAlt
    }

    this.node.type = 'paragraph';
    this.node.children = [imgNode];
  }
}

export function extractParam(name: string, input: string): OptionString {
  const regExp = /([a-zA-Z]+)=\"([^\"]+)\"/g

  var result = undefined
  var elem;

  while ((result == undefined) && (elem = regExp.exec(input)) !== null) {
    if (elem[1] == name) result = elem[2]
  }

  return result;
}

const applyCodeBlock = (options: KrokiOptions, node: any) => {
  const { lang, meta, value, position } = node;

  let kb = undefined

  let isAliasLang = options.langAliases != undefined && options.langAliases.includes(lang);

  if (lang === options.lang || isAliasLang) {

    const imgAlt = extractParam("imgAlt", meta);
    const imgTitle = extractParam("imgTitle", meta);
    const imgType = isAliasLang ? lang : get(extractParam("imgType", meta));

    kb = new ImageBlock(
      node,
      options,
      imgType,
      imgAlt,
      imgTitle,
      value,
      position
    )
  }

  return kb;
}

export const transform = (options: KrokiOptions) => (tree: any, vfile: any) => new Promise<void>(async (resolve) => {

  const nodesToChange: ImageBlock[] = [];

  // First, collect all the node that need to be changed, so that 
  // we can iterate over them later on and fetch the file contents 
  // asynchronously 
  const visitor = (node: any) => {

    const kb = applyCodeBlock(options, node);

    if (kb !== undefined) {
      nodesToChange.push(kb)
    }
  };

  visit(tree, 'code', visitor);

  // Now go over the collected nodes and change them 
  for (const kb of nodesToChange) {
    await kb.createNode(vfile)
  }

  resolve();
});
