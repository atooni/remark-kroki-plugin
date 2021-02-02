import { Md5 } from 'ts-md5/dist/md5';
import visit from 'unist-util-visit';
import fetch from 'node-fetch';

type OptionString = string | undefined;

export interface KrokiOptions {
  krokiBase: string,
  imgDir: string,
  lang: string
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
    readonly options: KrokiOptions,
    readonly imgType: string,
    readonly imageCode: string
  ) { }

  private krokiUrl = this.options.krokiBase + "/" + this.imgType + "/svg";

  private getImage = async () => {

    const response = await fetch(this.krokiUrl, {
      method: 'POST',
      body: this.imageCode,
      headers: { 'Content-Type': 'text/plain' }
    });

    return response;
  }

  createNode = async () => {

    const imgText = await this.getImage();

    if (!imgText.ok) {
      throw new Error("Unable to get image text from kroki")
    } else {
      console.log(imgText.text())
    }
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
  const { lang, meta, value } = node;

  let kb = undefined

  if (lang === options.lang) {

    const imgType = get(extractParam("imgType", meta));

    kb = new ImageBlock(
      options,
      imgType,
      value
    )
  }

  return kb;
}

export const transform = (options: KrokiOptions) => (tree: any) => new Promise<void>(async (resolve) => {

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
    await kb.createNode()
  }

  resolve();
});