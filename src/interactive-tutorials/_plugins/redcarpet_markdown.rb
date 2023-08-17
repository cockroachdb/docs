# Jekyll removed support for the redcarpet markdown parser in
# https://github.com/jekyll/jekyll/pull/6987, so we vendor our own redcarpet
# plugin here, which is largely copied from the one removed from Jeyll.

unless defined?(Redcarpet)
  Jekyll::External.require_with_graceful_fail(%w(
    redcarpet rouge rouge/plugins/redcarpet
  ))
end

class Jekyll::Converters::Markdown::Redcarpet
  def initialize(config)
  end

  def convert(content)
    Redcarpet::Markdown.new(
      CockroachRenderer.new(self, with_toc_data: true),
      disable_indented_code_blocks: true,
      fenced_code_blocks: true,
      no_intra_emphasis: true,
      tables: true,
    ).render(content)
  end
end

class CockroachRenderer < Redcarpet::Render::HTML
  def initialize(parser, options)
    @parser = parser
    super(options)
  end

  include Rouge::Plugins::Redcarpet

  def block_code(_code, lang)
    code = "<pre>#{super}</pre>"
    code = code.sub(
      %r!<pre>!,
      "<pre><code class=\"language-#{lang}\" data-lang=\"#{lang}\">"
    )
    code = code.sub(%r!</pre>!, "</code></pre>")
    "<div class=\"highlight\">#{code}</div>"
  end

  # Redcarpet doesn't support the de facto standard `markdown="1"` attribute to
  # parse Markdown inside of block elements. We work around this by
  # recursively invoking Redcarpet on block elements.
  def block_html(raw)
    # The full regex can have bad performance on large inputs, so we do a
    # simple string search first.
    return raw unless raw.include?('markdown="1"')
    if markdown = raw.match(/<(.*)markdown="1"([^>]*)>(.*)<(\/.+?)>/m)
      open_tag_start, open_tag_end, content, close_tag = markdown.captures
      "<#{open_tag_start}#{open_tag_end}>\n#{@parser.convert(content)}<#{close_tag}>"
    else
      raw
    end
  end

  protected

  def rouge_formatter(_lexer)
    Rouge::Formatters::HTMLLegacy.new(:wrap => false)
  end
end