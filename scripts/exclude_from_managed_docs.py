import os
from os import listdir
from os.path import isfile, join

directories = ["v2.1/", "v2.1/architecture/", "v2.1/training/"]
exclude_list = ["ci", "vendor", "v1.0", "v1.1", "v2.0"]
config_file = "_config_managed.yml"

# Scrape all 2.1 pages and add any with `cloud: false` to exclude_list.
for d in directories:
    onlyfiles = [f for f in listdir(d) if isfile(join(d, f))]
    for file in onlyfiles:
        filename = d + file
        with open(filename, "r+") as f:
            source = f.readlines()
            if "standard_only: true\n" in source:
                exclude_list.append(filename)

# Add the exclude_list to the cloud docs config file.
with open(config_file, "r") as f:
    source = f.readlines()
    os.remove(config_file)
    with open(config_file, "a") as new_file:
        for line in source:
            if line.startswith("exclude:"):
                new_file.write("exclude: " + str(exclude_list) + "\n")
            else:
                new_file.write(line)
