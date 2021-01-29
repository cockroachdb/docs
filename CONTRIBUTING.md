# Contributing to CockroachDB Docs

The CockroachDB docs are open source just like the database itself. We welcome your contributions!

## Setup

This section helps you set up the tools you'll need to write the docs and use CockroachDB.

1. Install [Homebrew](https://brew.sh/), a macOS package manager you'll use for a few different installations. If you use Linux, then default package manager will work fine as well:

    ``` 
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install.sh)"
    ```

2. Install Ruby, the language required by Jekyll, our website generator, and the latest version of Git, the source control tool we use:

    ```
    brew update
    brew install ruby
    brew install git
    ````

You can find instructions to install [Ruby](https://www.ruby-lang.org/en/documentation/installation/#package-management-systems) and [git](https://www.atlassian.com/git/tutorials/install-git) for other distributions. 

3. Fork the [CockroachDB docs repository](https://github.com/cockroachdb/docs).

4. [Create a local clone](https://help.github.com/articles/cloning-a-repository/) of your fork:

5. Install [Jekyll](https://jekyllrb.com/docs/), the tool we use to transform Markdown and layout files into a complete, static HTML site:

    ```
    gem install jekyll bundler
    ```
If you get a permissions error, then try re-running the command with `sudo`.    
    
6. Learn the essentials of our [Docs Structure](#docs-structure).

7. Review our simple [Style Guide](https://github.com/cockroachdb/docs/wiki/Style-Guide).

## Get Started

Once you're ready to contribute:

1. Create a new local branch for your work:

    ``` shell
    $ cd path/to/docs
    $ git checkout -b "<your branch name>"
    ```

2. Make your changes in the text editor of your choice (e.g., [Atom](https://atom.io/), [Sublime Text](https://www.sublimetext.com/)).

    Note that there are distinct directories for each documented version of CockroachDB. For example, docs for CockroachDB v19.1 are in the `v19.1` directory, whereas docs for CockroachDB v2.1 are in the `v2.1` directory. This is true of most files in the `_includes` and `images` directories as well.

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

## Keep Contributing

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

    - To build the CockroachDB and CockroachCloud docs, run `make cockroachdb`.

2.  Point your browser to `http://127.0.0.1:4000/docs/` and manually check your changes.

    - If the page you want to test isn't listed in the sidebar, just point to it directly, for example, `http://127.0.0.1:4000/docs/new-page.html`.

    - When you make additional changes, Jekyll automatically regenerates the HTML content. No need to stop and re-start Jekyll; just refresh your browser.

    Once you're done viewing your changes, use **CTRL-C** to stop the Jekyll server.

## Docs Structure

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
`summary` | Used as the page's `meta description` for SEO. Keep this under 155 characters. Consider using the first sentence of the page, or something similar. | Nothing

Optionally, you can specify other fields in the front-matter:

Field | Description | Default
------|-------------|--------
`toc` | Adds an auto-generated table of contents to the right of the page body (on standard screens) or at the top of the page (on smaller screens). | `true`
`toc_not_nested` | Limits a page's TOC to h2 headers only. | `false`
`allowed_hashes` | Specifies a list of allowed hashes that do not correspond to a section heading on the page. | Nothing
`asciicast` | Adds code required to play asciicasts on the page. See [Asciicasts](#asciicasts) for more details. | `false`
`feedback` | Adds "Yes/No" feedback buttons at the bottom of the page. See [Feedback Widget](#feedback-widget) for more details. | `true`
`contribute` | Adds "Contribute" options at the top-right of the page. See [Contributing Options](#contributing-options) for more details. | `true`
`redirect_from` | Specifies other internal URLs that should redirect to the page. See [Client-Side Redirects](#client-side-redirects) | Nothing
`twitter` | Adds code required to track the page as part of a Twitter campaign | `false`
`no_sidebar` | If `true`, removes the sidebar from a page. See [Sidebar](#sidebar) for more details. | Nothing
`block_search` | If `true`, adds meta tags to the header that excludes the page from search indexing/caching. | Nothing
`back_to_top` | If `true`, adds a back-to-top button to the page. This is only helpful in cases where the page is very long and there is no page toc, e.g., the Full SQL Grammar page.
<!-- `drift` | Set this to `true` if a Drift survey is active on the page. This excludes the help button from the page, which would otherwise conflict visually with the Drift interface. -->

#### Page TOC

The CockroachDB Jekyll theme can auto-generate a page-level table of contents listing all h2 and h3 headers or just all h2 headers on the page. Related files: `js/toc.js` and `_includes/toc.html`.

- To add a page TOC, set `toc: true` in the page's front-matter.

- To omit a page TOC from the page, set `toc: false` in the page's front-matter.

- By default, a page TOC includes h2 and h3 headers. To limit a page TOC to h2 headers only, set `toc_not_nested: true` in the page's front-matter.

#### Auto-Included Content

Some pages auto-include content from the [`_includes`](_includes) directory. For example, each SQL statement page includes a syntax diagram from `_includes/<version>/sql/diagrams`, and the [build-an-app-with-cockroachdb.md](build-an-app-with-cockroachdb.md) tutorials include code samples from `_includes/<version>/app`.

The syntax for including content is `{% include {{ page.version.version }}/<filepath> %}`, for example, `{% include {{ page.version.version }}/app/basic-sample.rb %}`.

#### Version Tags

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

#### Allowed Hashes

In a page's front-matter, you can specify a list of allowed hashes
that do not correspond to a section heading on the page. This is
currently used for pages with JavaScript toggle buttons, where the
toggle to activate by default can be specified in the URL hash. If you
attempt to link to, for example, `page-with-toggles.html#toggle-id` without
listing `toggle-id` in `allowed_hashes`, our HTML tester will complain
that `toggle-id` does not exist on the page. Listing a hash in
`allowed_hashes` will generate a placeholder element with that ID at the top
of the page, which keeps our HTML tester happy.

Here's an example from a page with OS toggles:

```
allowed_hashes: [os-mac, os-linux, os-windows]
```

#### Asciicasts

1. [Install asciinema](https://asciinema.org/docs/installation).
2. Size your shell window to be a bit narrower than our code blocks.
3. Initiate an asciicast with `asciinema rec -c "/bin/bash -l"`. This makes the asciicast use your shell's appearance.
4. Press **CTRL + D** to stop recording.
5. Press **Enter** to upload the recording to asciinema.
6. Click **Download**.
7. Rename the `.json` asciicast file and place it in the `/asciicasts` directory.
8. On the page, set `asciicast: true` in the front-matter.
9. On the page, include the following html where you want the asciicast to appear. Change the `src` filepath as relevant, and change `poster` to the time in the asciicast that you want to use as the static image. For other details about customizing the asciicast appearance, see the asciinema [README](https://github.com/asciinema/asciinema-player#asciinema-player-element-attributes).

  ```
  <asciinema-player class="asciinema-demo" src="asciicasts/start-a-local-cluster.json" cols="107" speed="2" theme="solarized-dark" poster="npt:0:30" title="Start a Local Cluster"></asciinema-player>
  ```
#### Images

For information about how we use images in our docs, see [Images](https://github.com/cockroachdb/docs/wiki/Style-Guide#images) in our [Style Guide](https://github.com/cockroachdb/docs/wiki/Style-Guide).

#### Feedback Widget

We show "Yes/No" feedback buttons at the bottom of every page by default. To remove these buttons from a page, set `feedback: false` in the page's front-matter.

#### Contributing Options

We show "Contribute" options in the top-right of every page by default. To remove these options from a page, set `contribute: false` in the page's front-matter.

#### Client-Side Redirects

We use the [JekyllRedirectFrom](https://github.com/jekyll/jekyll-redirect-from) plugin to ensure that multiple URLs resolve to a single page. This is most useful in cases where we change the filename or directory structure of a page.

For example, if `v1.0.html` page were moved from the root level to `releases/v1.0.html`, you would add `redirect-from: /v1.0.html` to the page's front-matter to ensure that `https://cockroachlabs.com/docs/v1.0.html` gets redirected to `https:/cockroachlabs.com/docs/releases/v1.0.html`.

If you rename or restructure a versioned page, use a relative link, not an absolute link. For example, if `show-transaction.md` and `show-time-zone.md` are merged into `show-vars.md` for v1.1, use the following `redirect_from` specification:

```md
redirect_from:
- show-transaction.html
- show-time-zone.html
```

This ensures that if `v1.1` is also the `stable` or `dev` version, the corresponding `stable` or `dev` redirects will be generated as well.

### Sidebar

For each documented version of CockroachDB, a JSON file in the `_includes` directory defines the pages that appear in the docs sidebar. For example, the sidebar for CockroachDB v1.0 is defined by [`_includes/sidebar-data-v1.0.json`](https://github.com/cockroachdb/docs/blob/master/_includes/sidebar-data-v1.0.json).

If you're adding a page that you think should appear in the sidebar, please mention this in your pull request.

In the JSON file for a version's sidebar, there are three possible fields:

Field | Type | Description
------|------|------------
`title` | String | At the top level, this field defines the title for a section of the sidenav, e.g., `Get Started`. Within the `items` field, `title` defines either the title for a subsection or the title for a page, which can be different from the actual page title. See the [JSON Example](#json-example) below for more clarity.
`items` | Array of objects | The pages in a section of the sidenav.
`urls` | Array of strings | The URLs for a page in the sidenav, each formatted as `/${VERSION}/<page-name>.html`, e.g., `/${VERSION}/learn-cockroachdb-sql.html`. The first URL is the page to link to. The subsequent URLs are pages that should highlight this title in the sidebar.

#### JSON Example

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

## Homepage What’s new in docs Content
The content under What’s new in docs on the home page is controlled by the data file `_data/whats_new.yml`

## Style Guide

See [Style Guide](https://github.com/cockroachdb/docs/wiki/Style-Guide) for more details.
