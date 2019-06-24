const mathJax = require("mathjax-node");
const crypto = require('crypto');
const getMarker = getUid('MATHJAX');
const mathList = [];

let inline_mathjax_regex, block_mathjax_regex;

// markdown is easier to handle
exports.beforeRender = function (data) {
  data.content = data.content
    .replace(block_mathjax_regex, function (a, math) {
      const marker = getMarker();
      mathList.push({ math, block: true, marker });
      return marker;
    })
    .replace(inline_mathjax_regex, function (a, math) {
      const marker = getMarker();
      mathList.push({ math, marker });
      return marker;
    });

  return data;
}

exports.render = function (data) {
  if (!mathList.length) return data;

  let { content } = data;

  return render();

  function render() {
    const { math, marker, block } = mathList.shift();
    return mathJax.typeset({ math, format: 'TeX', svg: true, })
      .then(res => {
        if (!res.errors) {
          if (block)
            content = content.replace(new RegExp('<p>\\s*' + marker), '<p style="text-align:center">' + res.svg);
          else
            content = content.replace(marker, res.svg);

          if (mathList.length) return render();

          data.content = content;
          return data;
        }

        throw res.errors;
      });
  }
}

exports.config = function (config) {
  config = config || {};

  const inlineQuote = parseTag(config.inlineQuote, '\\$');
  const blockQuote = parseTag(config.blockQuote, '\\$\\$');

  inline_mathjax_regex = new RegExp(`${inlineQuote[0]}(.+?)${inlineQuote[1]}`, 'g');
  block_mathjax_regex = new RegExp(`${blockQuote[0]}\\s*(.+?)\\s*${blockQuote[1]}`, 'g');

  // TODO:
  delete config.inlineQuote;
  delete config.blockQuote;
  mathJax.config(config);
}

function getUid(ns) {
  const hash = crypto.createHash('md5').update(String(Date.now())).digest('hex').substring(0, 6).toUpperCase();
  let i = 0;
  return () => [ns, hash, i++].join('-');
}

function parseTag(input, defaultTag) {
  if (typeof input === 'string') {
    const tag = input || defaultTag;
    input = [tag, tag];
  }

  else if (!Array.isArray(input)) {
    input = [defaultTag, defaultTag];
  }

  else {
    const tag = input[0] || input[1] || defaultTag;
    input = [tag, input[1] || tag];
  }

  return input;
}
