## Remark Kroki Plugin 

[Kroki](https://kroki.io/) provides a web service that can be used to generate images from a wide range of supported DSL's, for example [mermaid](https://mermaid-js.github.io/mermaid/#/), [PlantUML](https://plantuml.com/en/), [GraphViz](https://graphviz.org/) and many others. 

This plugin allows the user to provide th DSL for an image in one of the kroki supported dialects within a code block. The remark processor will replace the image code block with the generated image. 

## Installation

The include code plugin is normally used in the context of a site generator using the remark markdown processor underneath. For example, to use the plugin within [Docusaurus 2](https://v2.docusaurus.io/), 

1. Include `remark-kroki-plugin": "0.1.0"` in the _package.json_ of the docusaurus website project. 
1. Within _docusaurus.config.js_, configure the plugin with the following parameters:

   1. __krokiBase__: The base URL of the kroki web service. This is usually `https://kroki.io` unless e selfhosted kroki instance shall be used. 
   1. __lang__: The image transformations is applied for all codeblocks with this language. 
   1. __imgRefDir__: The prefix that will be used for a generated image to create the link. 
   1. __imgDir__: The directory where the generated image files are stored.

### Docusaurus 2 

Within [Docusaurus 2](https://v2.docusaurus.io/) the plugin could be configured as below:

```
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          remarkPlugins: [
            [require('remark-kroki-plugin'), { krokiBase: 'https://kroki.io', lang: "kroki", imgRefDir: "../img/kroki", imgDir: "static/img/kroki" }]
          ],
        },
        blog: {
          showReadingTime: false,
          remarkPlugins: [
            [require('remark-kroki-plugin'), { krokiBase: 'https://kroki.io', lang: "kroki", imgRefDir: "../img/kroki", imgDir: "static/img/kroki" }]
          ],
        },
        theme: {
          customCss: [
            require.resolve('./src/css/custom.css'),
            //require.resolve('./node_modules/prism-themes/themes/prism-cb.css')
          ],
        },
      },
    ],
  ]
```

## Usage

The image generator will be triggered by a code block that uses the configured language within it's language parameter. The plugin will use the `imgType` attribute to determine which generator shall be used within the kroki web service. 

The generator will `POST` the content of the code block to the kroki web service and either report an error 
or generate an appropriate SVG file in the `imgDir`.

The filename of the generated image will is generated as `$(MD5 hash of the image code).svg`. When the file with the calculated filename already exists within the image directory, this will be used as the image file, otherwise 
the kroki web service will be called to generate the file. 

The user can decide to put generated images under version control so that images generated once can be reused until the text changes. 

### Examples

__Generate a mermaid image__

```kroki imgType="mermaid" imgTitle="Collaborating containers"
graph TD
  subgraph Shop X
    Bx(Shop X) --> FX1((Fs X1)) --> Bx
    Bx --> FX2((Fs X2)) --> Bx
  end
  subgraph Shop Y
    By(Shop Y) --> FY1((Fs Y1)) --> By
    By --> FY2((Fs Y2)) --> By
  end
  subgraph Shop Z
    Bz(Shop Z) --> FZ1((Fs Z1)) --> Bz
    Bz --> FZ2((Fs Z2)) --> Bz
  end
  A(Data Center) --> Bx --> A
  A --> By --> A
  A --> Bz --> A
```

## Development 

It might be good to allow the generated filename to be overwritten with a parameter.

The code has been realized in typescript follwing this excellent [tutorial](https://www.huy.dev/2018-05-remark-gatsby-plugin-part-1/) ff.

