#!/usr/bin/env ruby

require 'json'
require_relative 'vendor/bundle/ruby/3.4.0/gems/algolia_html_extractor-2.6.4/lib/algolia_html_extractor'

# Read the production backup record from file
record = JSON.parse(File.read('backup_test_record.json'), symbolize_names: true)

# Remove objectID before UUID generation (like the gem does)
record.delete(:objectID)

# Generate UUID using the actual gem logic
generated_uuid = AlgoliaHTMLExtractor.uuid(record)

puts JSON.generate({
  gem_objectID: generated_uuid,
  input_fields: record.keys.sort
})