/**
 * Markdown safe renderer
 */
const { marked } = require('marked');
const sanitizeHtml = require('sanitize-html');

marked.setOptions({
  gfm: true,
  breaks: true
});

function renderMarkdown(content) {
  if (!content) return '';
  const rawHtml = marked.parse(content);
  return sanitizeHtml(rawHtml, {
    allowedTags: ['p', 'ul', 'ol', 'li', 'strong', 'em', 'br', 'h3', 'h4', 'a'],
    allowedAttributes: {
      a: ['href', 'target', 'rel']
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer' })
    }
  });
}

module.exports = { renderMarkdown };

