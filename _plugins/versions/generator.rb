module JekyllVersions
 class JekyllGenerator < Jekyll::Generator
    # Ensure we run after JekyllRedirectFrom so we can apply version aliases
    # (e.g. stable) to redirects.
    priority :lowest

    def initialize(config)
      @config = Config.new(config)
    end

    def generate(site)
      Generator.new(@config, site).generate
    end
  end

  class Generator
    def initialize(config, site)
      @config = config
      @site = site
    end

    def generate
      vps.each do |vp|
        page = vp.page
        page.data['version'] = vp.version
        page.data['release_info'] = vp.release_info
        page.data['sidebar_data'] ||= vp.sidebar_data
        page.data['canonical'] = stable_vp(vp.key)&.url || page.url
        page.data['versions'] = versions.map do |v|
          { 'version' => v, 'url' => vps_with_key(vp.key)[v]&.url }
        end

        @site.pages << JekyllRedirectFrom::RedirectPage.from_paths(
          @site, vp.unversioned_path, vp.url) if vp.stable?
      end

      @config.versions.each do |name, version|
        @site.static_files << Symlink.new(@site, name, version)
      end
    end

    private

    def vps
      @vps ||= @site.pages.map { |page| VersionedPage.new(@config, page) }
    end

    def versions
      @versions ||= Set.new(vps.map { |vp| vp.version }).to_a.compact.sort.reverse
    end

    def vps_with_key(key)
      @vps_by_key ||= vps.reduce(Hash.new { |h, k| h[k] = {} }) do |memo, vp|
        memo[vp.key][vp.version] = vp if vp.version
        memo
      end
      @vps_by_key[key]
    end

    def stable_vp(key)
      (kv = vps_with_key(key).find { |_, vp| vp.stable? }) && kv[1]
    end
  end
end
