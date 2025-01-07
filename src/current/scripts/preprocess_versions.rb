require 'csv'
require 'yaml'

input_file = '_data/versions.csv'
output_file = '_data/preprocessed_versions.yml'

# Read CSV and filter rows
filtered_versions = []
CSV.foreach(input_file, headers: true) do |row|
  major_version = row['major_version']
  next if major_version == 'dev' || major_version == 'stable'
  filtered_versions << { 'major_version' => major_version }
end

# Write to YAML
File.open(output_file, 'w') { |file| file.write(filtered_versions.to_yaml) }
