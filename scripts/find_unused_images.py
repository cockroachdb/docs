import os

"""
This script identifies images that are not used in any doc pages
so they can be removed. Run it from within the scripts directory.
"""

def _error(exc):
    raise exc

images = list()
for root, dirs, files in os.walk("../images", onerror=_error):
    for f in files:
        images.append(f)
print("Total # of image files:", len(images))

docs = list()
for path, dirs, files in os.walk("../", onerror=_error):
    for name in files:
        docs.append(os.path.join(path, name))

unused_images = images
for doc in docs:
    try:
        with open(doc) as file:
            data = file.read()
            for i in images:
                if i in data and i in unused_images:
                    unused_images.remove(i)
    except Exception as e:
        """
        Uncomment the next line to see the files that cannot be read.
        Mostly, these will be binary files.
        """
        # print("exception:", e, "\n", "doc:", doc)
        continue

print("# of unused image files:", len(unused_images))
print("Unused image files:", unused_images)
