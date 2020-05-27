#!/usr/bin/env python3

import os
import re
import argparse
import shutil
import yaml

# With each new major release of CockroachDB, there are a number of
# administrative tasks that need to be accomplished on the docs website.  This
# includes, but is not limited to:

# - Create a new `vXY.Z` folder, and copy content to it
#
# - Copy includes to a new `_includes/vXY.Z` folder
#
# - Copy images to a new versioned folder, and edit image link text in the
# referencing documents as needed to point to the right places
#
# - Update the YAML config files with the new version info
#
# - Create a new sidebar JSON file
#
# - In the newly created XY.Z folder, remove the various "new in vXY.Z-1"
# callouts from the copied files.
#
# Note: this list may not be exhaustive, see the code below for details.
#
# This script attempts to automate these tasks as much as possible.  In
# addition to copying files around, editing files, etc., it also searches for
# references to the previous version vX.Y.Z-1 in the newly copied files that
# now serve as the documentation for vX.Y.Z, and shows those references to the
# end user (as grep-like output), so they can be edited (or not) as needed.
#
# For example, to do all of the admin tasks around bumping the version of
# CockroachDB from 20.1 to 20.2, and then surfacing the places where additional
# edits may be needed, run:
#
# $ ./bump_major_version.py -d /path/to/docs -f 20.1 -t 20.2

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

from_version = args.from_version
to_version = args.to_version
docs_directory = args.docs_directory

# Every file we touch that has content in it will also be stored here.  At the
# end we will iterate over the lines of each file and do some simple-minded
# transformations (mostly regexes to check and bump version numbers, and remove
# "New in vXX.1" tags).
files_to_check = {}


def version_string_name(version):
    # Int -> String
    return 'v' + str(version)


def make_new_version_folder(version):
    # Int -> IO!
    new_directory = os.path.join(docs_directory, version_string_name(version))
    if not os.path.exists(new_directory):
        os.mkdir(new_directory)


def copy_files(from_version, to_version):
    # Int Int -> IO! State!
    src_dir = os.path.join(docs_directory,
                           version_string_name(from_version))
    dest_dir = os.path.join(docs_directory, version_string_name(to_version))
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    shutil.copytree(src_dir, dest_dir)
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


def copy_includes(from_version, to_version):
    # Int Int -> IO! State!
    src_dir = os.path.join(docs_directory, '_includes',
                           version_string_name(from_version))
    dest_dir = os.path.join(docs_directory, '_includes',
                            version_string_name(to_version))

    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    shutil.copytree(src_dir, dest_dir)

    # Traverse down the directory containing the "include files", adding each
    # to our list of files to check later for references to the old version.
    marktree(dest_dir)


def copy_images(from_version, to_version):
    # Int Int -> IO!
    src_dir = os.path.join(docs_directory, 'images',
                           version_string_name(from_version))
    dest_dir = os.path.join(docs_directory, 'images',
                            version_string_name(to_version))
    if os.path.exists(dest_dir):
        shutil.rmtree(dest_dir)
    shutil.copytree(src_dir, dest_dir)


def copy_sidebar_json(from_version, to_version):
    # Int Int -> IO! State!
    src_version = version_string_name(from_version)
    dest_version = version_string_name(to_version)

    # Do it once for CockroachDB
    src_json = os.path.join(docs_directory,
                            '_includes',
                            'sidebar-data-' + src_version + '.json')
    dest_json = os.path.join(docs_directory,
                             '_includes',
                             'sidebar-data-' + dest_version + '.json')

    shutil.copy2(src_json, dest_json)
    files_to_check[dest_json] = 1

    # Do it once more for CockroachCloud
    src_json_cloud = os.path.join(docs_directory,
                                  '_includes',
                                  'sidebar-data-' + src_version +
                                  '.cockroachcloud.json')
    dest_json_cloud = os.path.join(docs_directory,
                                   '_includes',
                                   'sidebar-data-' + dest_version +
                                   '.cockroachcloud.json')

    shutil.copy2(src_json_cloud, dest_json_cloud)
    files_to_check[dest_json_cloud] = 1


