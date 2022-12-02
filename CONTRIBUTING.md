# Contribute to CockroachDB Docs

The CockroachDB docs are open source just like the database itself. We welcome your contributions!

## Setup

This section helps you set up the tools you'll need to write the docs and use CockroachDB.

These instructions assume that you use macOS. If you use Linux, use your default package manager to install the packages mentioned in these steps, rather than Homebrew.

1. Install [Homebrew](https://brew.sh/), a macOS package manager you'll use for a few different installations.

    ```
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
    ```

2. Install Ruby, the language required by Jekyll, our website generator, and Gem, which is a package manager for Ruby.

    ```
    brew update
    brew install ruby
    brew install brew-gem
    ````

    You can find instructions to install [Ruby](https://www.ruby-lang.org/en/documentation/installation/#package-management-systems) for Linux or other operating systems.

3. Update your `$PATH` variable to use Ruby from Homebrew. The following example configures ZSH. **Homebrew detects your shell and provides the exact command to use as part of installing Ruby.**

    ```
    echo 'export PATH="/opt/homebrew/opt/ruby/bin:$PATH"' >> ~/.zshrc
    ```
    
4. Install the latest version of Git from Homebrew.

   ```
   brew install git
   ```
   
   You can find instructions to install [git](https://www.atlassian.com/git/tutorials/install-git) for Linux or other operating systems.
   
5. Install the latest version of `htmltest`.

   ```
   brew install htmltest
   ```
   
   You can find instructions to install [htmltest]([https://www.atlassian.com/git/tutorials/install-git](https://github.com/wjdp/htmltest)) for Linux or other operating systems.

6. Fork the [CockroachDB docs repository](https://github.com/cockroachdb/docs).

7. [Create a local clone](https://help.github.com/articles/cloning-a-repository/) of your fork.

8. Use Gem from Homebrew to install [Jekyll](https://jekyllrb.com/docs/), the tool we use to transform Markdown and layout files into a complete, static HTML site. **Use the `brew-gem` command. If you use `gem`, you'll be using the outdated version of Ruby that installs with macOS.**

    ```
    sudo brew-gem install jekyll bundler
    ```

    If you get a permission error, make sure you're using `brew-gem` and Ruby from Homebrew, rather than `/usr/bin/gem` and `/usr/bin/ruby`.

9. Learn the essentials of our [Docs Structure](#docs-structure).

10. Review our [Style Guide](https://github.com/cockroachdb/docs/blob/master/StyleGuide.md).

## Get started

Once you're ready to contribute:

1. Create a new local branch for your work:

    ``` shell
    $ cd path/to/docs
    $ git checkout -b "<your branch name>"
    ```

2. Make your changes in the text editor of your choice (e.g., [Atom](https://atom.io/), [Sublime Text](https://www.sublimetext.com/)).

    Each documented version of CockroachDB has a docs subdirectory. For example, docs for CockroachDB v19.1 are in the `v19.1` directory, whereas docs for CockroachDB v2.1 are in the `v2.1` directory. This is true of most files in the `_includes` and `images` directories as well.

3. Check the files you've changed:

    ```
    git status
    ```

4. Stage your changes for commit:

    ```
    git add <filename>
    ```

5. Commit your changes:

    ```
    git commit -m "<concise message describing changes>"
    ```

6. Use Jekyll to [build a version of the site locally](#build-and-test-the-docs-locally) so you can view your changes in a browser:

    ```
    make cockroachdb
    ```

7. [Push your local branch to your remote fork](https://help.github.com/articles/pushing-to-a-remote/).

8. Back in your fork of the CockroachDB docs repo in the GitHub UI, [open a pull request](https://github.com/cockroachdb/docs/pulls) and assign it to `jseldess`. If you check the `Allow edits from maintainers` option when creating your pull request, we'll be able to make minor edits or fixes directly, if it seems easier than commenting and asking you to make those revisions, which can streamline the review process.

We'll review your changes, providing feedback and guidance as necessary. Also, Teamcity, the system we use to automate tests, will run the markdown files through Jekyll and then run [htmltest](https://github.com/cockroachdb/htmltest) against the resulting HTML output to check for errors. Teamcity will also attempt to sync the HTML to an AWS server, but since you'll be working on your own fork, this part of the process will fail; do not worry about the Teamcity fail status.

## Keep contributing

If you want to regularly contribute to the CockroachDB docs, there are a few things we recommend:

1. Make it easy to bring updated docs into your fork by tracking us upstream:

    ``` shell
    $ git remote add --track master upstream https://github.com/cockroachdb/docs.git
    ```

2. When you're ready to make your next round of changes, get our latest docs:

    ``` shell
    $ git fetch upstream
    $ git merge upstream/master
    ```

3. Repeat the write, build, push, pull flow from the [Get Started](#get-started) section above.

## Build and Test the Docs Locally

Once you've installed Jekyll and have a local clone of the docs repository, you can build and test the docs as follows:

1. From the root directory of your clone, :

    - To build the CockroachDB docs, run `make cockroachdb`.

2.  Point your browser to `http://127.0.0.1:4000/docs/` and manually check your changes.

    - If the page you want to test isn't listed in the sidebar, just point to it directly, for example, `http://127.0.0.1:4000/docs/new-page.html`.

    - When you make additional changes, Jekyll automatically regenerates the HTML content. No need to stop and re-start Jekyll; just refresh your browser.

    Once you're done viewing your changes, use **CTRL-C** to stop the Jekyll server.

## Docs structure

- [Pages](#pages)
- [Sidebar](#sidebar)

### Pages

We provide documentation for each major version of CockroachDB. The pages for each version are found in a directory named for the version. For example, docs for CockroachDB v19.1 are in the `v19.1` directory, whereas docs for CockroachDB v19.2 are in the `v19.2` directory.

Within each version directory, each page must be an `.md` file written in the redcarpet dialect of Markdown. File names should be lowercase with a dash between words, and should be brief but descriptive.

Example:

- `name-of-your-file.md`

Markdown pages must start with the following front-matter:

```
---
title: Title of Page
summary: Short description of page for SEO
---
```

Field | Description | Default
------|-------------|--------
`title`| Used as the h1 header and written in title-case. | Nothing
`summary` | Used as the page's `meta description` for SEO. Keep this under 155 characters. Consider using the first sentence of the page, or something similar. The summary must be between 50-160 characters. | Nothing

Optionally, you can specify other fields in the front-matter:

Field | Description | Default
------|-------------|--------
`toc` | Adds an auto-generated table of contents to the right of the page body (on standard screens) or at the top of the page (on smaller screens). | `true`
`toc_not_nested` | Limits a page's TOC to h2 headers only. | `false`
`allowed_hashes` | Specifies a list of allowed hashes that do not correspond to a section heading on the page. | Nothing
`feedback` | Adds "Yes/No" feedback buttons at the bottom of the page. See [Feedback Widget](#feedback-widget) for more details. | `true`
`contribute` | Adds "Contribute" options at the top-right of the page. See [Contributing Options](#contributing-options) for more details. | `true`
`twitter` | Adds code required to track the page as part of a Twitter campaign | `false`
`no_sidebar` | If `true`, removes the sidebar from a page. See [Sidebar](#sidebar) for more details. | Nothing
`block_search` | If `true`, adds meta tags to the header that excludes the page from search indexing/caching. | Nothing
`back_to_top` | If `true`, adds a back-to-top button to the page. This is only helpful in cases where the page is very long and there is no page toc, e.g., the Full SQL Grammar page.
`docs_area` | For page analytics. Set this to the main sidenav area where the page is found, e.g., `get_started`, `develop`, `deploy`, `manage`, `migrate`, `stream_data`, `reference`, `releases`. For `reference`, also indicate the subsection, e.g., `reference.sql`, `reference.cli`, `reference.api`. These values will likely change over time. | Nothing
`product_area` | For page analytics. Set this to the Product Area primary responsible for the page. This field is currently not used, pending team discussion.

#### Page TOC

The CockroachDB Jekyll theme can auto-generate a page-level table of contents listing all h2 and h3 headers or just all h2 headers on the page. Related files: `js/toc.js` and `_includes/toc.html`.

- To add a page TOC, set `toc: true` in the page's front-matter.

- To omit a page TOC from the page, set `toc: false` in the page's front-matter.

- By default, a page TOC includes h2 and h3 headers. To limit a page TOC to h2 headers only, set `toc_not_nested: true` in the page's front-matter.

#### Auto-included content

Some pages auto-include content from the [`_includes`](_includes) directory. For example, each SQL statement page includes a syntax diagram from `_includes/<version>/sql/diagrams`, and the [build-an-app-with-cockroachdb.md](build-an-app-with-cockroachdb.md) tutorials include code samples from `_includes/<version>/app`.

The syntax for including content is `{% include {{ page.version.version }}/<filepath> %}`, for example, `{% include {{ page.version.version }}/app/basic-sample.rb %}`.

#### Version tags

New and changed features should be called out in the documentation using version tags.

- To add a version tag to a paragraph, place `<span class="version-tag">New in vX.X:</span>` at the start of the paragraph, e.g:

    ```
    <span class="version-tag">New in v1.1:</span> The `user_privileges` view identifies global privileges.
    ```

- To add a version tag to a heading, place `<span class="version-tag">New in vX.X</span>` to the right of the heading, for example:

    ```
    ## SQL Shell Welcome <div class="version-tag">New in v2.1</div>
    ```

When calling out a change, rather than something new, change `New in vX.X` to `Changed in vX.X`.

#### Allowed hashes

In a page's front-matter, you can specify a list of allowed hashes
that do not correspond to a section heading on the page. This is
currently used for pages with JavaScript toggle buttons, where the
toggle to activate by default can be specified in the URL hash. If you
attempt to link to, for example, `page-with-toggles.html#toggle-id` without
listing `toggle-id` in `allowed_hashes`, our HTML tester will complain
that `toggle-id` does not exist on the page. Listing a hash in
`allowed_hashes` will generate a placeholder element with that ID at the top
of the page, which satisfies our HTML tester.

Here's an example from a page with OS toggles:

```
allowed_hashes: [os-mac, os-linux, os-windows]
```

#### Images

For information about how we use images in our docs, see [Images](https://github.com/cockroachdb/docs/wiki/Style-Guide#images) in our [Style Guide](https://github.com/cockroachdb/docs/blob/master/StyleGuide.md).

#### Feedback widget

We show "Yes/No" feedback buttons at the bottom of every page by default. To remove these buttons from a page, set `feedback: false` in the page's front-matter.

#### Contributing options

We show "Contribute" options in the top-right of every page by default. To remove these options from a page, set `contribute: false` in the page's front-matter.

### Sidebar

For each documented version of CockroachDB, a JSON file in the `_includes` directory defines the pages that appear in the docs sidebar. For example, the sidebar for CockroachDB v1.0 is defined by [`_includes/sidebar-data-v1.0.json`](https://github.com/cockroachdb/docs/blob/master/_includes/sidebar-data-v1.0.json).

If you're adding a page that you think should appear in the sidebar, please mention this in your pull request.

In the JSON file for a version's sidebar, there are three possible fields:

Field | Type | Description
------|------|------------
`title` | String | At the top level, this field defines the title for a section of the sidenav, e.g., `Get Started`. Within the `items` field, `title` defines either the title for a subsection or the title for a page, which can be different from the actual page title. See the [JSON Example](#json-example) below for more clarity.
`items` | Array of objects | The pages in a section of the sidenav.
`urls` | Array of strings | The URLs for a page in the sidenav, each formatted as `/${VERSION}/<page-name>.html`, e.g., `/${VERSION}/learn-cockroachdb-sql.html`. The first URL is the page to link to. The subsequent URLs are pages that should highlight this title in the sidebar.

#### JSON example

This example shows some of the first section of the sidenav, `Get Started`:
- The first `title` field defines the section title.
- The first `items` field contains multiple objects, each defining pages in the section:
    - The first object defines the title and URL for the first page in the section, `Install CockroachDB`.
    - The second object is more complex. It defines a subsection titled `Start a Local Cluster`. This object contains its own `items` field, which in turn contains multiple objects, each defining the title and URL for a page.

``` json
[
  {
    "title": "Get Started",
    "items": [
      {
        "title": "Install CockroachDB",
        "urls": [
          "/${VERSION}/install-cockroachdb.html"
        ]
      },
      {
        "title": "Start a Local Cluster",
        "items": [
          {
            "title": "From Binary",
            "urls": [
              "/${VERSION}/start-a-local-cluster.html",
              "/${VERSION}/secure-a-cluster.html"
            ]
          },
          {
            "title": "In Docker",
            "urls": [
              "/${VERSION}/start-a-local-cluster-in-docker.html"
            ]
          }
        ]
      },
      ...
    ]
  }
]
```

## Style guide

See [Style Guide](https://github.com/cockroachdb/docs/blob/master/StyleGuide.md) for more details.
