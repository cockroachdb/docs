import os

""" This script identifies images that are not used in any doc pages
so they can be removed. Run it from within the scripts directory. """

images = list()
for root, dirs, files in os.walk("../images"):
    for f in files:
        images.append(f)
print("Total # of image files:", len(images))

dirs = list()
for path, subdirs, files in os.walk("../"):
    dirs.append(path)

docs = list()
for d in dirs:
    for path, subdirs, files in os.walk(d):
        for name in files:
            docs.append(os.path.join(path, name))

unused_images = images
unread_files = list()
for doc in docs:
    try:
        with open(doc) as file:
            data = file.read()
            for i in images:
                if i in data and i in unused_images:
                    unused_images.remove(i)
    except:
        unread_files.append(doc)
        # print("exception:", e, "\n", "doc:", doc, "\n")

print("# of unused image files:", len(unused_images))
print("Unused image files:", unused_images)

open("not_checked_for_images.txt", "a").write(str(unread_files))
