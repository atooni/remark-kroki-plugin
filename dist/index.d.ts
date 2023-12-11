import { KrokiOptions } from './transform';
declare const plugin: (options: KrokiOptions) => (tree: any, vfile: any) => Promise<void>;
export = plugin;
