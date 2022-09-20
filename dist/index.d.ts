import { KrokiOptions } from './transform';
declare const plugin: (options: KrokiOptions) => (tree: any) => Promise<void>;
export = plugin;
