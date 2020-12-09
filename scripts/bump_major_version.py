#!/usr/bin/env python3

"""Update docs site for a new major version

With each new major release of CockroachDB, there are a number of
administrative tasks that need to be accomplished on the docs website. This
includes, but is not limited to:

- Create a new `vXY.Z` folder, and copy content to it
- Copy includes to a new `_includes/vXY.Z` folder
- Copy images to a new versioned folder, and edit image link text in the
referencing documents as needed to point to the right places
- Update the YAML config files with the new version info
- Create a new sidebar JSON file
- In the newly created XY.Z folder, remove the various "new in vXY.Z-1"
callouts from the copied files.

Note: this list may not be exhaustive, see the code below for details.

This script attempts to automate these tasks as much as possible.

For example, to do all of the admin tasks around bumping the version of
CockroachDB from 20.1 to 20.2, and then surfacing the places where additional
edits may be needed, run:

$ ./bump_major_version.py -d /path/to/docs -f 20.1 -t 20.2

Running this command will generate a lot of output, since
it attempts to grep for the "old-versionish" things in the docs that
have been copied over into the new version.  These potential
references to the previous version will need to be manually reviewed
and edited by a human.

Finally, note that this script is *only* for use when CockroachDB
does a major version release, since that is the only time we would
ever create a new version folder and copy files into it.  That means
this script would be used for a 20.1 -> 20.2 transition, but *not*
for a 20.1.1 to 20.1.2 transition.

Requirements:
  - PyYAML: https://pyyaml.org/wiki/PyYAMLDocumentation
"""

import os
import re
import argparse
import shutil
import yaml

parser = argparse.ArgumentParser(
    description="do admin tasks related to version bumps"
)

parser.add_argument("-f", "--from-version",
                    required=True,
                    help="previous version of CockroachDB")

parser.add_argument("-t", "--to-version",
                    required=True,
                    help="next version of CockroachDB")

parser.add_argument("-d", "--docs-directory",
                    default=os.environ.get("COCKROACH_DOCS_REPO"),
                    help="directory where you store 'cockroachdb/docs'")

args = parser.parse_args()

old_version = args.from_version
new_version = args.to_version
docs_directory = args.docs_directory

# Every file we touch that has content in it will also be stored here.  At the
# end we will iterate over the lines of each file and do some simple-minded
# transformations (mostly regexes to check and bump version numbers, and remove
# "New in vXX.1" tags).
files_to_check = {}


def version_string_name(version):
    # Int -> String
    return 'v' + str(version)


old_version_name = version_string_name(old_version)
new_version_name = version_string_name(new_version)


def copy_files(type=None):
    # Int Int -> IO! State!

    marktree_p = False

    if type == 'images':
        subdirectory = 'images'
    elif type == 'includes':
        subdirectory = '_includes'
        marktree_p = True
    # This option is provided for clarity, but is not really needed.
    elif type == 'docs':
        subdirectory = ''
        marktree_p = True
    else:
        subdirectory = ''
        marktree_p = True

    src_dir = os.path.join(docs_directory,
                           subdirectory, old_version_name)
    dest_dir = os.path.join(docs_directory,
                            subdirectory, new_version_name)

    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)

    shutil.copytree(src_dir, dest_dir)

    if marktree_p:
        # Traverse down the directory, adding each to our list of
        # content files to check later for references to the old
        # version of CockroachDB.
        marktree(dest_dir)


def marktree(path):
    # Path -> State!

    # Recursively add the files in this subtree to our list of files to check
    # later for mentions of the previous version number.
    for dirpath, dirnames, filenames in os.walk(path):
        for file in filenames:
            f = os.path.join(dirpath, file)
            if f not in files_to_check:
                files_to_check[f] = 1


def copy_sidebar_json():
    # Int Int -> IO! State!

    # Do it once for CockroachDB
    src_json = os.path.join(docs_directory,
                            '_includes',
                            'sidebar-data-' + old_version_name + '.json')
    dest_json = os.path.join(docs_directory,
                             '_includes',
                             'sidebar-data-' + new_version_name + '.json')

    shutil.copy2(src_json, dest_json)
    files_to_check[dest_json] = 1


def read_file(file):
    # Read in the file all in one go, and return the data.
    filedata = None
    try:
        with open(file, 'r') as f:
            filedata = f.read()
    except UnicodeDecodeError:
        # We skip files that are not text, such as tarballs like:
        # _includes/v20.2/app/hibernate-basic-sample/hibernate-basic-sample.tgz
        return
    return filedata


def write_file(file, data):
    with open(file, 'w') as f:
        f.write(data)


