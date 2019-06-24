# hexo-filter-mathjax

Pre-render MathJax into svg using [mathjax-node].

## Installation

``` bash
$ npm install hexo-filter-mathjax --save
```

## Options

You can configure this plugin in `_config.yml`.

``` yaml
mathjax:
  inlineQuote: ['\$', '\$']
  blockQuote: ['\$\$', '\$\$']
  MathJax:
    SVG:
      font: Gyre-Pagella
```

- **inlineQuote** - Similar to `MathJax.inlineMath`, but only support one pair.
- **blockQuote** - Similar to `MathJax.blockMath`, but only support one pair.
- **MathJax** - MathJax configuration, see [svg processor][svg-processor].

## License

Licensed under [MIT](LICENSE).

[mathjax-node]: https://github.com/mathjax/MathJax-node
[svg-processor]: http://docs.mathjax.org/en/latest/options/output-processors/SVG.html#the-svg-output-processor
