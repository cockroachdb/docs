module JekyllVersions
 class VersionedPage
    attr_reader :page, :key, :version

    def initialize(config, page)
      @config = config
      @page = page
      @key = page.data['key'] || basename
      @version = Version.from_path(config, page.url)
    end

    def basename
      # `page.basename` isn't sufficient, as the JekyllRedirectFrom plugin uses
      # permalinks to hide the fact that every RedirectPage has a basename of
      # "redirect.html". Using `page.url` properly takes the permalink into
      # account, but we need to unfold bare directories into the index.html
      # within.
      if page.url.end_with?('/')
        'index.html'
      else
        File.basename(page.url)
      end
    end

    def stable?
      version && version.stable?
    end

    def url
      page.url.split('/')
        .map { |p| p.gsub(Version::REGEX, version.slug) }
        .join('/')
    end

    def release_info
      @config.release_info[demand_version]
    end

    def sidebar_data
      "sidebar-data-#{demand_version}.json"
    end

    private

    def demand_version
      version&.version || @config.stable_version
    end
  end
end
