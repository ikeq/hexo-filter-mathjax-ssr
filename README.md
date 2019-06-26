# hexo-filter-mathjax-ssr

[![npm](https://img.shields.io/npm/v/hexo-filter-mathjax-ssr.svg)](https://www.npmjs.com/package/hexo-filter-mathjax-ssr)

Pre-render MathJax into svg using [mathjax-node].

## Preview

- [Examples](https://blog.oniuo.com/post/math-jax-ssr-example)

## Installation

``` bash
$ npm install hexo-filter-mathjax-ssr --save
```

## Options

You can configure this plugin in `_config.yml`.

``` yaml
mathjax:
  disable: false
  inlineQuote: $ # or `[$, $]`
  blockQuote: $$ # or `[$$, $$]`
  MathJax:
    SVG:
      font: Gyre-Pagella
```

- **disable** - Disable plugin, default `false`.
- **inlineQuote** - Similar to `MathJax.inlineMath`, but only support one pair, default `$`.
- **blockQuote** - Similar to `MathJax.blockMath`, but only support one pair, default `$$`.
- **MathJax** - MathJax configuration, only support some of the svg options, see [svg processor][svg-processor].

## License

Licensed under [MIT](LICENSE).

[mathjax-node]: https://github.com/mathjax/MathJax-node
[svg-processor]: http://docs.mathjax.org/en/latest/options/output-processors/SVG.html#the-svg-output-processor