def strip_out_new_or_changed_in_vXYZ(file):
    # Int Path -> IO!

    # ugggggggghhhhhh this should become a regex, but for now this is serving
    # as "documentation" of all the variant usages.
    new_in_vXXX_string_00 = '<span class="version-tag">New in ' + \
        old_version_name + ':</span>'
    new_in_vXXX_string_01 = '<span class="version-tag">New in ' + \
        old_version_name + '</span>:'
    new_in_vXXX_string_02 = '<span class="version-tag">New in ' + \
        old_version_name + '</span>'
    changed_in_vXXX_string_00 = '<span class="version-tag">Changed in ' + \
        old_version_name + '</span>'
    changed_in_vXXX_string_01 = '<span class="version-tag">Changed in ' + \
        old_version_name + ':</span>'

    filedata = read_file(file)

    if filedata is None:
        # We skip files that are not text, such as tarballs
        return

    # Replace the target string
    filedata = filedata.replace(new_in_vXXX_string_00, '')
    filedata = filedata.replace(new_in_vXXX_string_01, '')
    filedata = filedata.replace(new_in_vXXX_string_02, '')
    filedata = filedata.replace(changed_in_vXXX_string_00, '')
    filedata = filedata.replace(changed_in_vXXX_string_01, '')

    write_file(file, filedata)


def update_image_versions(file):
    # Int Int Path -> IO!

    old_image_string = '''img src="{{ 'images/''' + \
        old_version_name
    new_image_string = '''img src="{{ 'images/''' + \
        new_version_name

    filedata = read_file(file)

    if filedata is None:
        # We skip files that are not text, such as tarballs
        return

    # Replace the target string
    filedata = filedata.replace(old_image_string, new_image_string)

    write_file(file, filedata)


def grep_for_old_versionish_things(file):
    # Int Path -> IO!
    pat = re.compile(old_version_name)
    lineno = 0
    try:
        with open(file) as f:
            for line in f:
                lineno += 1
                matches = re.findall(pat, line)
                if len(matches) != 0:
                    print("{}:{}".format(file, lineno))
                    print("{}".format(line))
    except UnicodeDecodeError:
        pass


def update_base_yaml_config():
    # Int -> IO!
    file = os.path.join(docs_directory, '_config_base.yml')

    filedata = read_file(file)

    config = yaml.load(filedata, Loader=yaml.BaseLoader)

    newdata = '''
    name: {}
    version: {}
    docker_image: cockroachdb/cockroach-unstable
    build_time: 2020/05/12 11:00:26 (go1.13.4)
    start_time: 2020-05-12 11:01:26.34274101 +0000 UTC
'''.format(new_version_name, new_version_name)

    newdata_loaded = yaml.load(newdata, Loader=yaml.BaseLoader)

    config['release_info'][new_version_name] = newdata_loaded

    write_file(file, yaml.dump(config))


def update_cockroachdb_yaml_config():
    # Int Int -> IO!
    file = os.path.join(docs_directory, '_config_cockroachdb.yml')

    filedata = read_file(file)

    config = yaml.load(filedata, Loader=yaml.BaseLoader)

    config['versions']['stable'] = old_version_name
    config['versions']['dev'] = new_version_name

    write_file(file, yaml.dump(config))


def copy_releases_page():
    # Int Int -> IO! State!
    old_releases_page = os.path.join(docs_directory, 'releases',
                                     old_version_name + '.0.md')
    new_releases_page = os.path.join(docs_directory, 'releases',
                                     new_version_name + '.md')
    if not os.path.exists(new_releases_page):
        shutil.copy2(old_releases_page, new_releases_page)
        files_to_check[new_releases_page] = 1


if __name__ == "__main__":
    # Copying things around
    copy_files(type='docs')
    copy_files(type='includes')
    copy_files(type='images')
    copy_sidebar_json()
    copy_releases_page()

    # YAML config file tweaks so the build works with the new content.
    update_base_yaml_config()
    update_cockroachdb_yaml_config()

    # In-place edits, and looking for things inside files that need manual
    # edits.
    for file, _ in sorted(files_to_check.items()):
        # Skip autosave files
        if file.endswith('~'):
            next
        # First, we strip out the "new in vXY.Z", etc., tags.
        strip_out_new_or_changed_in_vXYZ(file)
        # Next, we rewrite all of the image version paths.  For possibly
        # historical reasons (?), these are hardcoded paths and do not use the
        # Liquid '{{page.version.version}}' syntax.
        update_image_versions(file)
        # Then, we bring the human into the loop for the real work: possibly
        # tricky edits of anything mentioning the old version.
        grep_for_old_versionish_things(file)
