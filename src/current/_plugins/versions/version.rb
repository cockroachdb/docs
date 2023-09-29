module JekyllVersions
  class Version
    REGEX = /^v[0-9]+\.[0-9]+$/

    include Comparable

    attr_reader :version

    def self.from_path(config, path)
      if (v = Pathname.new(path).each_filename.first) =~ REGEX
        Version.new(config, v)
      end
    end

    def initialize(config, v)
      @config = config
      @version = v
    end

    def name
      if @config.release_info[version] && (name = @config.release_info[version]['release_name'])
        name
      else
        version
      end
    end

    def tag
      @config.versions.key(version)
    end

    def slug
      tag || version
    end

    def stable?
      tag == 'stable'
    end

    def to_liquid
      { 'name' => name, 'version' => version, 'tag' => tag, 'stable' => stable? }
    end

    def <=>(other)
      Gem::Version.new(version.sub(/^v/, "")) <=> Gem::Version.new(other.version.sub(/^v/, ""))
    end

    alias_method :eql?, :==

    def hash
      version.hash
    end
  end
end
