Jekyll::External.require_with_graceful_fail("redcarpet")

# Redcarpet is up to 150x faster than kramdown, Jekyll's default Markdown
# parser, but doesn't support the de facto standard `markdown="1"` attribute to
# parse Markdown inside of block elements. We work around this by
# monkey-patching Jekyll to use a Redcarpet renderer that recursively invokes
# Redcarpet on block elements.
module RedcarpetParserWithMarkdownInHTML
  def initialize(*args)
    super
    parser = self
    @renderer.send(:define_method, :block_html) do |raw|
      # The full regex can have bad performance on large inputs, so we do a
      # simple string search first.
      return raw unless raw.include?('markdown="1"')
      if markdown = raw.match(/<(.*)markdown="1"([^>]*)>(.*)<(\/.+?)>/m)
        open_tag_start, open_tag_end, content, close_tag = markdown.captures
        "<#{open_tag_start}#{open_tag_end}>\n#{parser.convert(content)}<#{close_tag}>"
      else
        raw
      end
    end
  end
end

Jekyll::Converters::Markdown::RedcarpetParser.prepend(RedcarpetParserWithMarkdownInHTML)
