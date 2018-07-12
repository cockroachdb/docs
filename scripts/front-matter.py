import os
from os import listdir
from os.path import isfile, join

directories = ["../v1.0/", "../v1.1/", "../v1.1/architecture/", "../v1.1/training/", "../v2.0/", "../v2.0/architecture/", "../v2.0/training/", "../v2.1/", "../v2.1/architecture/", "../v2.1/training/"]

for d in directories:
    onlyfiles = [f for f in listdir(d) if isfile(join(d, f))]
    for file in onlyfiles:
        filename = d + file
        with open(filename, "r+") as f:
            source = f.readlines()
            if '<div id="toc"></div>\n' in source:
                os.remove(filename)
                new_file = open(filename, "a")
                for line in source:
                    if line == "toc: false\n":
                        new_file.write("toc: true\n")
                    elif line != '<div id="toc"></div>\n':
                        new_file.write(line)
