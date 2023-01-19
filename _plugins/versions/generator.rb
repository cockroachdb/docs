module JekyllVersions
 class JekyllGenerator < Jekyll::Generator
    # Ordering requirements:
    #   - Run after JekyllRedirectFrom so we can apply version aliases
    #     (e.g., stable) to redirects.
    #   - Run after FlavorSelector, so that we do not see pages that do not
    #     apply to this flavor.
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
        page.data['sidebar_data_titles'] ||= vp.sidebar_data_titles
        if page.data['canonical'].nil?
          page.data['canonical'] = stable_vp(vp.key)&.url || page.url
        end
        page.data['versions'] = versions.map do |v|
          { 'version' => v, 'url' => vps_with_key(vp.key)[v]&.url }
        end


        # if vp.stable?
        #   if vp.url != "/stable/" and vp.unversioned_path != ""
        #     # puts "vp.unversioned_path: #{vp.unversioned_path}"
        #     # puts "vp.url: #{vp.url}"
        #     # puts "page. #{page.path}"
        #     @site.pages << JekyllRedirectFrom::RedirectPage.from_paths(
        #       @site, vp.unversioned_path, vp.url) if vp.stable?
        #   end
        # end

        # if page.main_homepage != true
          # @site.pages << JekyllRedirectFrom::RedirectPage.from_paths(
            # @site, vp.unversioned_path, vp.url) if vp.stable?
        # end
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
