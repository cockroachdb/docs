import os
from os import listdir
from os.path import isfile, join

directories = ["v19.1/", "v19.1/architecture/", "v19.1/training/"]

# Add client-side redirects to all files in the specified directories.
for d in directories:
    onlyfiles = [f for f in listdir(d) if isfile(join(d, f))]
    for file in onlyfiles:
        filename = d + file
        with open(filename, "r") as f:
            source = f.readlines()
            os.remove(filename)
            with open(filename, "a") as new_file:
                count = 1
                for line in source:
                    if line.startswith("---\n"):
                        if count == 2:
                            page = file.replace(".md", ".html")
                            new_file.write("redirect_from: /v2.2/" + page + "\n---\n")
                            count == 0
                        if count == 1:
                            new_file.write(line)
                            count += 1
                    else:
                        new_file.write(line)