def strip_out_new_or_changed_in_vXYZ(version, file):
    # Int Path -> IO!

    # ugggggggghhhhhh this should become a regex, but for now this is serving
    # as "documentation" of all the variant usages.
    new_in_vXXX_string_00 = '<span class="version-tag">New in ' + \
        version_string_name(version) + ':</span>'
    new_in_vXXX_string_01 = '<span class="version-tag">New in ' + \
        version_string_name(version) + '</span>:'
    new_in_vXXX_string_02 = '<span class="version-tag">New in ' + \
        version_string_name(version) + '</span>'
    changed_in_vXXX_string_00 = '<span class="version-tag">Changed in ' + \
        version_string_name(version) + '</span>'
    changed_in_vXXX_string_01 = '<span class="version-tag">Changed in ' + \
        version_string_name(version) + ':</span>'

    # Read in the file
    filedata = None
    try:
        with open(file, 'r') as f:
            filedata = f.read()
    except UnicodeDecodeError:
        return

    # Replace the target string
    filedata = filedata.replace(new_in_vXXX_string_00, '')
    filedata = filedata.replace(new_in_vXXX_string_01, '')
    filedata = filedata.replace(new_in_vXXX_string_02, '')
    filedata = filedata.replace(changed_in_vXXX_string_00, '')
    filedata = filedata.replace(changed_in_vXXX_string_01, '')

    # Write the file out again
    with open(file, 'w') as f:
        f.write(filedata)


def update_image_versions(old_version, new_version, file):
    # Int Int Path -> IO!

    old_image_string = '''img src="{{ 'images/''' + \
        version_string_name(old_version)
    new_image_string = '''img src="{{ 'images/''' + \
        version_string_name(new_version)

    # Read in the file
    filedata = None
    try:
        with open(file, 'r') as f:
            filedata = f.read()
    except UnicodeDecodeError:
        return

    # Replace the target string
    filedata = filedata.replace(old_image_string, new_image_string)

    # Write the file out again
    with open(file, 'w') as f:
        f.write(filedata)


def grep_for_old_versionish_things(old_version, file):
    # Int Path -> IO!
    pat = re.compile(version_string_name(old_version))
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


def update_base_yaml_config(to_version):
    # Int -> IO!
    file = os.path.join(docs_directory, '_config_base.yml')

    # Read in the file
    filedata = None
    try:
        with open(file, 'r') as f:
            filedata = f.read()
    except UnicodeDecodeError:
        return

    config = yaml.load(filedata, Loader=yaml.BaseLoader)

    new_version_name = version_string_name(to_version)

    newdata = '''
    name: {}
    version: {}
    docker_image: cockroachdb/cockroach-unstable
    build_time: 2020/05/12 11:00:26 (go1.13.4)
    start_time: 2020-05-12 11:01:26.34274101 +0000 UTC
'''.format(new_version_name, new_version_name)

    newdata_loaded = yaml.load(newdata, Loader=yaml.BaseLoader)

    config['release_info'][new_version_name] = newdata_loaded

    # Write the file out again
    with open(file, 'w') as f:
        f.write(yaml.dump(config))


def update_cockroachdb_yaml_config(from_version, to_version):
    # Int Int -> IO!
    file = os.path.join(docs_directory, '_config_cockroachdb.yml')

    # Read in the file
    filedata = None
    try:
        with open(file, 'r') as f:
            filedata = f.read()
    except UnicodeDecodeError:
        return

    config = yaml.load(filedata, Loader=yaml.BaseLoader)

    old_version_name = version_string_name(from_version)
    new_version_name = version_string_name(to_version)

    config['versions']['stable'] = old_version_name
    config['versions']['dev'] = new_version_name

    # Write the file out again
    with open(file, 'w') as f:
        f.write(yaml.dump(config))


def copy_releases_page(from_version, to_version):
    # Int Int -> IO! State!
    old_releases_page = os.path.join(docs_directory, 'releases',
                                     version_string_name(from_version) +
                                     '.0.md')
    new_releases_page = os.path.join(docs_directory, 'releases',
                                     version_string_name(to_version) + '.md')
    if not os.path.exists(new_releases_page):
        shutil.copy2(old_releases_page, new_releases_page)
        files_to_check[new_releases_page] = 1


if __name__ == "__main__":
    # Copying things around
    make_new_version_folder(to_version)
    copy_files(from_version, to_version)
    copy_includes(from_version, to_version)
    copy_images(from_version, to_version)
    copy_sidebar_json(from_version, to_version)
    copy_releases_page(from_version, to_version)

    # YAML config file tweaks so the build works with the new content.
    update_base_yaml_config(to_version)
    update_cockroachdb_yaml_config(from_version, to_version)

    # In-place edits, and looking for things inside files that need manual
    # edits.
    for file, _ in sorted(files_to_check.items()):
        # Skip autosave files
        if file.endswith('~'):
            next
        # First, we strip out the "new in vXY.Z", etc., tags.
        strip_out_new_or_changed_in_vXYZ(from_version, file)
        # Next, we rewrite all of the image version paths.  For possibly
        # historical reasons (?), these are hardcoded paths and do not use the
        # Liquid '{{page.version.version}}' syntax.
        update_image_versions(from_version, to_version, file)
        # Then, we bring the human into the loop for the real work: possibly
        # tricky edits of anything mentioning the old version.
        grep_for_old_versionish_things(from_version, file)
