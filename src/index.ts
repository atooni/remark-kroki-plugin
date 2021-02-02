import { KrokiOptions, transform } from './transform';

const plugin = (options: KrokiOptions) => {
  return transform(options);
};

export = plugin;