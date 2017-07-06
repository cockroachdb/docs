module JekyllVersions
 class VersionedPage
    attr_reader :page, :key, :version

    def initialize(config, page)
      @config = config
      @page = page
      @key = page.data['key'] || page.name
      @version = Version.from_path(config, page.path)
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
