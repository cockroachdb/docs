module TemplateWithCaching
  def parse(source, options = {})
    @cache ||= {}
    hash = source.hash ^ options.hash
    return @cache[hash] if @cache.has_key?(hash)
    @cache[hash] = super
  end
end

module Liquid
  class Template
    class << self
      prepend TemplateWithCaching
    end
  end
end
