# frozen_string_literal: true

module Jekyll
  module Algolia
    # Applying user-defined hooks on the processing pipeline
    module Hooks
      # Public: Apply the before_indexing_each hook to the record.
      # This method is a simple wrapper around methods that can be overwritten
      # by users. Using a wrapper around it makes testing their behavior easier
      # as they can be mocked in tests.
      #
      # record - The hash of the record to be pushed
      # node - The Nokogiri node of the element
      def self.apply_each(filepath, record, node, context)
        case method(:before_indexing_each).arity
        when 1
          before_indexing_each(record)
        when 2
          before_indexing_each(record, node)
        else
          before_indexing_each(filepath, record, node, context)
        end
      end

      # Public: Apply the before_indexing_all hook to all records.
      # This method is a simple wrapper around methods that can be overwritten
      # by users. Using a wrapper around it makes testing their behavior easier
      # as they can be mocked in tests.
      #
      # records - The list of all records to be indexed
      def self.apply_all(records, context)
        case method(:before_indexing_all).arity
        when 1
          before_indexing_all(records)
        else
          before_indexing_all(records, context)
        end
      end

      # Public: Check if the file should be indexed or not
      #
      # filepath - The path to the file, before transformation
      #
      # This hook allow users to define if a specific file should be indexed or
      # not. Basic exclusion can be done through the `files_to_exclude` option,
      # but a custom hook like this one can allow more fine-grained
      # customisation.
      def self.should_be_excluded?(filepath)
        # We want to include release files, CockroachDB Cloud docs,
        # API docs, and advisories
        return false if filepath.start_with?('release')
        return false if filepath.start_with?('cockroachcloud')
        return false if filepath.start_with?('api')
        return false if filepath.start_with?('advisories')

        # Exclude from index if files are not part of stable version.
        # If valid stable version does not exist, index dev version.
        versions = Configurator.config['versions']
        stable_version = versions['stable']
        dev_version = versions['dev']

        if filepath.start_with?(stable_version)
          # Do not exclude from index if files are part of stable version
          false
        elsif filepath.start_with?(dev_version)
          # Do exclude dev version from index if a stable version exists
          has_stable_version?(filepath, dev_version, stable_version)
        else
          # For all cases that do not fall into the above two categories,
          # do exclude
          true
        end
      end

      def self.has_stable_version?(filepath, dev_version, stable_version)
        begin
          File.file?(filepath.sub(dev_version, stable_version))
        rescue StandardError
          false
        end
      end

      # Public: Custom method to be run on the record before indexing it
      #
      # record - The hash of the record to be pushed
      # node - The Nokogiri node of the element
      #
      # Users can modify the record (adding/editing/removing keys) here. It can
      # be used to remove keys that should not be indexed, or access more
      # information from the HTML node.
      #
      # Users can return nil to signal that the record should not be indexed
      def self.before_indexing_each(filepath, record, _node, context)
        [:version,
         :versions,
         :release_info,
         :sidebar_data,
         :toc,
         :redirect_from].each { |k| record.delete(k)}

        record[:version] = record[:url].split('/')[1]
        record[:url] = "https://www.cockroachlabs.com/docs#{record[:url]}"

        if filepath.start_with?('cockroachcloud') || context.config['cockroachcloud']
          record[:doc_type] = 'cockroachcloud'
        else
          record[:doc_type]  = 'cockroachdb'
        end
        record
      end

      # Public: Custom method to be run on the list of all records before
      # indexing them
      #
      # records - The list of all records to be indexed
      #
      # Users can modify the full list from here. It might provide an easier
      # interface than `hook_before_indexing_each` when knowing the full context
      # is necessary
      def self.before_indexing_all(records, _context)
        records
      end
    end
  end
end
