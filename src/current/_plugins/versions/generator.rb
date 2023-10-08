module JekyllVersions
  class JekyllGenerator < Jekyll::Generator
    # Ordering requirements:
    #   - Run after FlavorSelector, so that we do not see pages that do not
    #     apply to this flavor.
    priority :lowest

    def initialize(config)
      @jekyll_config = config
    end

    def generate(site)
      @config = Config.new(@jekyll_config, site)
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
        canonical = stable_vp(vp.key)&.url || page.url
        page.data['canonical'] ||= canonical.sub('/index.html', '').sub('.html', '').downcase

        page.data['versions'] = versions.map do |v|
          { 
            'version' => {
              'name' => v.name,
              'version' => v.version,
              'tag' => v.tag,
              'stable' => v.stable?
            },
             'url' => vps_with_key(vp.key)[v]&.url 
          }
        end
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
      @vps_by_key ||= vps.each_with_object(Hash.new { |h, k| h[k] = {} }) do |vp, memo|
        memo[vp.key][vp.version] = vp if vp.version
      end
      @vps_by_key[key]
    end

    def stable_vp(key)
      (kv = vps_with_key(key).find { |_, vp| vp.stable? }) && kv[1]
    end
  end
end
