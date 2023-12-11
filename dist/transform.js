"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transform = exports.extractParam = void 0;
const md5_1 = require("ts-md5/dist/md5");
const unist_util_visit_1 = __importDefault(require("unist-util-visit"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
function get(v) {
    if (v === undefined) {
        throw new Error("Mandatory variable is not defined");
    }
    else {
        return v;
    }
}
class ImageBlock {
    constructor(node, options, imgType, imgAlt, imgTitle, imageCode, position) {
        this.node = node;
        this.options = options;
        this.imgType = imgType;
        this.imgAlt = imgAlt;
        this.imgTitle = imgTitle;
        this.imageCode = imageCode;
        this.position = position;
        this.md5 = md5_1.Md5.hashStr(this.imageCode);
        this.imgFile = (this.options.imgDir.startsWith("/")) ?
            this.options.imgDir + "/" + this.md5 + ".svg" :
            process.cwd() + "/" + this.options.imgDir + "/" + this.md5 + ".svg";
        this.krokiUrl = this.options.krokiBase + "/" + this.imgType + "/svg";
        this.getImage = () => __awaiter(this, void 0, void 0, function* () {
            const response = yield (0, node_fetch_1.default)(this.krokiUrl, {
                method: 'POST',
                body: this.imageCode,
                headers: { 'Content-Type': 'text/plain' }
            });
            return response;
        });
        this.createNode = (vfile) => __awaiter(this, void 0, void 0, function* () {
            if (fs_1.default.existsSync(this.imgFile)) {
                //console.log("Reusing image file [" + this.imgFile + "].");
            }
            else {
                const imgText = yield this.getImage();
                if (!imgText.ok) {
                    throw new Error(`Unable to get image text from kroki @ ${vfile.path}:${this.position.start.line}:${this.position.start.column}: ${this.imageCode}`);
                    const svg = yield imgText.text();
                    fs_1.default.writeFileSync(this.imgFile, svg, "utf-8");
                }
            }
            const imgNode = {
                type: "image",
                url: this.options.imgRefDir + "/" + this.md5 + ".svg",
                title: this.imgTitle,
                alt: this.imgAlt === undefined ? this.md5 : this.imgAlt
            };
            this.node.type = 'paragraph';
            this.node.children = [imgNode];
        });
    }
}
function extractParam(name, input) {
    const regExp = /([a-zA-Z]+)=\"([^\"]+)\"/g;
    var result = undefined;
    var elem;
    while ((result == undefined) && (elem = regExp.exec(input)) !== null) {
        if (elem[1] == name)
            result = elem[2];
    }
    return result;
}
exports.extractParam = extractParam;
const applyCodeBlock = (options, node) => {
    const { lang, meta, value, position } = node;
    let kb = undefined;
    let isAliasLang = options.langAliases != undefined && options.langAliases.includes(lang);
    if (lang === options.lang || isAliasLang) {
        const imgAlt = extractParam("imgAlt", meta);
        const imgTitle = extractParam("imgTitle", meta);
        const imgType = isAliasLang ? lang : get(extractParam("imgType", meta));
        kb = new ImageBlock(node, options, imgType, imgAlt, imgTitle, value, position);
    }
    return kb;
};
const transform = (options) => (tree, vfile) => new Promise((resolve) => __awaiter(void 0, void 0, void 0, function* () {
    const nodesToChange = [];
    // First, collect all the node that need to be changed, so that 
    // we can iterate over them later on and fetch the file contents 
    // asynchronously 
    const visitor = (node) => {
        const kb = applyCodeBlock(options, node);
        if (kb !== undefined) {
            nodesToChange.push(kb);
        }
    };
    (0, unist_util_visit_1.default)(tree, 'code', visitor);
    // Now go over the collected nodes and change them 
    for (const kb of nodesToChange) {
        yield kb.createNode(vfile);
    }
    resolve();
}));
exports.transform = transform;
