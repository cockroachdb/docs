require 'addressable/uri'

# FlavorSelector swaps between the standard and managed version of the docs.
#
# It detects when the managed docs link to a page that only exists in the
# standard docs and fixes up the URL accordingly. To make it obvious that the
# user is getting bounced out of the managed docs, the link is configured to
# open in a new window.
module FlavorSelector
  class Generator < Jekyll::Generator
    # Ensure we run after JekyllRedirectFrom, so that if managed links to
    # a page that *redirects* to the standard docs, we rewrite that link.
    priority :lowest

    def initialize(config)
      @config = config
      return unless config['managed']

      source = config['source']
      baseurl = config['baseurl']
      Jekyll::Hooks.register(:pages, :post_render) do |page|
        dirname = File.dirname(page.url)
        page.output.gsub!(/href="([^"]+)"/) do |m|
          uri = Addressable::URI.parse($1)
          if is_relative(uri) && @rewrite_urls.include?(File.join(dirname, uri.path))
            path = File.join(baseurl, dirname, uri.path).sub("/managed", "")
            "href=\"#{path}\" target=\"blank\""
          else
            m
          end
        end
      end
    end

    def generate(site)
      @rewrite_urls = Set.new
      site.pages
        .select { |page| page.build_for == ["standard"] }
        .each { |page| @rewrite_urls << page.url }

      flavor = @config["managed"] ? "managed" : "standard"
      site.pages.select! { |page| page.build_for.include?(flavor) }
    end

    private

    def is_relative(uri)
      !uri.scheme && !uri.path.start_with?("/")
    end
  end
end

class Jekyll::Page
  def build_for
    @data['build_for'] || ['standard']
  end
end
