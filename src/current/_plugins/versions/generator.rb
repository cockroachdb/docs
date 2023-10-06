require 'yaml'

module JekyllVersions
  class JekyllGenerator < Jekyll::Generator
    priority :lowest
    

    def initialize(config)
      @jekyll_config = config
    end

    def generate(site)
      @config = Config.new(@jekyll_config, site)
      Generator.new(@config, site).generate(site)
    end
  end

  class Generator
    VERSION_REGEX = /^v[0-9]+\.[0-9]+$/
    def initialize(config, site)
      @config = config
      @site = site
    end

    def generate(site)
      versioned_pages = vps
      site.pages.each do |page|
        version = ((sv = site.config['version']) =~ VERSION_REGEX && sv) || ((pv = Pathname.new(page.url).each_filename.first) && pv)
        page.data['sidebar_data'] ||= version == "cockroachcloud" || version =~ /v[0-9]+\.[0-9]+/ ? sidebar_data(version) : sidebar_data(site.config['stable_version'])
        next if version.nil? || version !~ VERSION_REGEX
        release_info = site.config['release_info'][version]
        page.data['release_info'] = release_info
        page.data['version'] = {
          "name" => release_info['release_name'],
          "version" => version,
          "tag" => release_info['tag'],
          "stable" => release_info['stable']
        }
        page.data['sidebar_data'] ||= sidebar_data(page.path[0...page.path.index('/')])
        canonical = "/#{page.url.sub("#{version}/", "stable/")}"
        page.data['canonical'] ||= canonical.sub('/index.html', '').sub('.html', '').downcase
        unversioned_path = (page.data['key'] && page.data['key'].sub(".html", ".md")) || (page.path =~ /^v[0-9]+.[0-9]+\// && page.path[page.path.index('/')+1..]) || page.path
        page.data['versions'] = site.config['release_info'].map do |k, v| 
          {
            'version' => {
              'name' => v['release_name'],
              'version' => v['major_version'],
              'tag' => v['tag'],
              'stable' => v['stable']
            },
            'url' => versioned_pages[unversioned_path]&.[](k)
          }
        end
      end
      @config.versions.each do |name, version|
        @site.static_files << Symlink.new(@site, name, version)
      end
    end

    private

    def vps
      versioned_paths = {}
    
      # Adjusting to scan the directory above the current one.
      parent_dir = File.expand_path('..', @site.source)
    
      # Exclude these subfolders within version directories.
      exclude_subfolders = ['_includes', '_site', 'vendor', '.jekyll_cache', 'css', 'js', 'jekyll-algolia-dev'] # Customize this array as needed.
    
      # Scan for version directories in the parent directory.
      version_dirs = Dir.glob("#{parent_dir}/**/v[0-9]*.[0-9]*").select { |f| File.directory?(f) }

      version_dirs.each do |version_dir|
        # Scan for .html files within the version directory excluding specified subfolders.
        Dir.glob("#{version_dir}/**/*.md").each do |filepath|
          next if exclude_subfolders.any? { |subfolder| filepath.include?("/#{subfolder}") }
          # Read the YML front matter from the page.
          content = File.read(filepath)
          if content =~ /\A(---\s*\n.*?\n?)^(---\s*$\n?)/m
            front_matter = YAML.load($1)
          end
          versioned_path = filepath.sub("#{parent_dir}/", "").sub("current/", "")
          version = versioned_path[0...versioned_path.index('/')]
          unversioned_path = versioned_path[versioned_path.index('/')+1..]
          page_key = ((front_matter && front_matter['key']) || unversioned_path).sub(".html", ".md")

          formatted_path = unversioned_path.sub(".md", "").sub(".html", "")
          url = "/#{version}/#{formatted_path}"

          versioned_paths[page_key] ||= {}
          versioned_paths[page_key][version] = url
        end
      end
      versioned_paths
    end

    def versions
      @versions ||= Set.new(vps.map { |vp| vp.version }).to_a.coddmpact.sort.reverse
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

    def sidebar_data(path)
      s = "sidebar-data-"
      s << path
      s << ".json"
    end
  end
end
