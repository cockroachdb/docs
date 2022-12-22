module JekyllVersions
  class Symlink < Jekyll::StaticFile
    def initialize(site, name, target)
      @target = target
      dir = ''
      super(site, site.source, dir, name)
    end

    def write(dest)
      FileUtils.cp_r(@target, destination(dest))
    end
  end
end
