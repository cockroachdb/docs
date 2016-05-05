# Contributing to CockroachDB Docs

The CockroachDB docs are open source just like the database itself. We welcome your contributions!

## Setup

1. Install [Jekyll](https://jekyllrb.com/docs/installation/). CockroachDB uses Jekyll to transform markdown and layout files into a complete, static site. You need to install Jekyll so you can test doc changes locally.
 
2. Learn the essentials of our [Docs Structure](#docs-structure). 

3. Review our simple [Style Guide](#style-guide).

## Get Started

Once you're ready to contribute:

1. Fork the CockroachDB [docs repository](https://github.com/cockroachdb/docs).

2. [Create a local clone](https://help.github.com/articles/cloning-a-repository/) of your fork.

3. Make your changes.

4. [Build the docs locally](#build-the-docs-locally) and test them.

5. [Push to your remote fork](https://help.github.com/articles/pushing-to-a-remote/).

6. Back in the CockroachDB docs repo, [open a pull request](https://github.com/cockroachdb/docs/pulls).

## Docs Structure

### Pages

Each docs page must be an `.md` file in the root directory of the repository, must be written in the [kramdown](http://kramdown.gettalong.org/quickref.html) dialect of Markdown, and must start with the following front-matter:

```
---
title: Title of Page
toc: false
---
```
 
The `title` field in the front matter is used as the h1 header. The `toc` field is for adding an auto-generated table of contents to the page. See [Page TOC](#page-toc) for full details.

### Page TOC 

The CockroachDB Jekyll theme can auto-generate a page-level table of contents listing all h2 headers or all h2 and h3 headers on the page. Related files: `js/toc.js` and `_includes/toc.html`. 

#### TOC Placement

-   To add a page TOC to the very top of the page, set `toc: true` in the page's front-matter.

-   To add a page TOC anywhere else on the page (for example, after an intro paragraph), set `toc: false` in the page's front-matter and add the following html where you want the toc to appear on the page:
    
    ``` html
    <div id="toc"></div>
    ```

-   To omit a page TOC from the page, set `toc: false` in the page's front-matter.

### TOC Levels

By default, a page TOC includes h2 and h3 headers. To limit a page TOC to h2 headers only, set `toc_not_nested: true` in the page's front-matter. 

### Sidebar

The [`_data/sidebar_doc.yml`](_data/sidebar_doc.yml) file controls which pages appear in the docs sidebar. If you're adding a page that you think should appear in the sidebar, please mention this in your pull request.

### Auto-Included Content

Some pages auto-include content from the [`_includes`](_includes) directory. For example, each SQL statement page inludes a syntax diagram from `_includes/sql/diagrams`, and [build-a-test-app.md](build-a-test-app.md) includes code samples from `_includes/app`.

The syntax for including content is `{% include <filepath> %}`, for example, `{% include app/basic-sample.rb %}`.

## Style Guide

CockroachDB docs should be:

- Clear 
- Correct 
- Concise 

## Build the Docs Locally

Once you've installed Jekyll and have a local clone of the docs repository, you can build the docs as follows:

1.  From the root directory of your clone, run:
    
    ``` shell
    $ jekyll serve
    ```

2.  Point your browser to `http://127.0.0.1:4000/docs/`.

    - If the page you want to test isn't listed in the sidebar, just point to it directly, for example, `http://127.0.0.1:4000/docs/new-page.html`.

    - When you make changes, Jekyll automatically regenerates the html content. No need to stop and re-start Jekyll; just refresh your browser.
