require 'json'

module JekyllVersions
 class VersionedPage
    attr_reader :page, :key, :version

    def initialize(config, page)
      @config = config
      @page = page
      @version = Version.from_path(config, page.url)
      @key = page.data['key'] || unversioned_path
    end

    def unversioned_path
      # `page.path` isn't sufficient, as the JekyllRedirectFrom plugin uses
      # permalinks to hide the fact that every RedirectPage has a basename of
      # "redirect.html". Using `page.url` properly takes the permalink into
      # account, but we need to convert the URL back to a path by a) dropping
      # the leading slash and maybe the version from the front of the URL, and
      # b) tacking on `index.html` to bare directories.
      url = page.url.split('/').drop(@version ? 2 : 1).join('/')
      url << 'index.html' if url.end_with?('/')
      url
    end

    def stable?
      version && version.stable?
    end

    def url

      page.url.split('/', -1)
        .map { |p| p.gsub(Version::REGEX, version.slug) }
        .join('/')
    end

    def release_info
      @config.release_info[demand_version]
    end

    def sidebar_data
      s = "sidebar-data-"
      s << demand_version
      s << ".cockroachcloud" if @config.cockroachcloud
      s << ".json"
    end

    def sidebar_data_titles
      JSON.parse(File.read("_includes/titles-#{sidebar_data}"))
    end

    private

    def demand_version
      version&.version || @config.stable_version
    end
  end
end
