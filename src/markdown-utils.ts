/**
 * Simple HTML to Markdown and Markdown to HTML converter
 * strictly for the Rich Text Editor features.
 */

export const htmlToMarkdown = (html: string): string => {
  let markdown = html;

  // Remove generic div tags but keep content
  markdown = markdown.replace(/<div[^>]*>(.*?)<\/div>/gs, "$1\n");

  // Headings
  markdown = markdown.replace(/<h1[^>]*>(.*?)<\/h1>/gs, "# $1\n\n");
  markdown = markdown.replace(/<h2[^>]*>(.*?)<\/h2>/gs, "## $1\n\n");
  markdown = markdown.replace(/<h3[^>]*>(.*?)<\/h3>/gs, "### $1\n\n");
  markdown = markdown.replace(/<h4[^>]*>(.*?)<\/h4>/gs, "#### $1\n\n");
  markdown = markdown.replace(/<h5[^>]*>(.*?)<\/h5>/gs, "##### $1\n\n");
  markdown = markdown.replace(/<h6[^>]*>(.*?)<\/h6>/gs, "###### $1\n\n");

  // Paragraphs
  markdown = markdown.replace(/<p[^>]*>(.*?)<\/p>/gs, "$1\n\n");

  // Line breaks
  markdown = markdown.replace(/<br\s*\/?>/gs, "\n");

  // Bold
  markdown = markdown.replace(/<strong[^>]*>(.*?)<\/strong>/gs, "**$1**");
  markdown = markdown.replace(/<b[^>]*>(.*?)<\/b>/gs, "**$1**");

  // Italic
  markdown = markdown.replace(/<em[^>]*>(.*?)<\/em>/gs, "_$1_");
  markdown = markdown.replace(/<i[^>]*>(.*?)<\/i>/gs, "_$1_");

  // Strike
  markdown = markdown.replace(/<s[^>]*>(.*?)<\/s>/gs, "~~$1~~");
  markdown = markdown.replace(/<strike[^>]*>(.*?)<\/strike>/gs, "~~$1~~");
  markdown = markdown.replace(/<del[^>]*>(.*?)<\/del>/gs, "~~$1~~");

  // Code
  markdown = markdown.replace(/<code[^>]*>(.*?)<\/code>/gs, "`$1`");
  markdown = markdown.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gs,
    "```\n$1\n```\n\n"
  );

  // Links
  markdown = markdown.replace(
    /<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/gs,
    "[$2]($1)"
  );

  // Images
  markdown = markdown.replace(
    /<img[^>]*src="(.*?)"[^>]*alt="(.*?)"[^>]*>/gs,
    "![$2]($1)"
  );
  markdown = markdown.replace(/<img[^>]*src="(.*?)"[^>]*>/gs, "![]($1)");

  // Blockquotes
  markdown = markdown.replace(
    /<blockquote[^>]*>(.*?)<\/blockquote>/gs,
    (match, content) => {
      return (
        content
          .trim()
          .split("\n")
          .map((line: string) => `> ${line}`)
          .join("\n") + "\n\n"
      );
    }
  );

  // Lists (Simplified - regex for lists is complex, this handles basic structure)
  // Unordered list items
  markdown = markdown.replace(
    /<ul[^>]*>([\s\S]*?)<\/ul>/gs,
    (match, content) => {
      return content.replace(/<li[^>]*>(.*?)<\/li>/gs, "- $1\n") + "\n";
    }
  );

  // Ordered list items
  markdown = markdown.replace(
    /<ol[^>]*>([\s\S]*?)<\/ol>/gs,
    (match, content) => {
      let index = 1;
      return (
        content.replace(/<li[^>]*>(.*?)<\/li>/gs, () => `${index++}. $1\n`) +
        "\n"
      );
    }
  );

  // Decode HTML entities
  markdown = markdown
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Cleanup multiple newlines
  markdown = markdown.replace(/\n\s*\n\s*\n/g, "\n\n");

  return markdown.trim();
};

export const markdownToHtml = (markdown: string): string => {
  let html = markdown;

  // Cleanup
  html = html.replace(/\r\n/g, "\n");

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/gs, "<pre><code>$1</code></pre>");

  // Inline Code
  html = html.replace(/`([^`]+)`/gs, "<code>$1</code>");

  // Bold
  html = html.replace(/\*\*([^*]+)\*\*/gs, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/gs, "<strong>$1</strong>");

  // Italic
  html = html.replace(/_([^_]+)_/gs, "<em>$1</em>");
  html = html.replace(/\*([^*]+)\*/gs, "<em>$1</em>");

  // Strike
  html = html.replace(/~~([^~]+)~~/gs, "<s>$1</s>");

  // Images
  html = html.replace(/!\[(.*?)\]\((.*?)\)/gs, '<img src="$2" alt="$1" />');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/gs, '<a href="$2">$1</a>');

  // Headings
  html = html.replace(/^# (.*$)/gm, "<h1>$1</h1>");
  html = html.replace(/^## (.*$)/gm, "<h2>$1</h2>");
  html = html.replace(/^### (.*$)/gm, "<h3>$1</h3>");
  html = html.replace(/^#### (.*$)/gm, "<h4>$1</h4>");
  html = html.replace(/^##### (.*$)/gm, "<h5>$1</h5>");
  html = html.replace(/^###### (.*$)/gm, "<h6>$1</h6>");

  // Blockquotes
  html = html.replace(/^> (.*$)/gm, "<blockquote>$1</blockquote>");

  // Unordered Lists
  html = html.replace(/^\s*-\s+(.*$)/gm, "<ul><li>$1</li></ul>");
  // Fix nested uls (merge adjacent uls)
  html = html.replace(/<\/ul>\s*<ul>/g, "");

  // Ordered Lists
  html = html.replace(/^\s*\d+\.\s+(.*$)/gm, "<ol><li>$1</li></ol>");
  // Fix nested ols
  html = html.replace(/<\/ol>\s*<ol>/g, "");

  // Paragraphs - wrap remaining lines that aren't tags
  html = html.replace(/^(?!<[a-z]).+$/gm, "<p>$&</p>");

  // Cleanup double paragraphs if any
  html = html.replace(/<p><(ul|ol|h\d|blockquote|pre)>/g, "<$1>");
  html = html.replace(/<\/(ul|ol|h\d|blockquote|pre)><\/p>/g, "</$1>");

  return html;
};
