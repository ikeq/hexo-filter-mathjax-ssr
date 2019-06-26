const mathJax = require("mathjax-node");
const crypto = require('crypto');
const getMarker = getUid('MATHJAX');
const mathLists = {};
const debug = false;

let inline_mathjax_regex, block_mathjax_regex;

exports.beforeRender = function (data) {
  const mathList = [];

  data.content = data.content
    .replace(block_mathjax_regex, function (raw, math) {
      const marker = getMarker();
      mathList.push({ math, block: true, marker, raw });
      return marker;
    })
    .replace(inline_mathjax_regex, function (raw, math) {
      const marker = getMarker();
      mathList.push({ math, marker, raw });
      return marker;
    });

  if (mathList.length) {
    mathLists[data._id] = mathList;
  }

  return data;
}

exports.render = function (data) {
  const hexo = this;
  const mathList = mathLists[data._id];

  if (!mathList) return data;

  let { content } = data;

  return new Promise(render)

  function render(resolve) {
    const { math, marker, block, raw } = mathList.shift();

    mathJax.typeset({ math, format: 'TeX', svg: true, }, output => {
      if (!output.errors) {
        content = block ?
          content.replace(new RegExp('<p>\\s*' + marker), '<p style="text-align:center">' + output.svg) :
          content.replace(marker, output.svg);
      } else {
        hexo.log.error('Render MathJax failed at: ' + data.title);
        hexo.log.error(raw);
        content = content.replace(marker, raw);
      }

      if (mathList.length) return render(resolve);

      data.content = content;
      resolve(data);
    })
  }
}

exports.config = function (config) {
  config = config || {};

  const { raw } = String;
  const iq = parseTag(config.inlineQuote, '$');
  const bq = parseTag(config.blockQuote, '$$');

  inline_mathjax_regex = new RegExp(raw`${iq[0]}(.+?)${iq[1]}`, 'g');
  block_mathjax_regex = new RegExp(raw`${bq[0]}\s*([\s\S]+?)\s*${bq[1]}`, 'g');

  debug && console.log(inline_mathjax_regex, block_mathjax_regex)

  // TODO:
  delete config.inlineQuote;
  delete config.blockQuote;
  mathJax.config(config);
}

function getUid(ns) {
  const hash = crypto.createHash('md5').update(Date.now() + '').digest('hex').substring(0, 6).toUpperCase();
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

  return input.map(i => i.replace(/[\[\]\$\(\)\\]/g, (s) => '\\' + s));
}
