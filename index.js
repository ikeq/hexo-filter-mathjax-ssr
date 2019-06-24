/* global hexo */

'use strict';

const mathjax = require('./lib/mathjax');

mathjax.config(hexo.config.mathjax);

hexo.extend.filter.register('before_post_render', mathjax.beforeRender);
hexo.extend.filter.register('after_post_render', mathjax.render);
