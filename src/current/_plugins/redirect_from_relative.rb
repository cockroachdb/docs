# Teach the JekyllRedirectFrom plugin to accept relative links in redirect_from
# keys.

module RedirectFromRelative
  class Generator < Jekyll::Generator
    # Ensure we run before JekyllRedirectFrom.
    priority :highest

    def generate(site)
      site.pages.each do |page|
        page.data['redirect_from'] = page.redirect_from.map do |r|
          r.start_with?('/') ? r : File.join(File.dirname(page.path), r)
        end
      end
    end
  end
end
