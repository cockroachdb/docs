#!/usr/bin/env ruby
# frozen_string_literal: true
require "algolia_html_extractor"
require "json"

abort "Usage: ruby extract_and_uuid.rb path/to/file.html" if ARGV.empty?

html = File.read(ARGV[0])
records = AlgoliaHTMLExtractor.run(html, options: { tags_to_exclude: "script,style,iframe,svg,pre" })

records.each do |rec|
  rec_without_node = rec.reject { |k,_| k == :node }
  object_id = AlgoliaHTMLExtractor.uuid(rec_without_node)
  rec_hash = rec_without_node.transform_keys(&:to_s)
  rec_hash["objectID"] = object_id
  puts JSON.generate(rec_hash)
end
