const mathJax = require("mathjax-node");
const getMarker = getUid('MATHJAX-SSR');
const mathLists = {};
const debug = false;

let inline_mathjax_regex = null,
  block_mathjax_regex = null,
  inline_code_regex = null,
  block_code_regex = null,
  disable = false;

exports.beforeRender = function (data) {
  if (disable) return;

  var block_mathjax_filter_regex = new RegExp('(' + inline_code_regex + ')|(' + block_code_regex + ')|(' + block_mathjax_regex + ')', 'g');
  var inline_mathjax_filter_regex = new RegExp('(' + inline_code_regex + ')|(' + block_code_regex + ')|(' + inline_mathjax_regex + ')', 'g');

  const mathList = [];

  data.content = data.content
    .replace(block_mathjax_filter_regex, function (raw, math) {
      if ((new RegExp('^' + block_mathjax_regex + '$')).test(raw)) {
        math = RegExp.$1;
        const marker = getMarker();
        mathList.push({ math, block: true, marker, raw });
        return marker;
      }
      return raw;
    })
    .replace(inline_mathjax_filter_regex, function (raw, math) {
      if ((new RegExp('^' + inline_mathjax_regex + '$')).test(raw)) {
        math = RegExp.$1;
        const marker = getMarker();
        mathList.push({ math, marker, raw });
        return marker; 
      }
      return raw;
    });

  if (mathList.length) {
    mathLists[data._id] = mathList;
  }

  return data;
}

exports.render = function (data) {
  if (disable) return;

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
          content.replace(new RegExp('<p>\\s*' + marker), '<p style="text-align:center;overflow:auto">' + output.svg) :
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

  inline_mathjax_regex = raw`${iq[0]}(.+?)${iq[1]}`;
  block_mathjax_regex = raw`${bq[0]}\s*([\s\S]+?)\s*${bq[1]}`;
  inline_code_regex = "`[^`\n]+?`"
  block_code_regex = "(```)[^`](([^]+?)[^`])(```)"
  disable = !!config.disable;

  debug && console.log(inline_mathjax_regex, block_mathjax_regex)

  mathJax.config({
    MathJax: config.MathJax || {}
  });
}

function getUid(ns) {
  let i = 0;
  return () => [ns, i++].join('-');
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
