# Markdown Guide

This guide covers Markdown-specific syntax and formatting conventions used in CockroachDB documentation. For general style guidelines, refer to the [Style Guide](StyleGuide.md).

## Table of Contents

- [Site structure](#site-structure)
  - [Docs repository](#docs-repository)
  - [Page headings](#page-headings)
  - [Sidebar](#sidebar)
- [Title](#title)
- [Headings](#headings)
- [Text formatting](#text-formatting)
  - [Bold](#bold)
  - [Italics](#italics)
- [Links](#links)
  - [Between pages](#links-between-cockroachdb-docs-pages)
  - [From non-versioned directories](#links-to-versioned-docs-pages-from-a-non-versioned-directory)
  - [From Technical Advisories](#links-to-versioned-docs-pages-from-technical-advisories)
  - [Custom anchor links](#custom-anchor-links)
  - [External links](#external-links)
- [Code](#code-blocks)
  - [Inline code](#inline-code)
  - [Code block](#code-block)
  - [Language highlighting](#language-highlighting)
  - [Copy to clipboard](#copy-to-clipboard)
  - [Placeholders](#placeholders)
  - [Escaping special characters](#escaping-special-characters)
- [Lists](#lists)
  - [Ordered lists](#ordered-lists)
  - [Unordered lists](#unordered-lists)
  - [Nesting lists](#nesting-lists)
  - [Nesting paragraphs and code blocks](#nesting-paragraphs-and-code-blocks)
- [Tables](#tables)
  - [Markdown tables](#markdown-tables)
  - [HTML tables](#html-tables)
  - [Markdown vs. HTML](#markdown-vs-html)
- [Images](#images)
- [Videos](#videos)
- [Versioning](#versioning)
  - [Version tags](#version-tags)
  - [Version references](#version-references)
- [Include files](#include-files)
  - [Basic include file usage](#basic-include-file-usage)
  - [Advanced include file usage](#advanced-include-file-usage)
  - [Filter tabs](#filter-tabs)
  - [Technical limitations of include files](#technical-limitations-of-include-files)
- [Tabs](#tabs)
  - [Linking into tabbed content](#linking-into-tabbed-content)
- [Comments](#comments)
  - [TODOs](#todos)

## Site structure

### Docs repository

Documentation for each CockroachDB version is organized in dedicated directories. For example, CockroachDB v23.1 docs are in `src/current/v23.1` and `src/current/_includes/v23.1`, while CockroachDB API docs are in `src/api`.

Each page must be a `.md` file written in [Redcarpet](https://github.com/vmg/redcarpet) Markdown. Use lowercase file names with dashes between words.

**Example:** `name-of-your-file.md`

### Page headings

All Markdown pages require YAML front matter:

```yaml
---
title: Title of Page
summary: Short description of page for SEO
---
```

**Required fields:**

Field | Description
------|------------
`title` | Page heading in title case
`summary` | SEO meta description (50-160 characters)

**Optional fields:**

Field | Description | Default
------|-------------|--------
`toc` | Auto-generates page table of contents | `true`
`toc_not_nested` | Limits TOC to h2 headers only | `false`
`allowed_hashes` | URL hashes that don't correspond to headings | None
`feedback` | Adds Yes/No feedback buttons | `true`
`contribute` | Adds Contribute options | `true`
`twitter` | Enables Twitter campaign tracking | `false`
`no_sidebar` | Removes page sidebar | `false`
`block_search` | Excludes page from search indexing | `false`
`back_to_top` | Adds back-to-top button | `false`
`docs_area` | Analytics area (for example, `get_started`, `reference.sql`) | None
`product_area` | Product area for analytics | None

### Sidebar

Each CockroachDB version uses a JSON file to define sidebar navigation. The file is located at `_includes/vXX.Y/sidebar-data/{section}.json`.

**JSON structure:**

Field | Type | Description
------|------|------------
`title` | String | Section or page title in sidebar
`items` | Array | Pages or subsections within a section
`urls` | Array | Page URLs formatted as `/${VERSION}/<page-name>.html`

**Example structure:**

```json
[
  {
    "title": "Get Started",
    "items": [
      {
        "title": "Install CockroachDB",
        "urls": ["/${VERSION}/install-cockroachdb.html"]
      },
      {
        "title": "Start a Local Cluster",
        "items": [
          {
            "title": "From Binary",
            "urls": ["/${VERSION}/start-a-local-cluster.html"]
          }
        ]
      }
    ]
  }
]
```

## Title

Set the page title in the `title:` metadata. The title should be in title case. Heading 1 (`#`) is reserved for page titles and **should not** be used in pages.

## Headings

A heading is denoted by one or more number signs (`#`) followed by one space: Heading 2 (`##`), Heading 3 (`###`) and Heading 4 (`####`). Denote anything under Heading 4 by bolded text.

Use headings to establish a content hierarchy. When the page is rendered, the first two heading levels appear in the page TOC at the right of the page.

Add a line break between a heading and its content.

**Examples:**

- `## Heading 2`
- `### Heading 3`
- `## Step 2. A step in a tutorial`

## Text formatting

### Bold

Use bold text to emphasize a UI element, important word or phrase, or to create visual separation and callouts. Do **not** combine bold with italic.

**Examples:**

- The **Overview** dashboard is displayed. Hover over the **SQL Queries** graph at the top.
- **Default:** `NULL`

### Italics

Use italics to introduce a new term or concept. To emphasize a word or phrase, use [bold](#bold) formatting instead.

**Examples:**

- This is the basis of potential *write skew anomalies*.
- Every table in a multi-region database has a "table locality setting" that configures one or more *home regions* at the table or row level.

## Links

### Links between CockroachDB docs pages

To link to pages in the `docs` repo, use the [Jekyll link syntax](https://jekyllrb.com/docs/liquid/tags/#links).

If the page is versioned, use `{{ page.version.version }}` rather than the hardcoded version. Exceptions apply when linking to versioned pages from [non-versioned pages](#links-to-versioned-docs-pages-from-a-non-versioned-directory) and [technical advisory pages](#links-to-cockroachdb-docs-from-technical-advisories).

**Examples:** 

- `[Foreign Key Constraint]({% link {{ page.version.version }}/foreign-key.md %})`
- `[Foreign Key Constraint]({% link cockroachcloud/quickstart.md %})`

To include an anchor link, place it outside of the Liquid tag.

**Examples:** 

- `[Rules for creating foreign keys]({% link {{ page.version.version }}/foreign-key.md %}#rules-for-creating-foreign-keys)`
- `[Multi-active availability]({% link {{ page.version.version }}/architecture/glossary.md %}#multi-active-availability)`

### Links to versioned docs pages from a non-versioned directory

When linking to a versioned page from a non-versioned page (such as `cockroachcloud` or `molt`), use `{{ site.current_cloud_version }}` in place of `{{ page.version.version }}`. This is because the `page.version.version` variable can't be accessed from the non-versioned directories.

**Example:** [`FLOAT`]({% link {{ site.current_cloud_version }}/float.md %})

### Links to CockroachDB docs from technical advisories

When linking to a versioned page from a Technical Advisory (in `advisories`), hardcode the page version.

**Example:** [`debug.zip`]({% link v25.4/cockroach-debug-zip.md %})

### Custom anchor links

To link to a specific location on a page that is not a heading (for example, a specific command-line flag in a table), add a manual anchor and use the `id` parameter:

**Example:**

~~~
# Anchor:
<a id="flags-max-offset"></a>`--max-offset`
~~~

~~~
# Link:
[--max-offset](#flags-max-offset)
~~~

### External links

To link to an external page, use the standard [Markdown syntax](https://www.markdownguide.org/basic-syntax/#links).

**Example:** `Refer to the [PostgreSQL documentation](https://www.postgresql.org/docs/current/index.html).`

For websites that automatically localize pages, avoid using localization elements, such as `en`, directly within the URL. 

**Examples:**

- Instead of `https://docs.github.com/en/graphql/overview/explorer`, use `https://docs.github.com/graphql/overview/explorer`.
- Instead of `https://en.wikipedia.org/wiki/SQL:2011`, use `https://www.wikipedia.org/wiki/SQL:2011` or `https://wikipedia.org/wiki/SQL:2011`.

## Code

### Inline code

Use inline code when referring to code, commands, values, or other technical syntax within a sentence. Inline `code` is surrounded by backticks (``).

**Example:** The `CREATE TABLE` statement creates a new table in a database.

### Code block

Use a code block to provide executable code samples. A code block has an opening and closing set of 3 tildes (`~~~`). There should be one returned line before and after a code block, for better Markdown readability.

```
This is a sample line of text.

{% include_cached copy-clipboard.html %}
~~~ shell
go get -u github.com/lib/pq
~~~

This is more sample text.
```

### Language highlighting

A code block supports syntax highlighting if you add the language name (`shell`, `sql`, `json`, etc.) immediately after the first line of tildes.

```
~~~sql
SELECT * FROM users;
~~~
```

```
~~~shell
cockroach start --insecure
~~~
```

### Multi-line samples

For multi-line commands, use a backslash (`\`) at the end of each line to indicate a line continuation. The backslashes make the command easier to read, but the shell sees it as one line.

```
~~~shell
cockroach start \
  --insecure \
  --store=node1 \
  --listen-addr=localhost:26257
~~~
```

### Copy to clipboard

Many of our code blocks are written so users can copy and paste them directly into a terminal. To make that easier, add the **Copy to Clipboard** button by placing `{% include_cached copy-clipboard.html %}` on the line directly preceding the code block:

```
{% include_cached copy-clipboard.html %}
~~~shell
go get -u github.com/lib/pq
~~~
```

Notes for usage:

- **Copy to Clipboard** should be used for every code block that can be **executed**.
- To render properly, there must be a line break above the `{% include_cached copy-clipboard.html %}` line.

### Escaping special characters

Sometimes you may need to escape special characters to achieve proper rendering:

- **Jekyll-reserved characters** (for example, double `{{ ... }}`) in code blocks: Wrap the specific line(s) with Liquid tags `{% raw %} ... {% endraw %}`.

  ~~~markdown
  {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} tripped per-Replica circuit breakers{% endraw %}
  ~~~

- **Special characters in front matter**: Convert special characters to Unicode. For example, to escape `SET {session variable}` in the front matter:

  ~~~yaml
  title: SET &#123;session variable &#125;
  ~~~

## Lists

CockroachDB docs use two types of lists:

- **Numbered** (ordered list): Use to list information that should appear in order, like tutorial steps.
- **Bulleted** (unordered list): Use to list related information in an easy-to-read way.

Introduce a list with a sentence and a colon. Use periods at the end of list items if they are sentences or complete a sentence.

### Ordered lists

For each item of a **numbered list**, use `1.` followed by a period and a space, for example, `1. This is a numbered list item`. The HTML renderer will render the steps in the correct order.

~~~markdown
1. This is the first step.
1. This is the second step.
1. This is the third step.
~~~

### Unordered lists

For each item of a **bulleted list**, use one dash followed by one space, for example, `- This is a bulleted list item`.

~~~markdown
- This is a bullet point.
- This is another bullet point.
- This is a third bullet point.
~~~

### Nesting lists

To nest a list under a list item, start the list on the next line (no empty line), and indent the new list four spaces:

~~~markdown
1. This is a step.
    - This is a bullet.
    - This is a bullet.
    - This is a bullet.

1. This is a step.

    This is a nested paragraph.
    - This is a bullet.
    - This is a bullet.
~~~

Nested ordered lists work similarly:

~~~markdown
1. This is a step.
    1. This is a substep.
    1. This is a substep.
    1. This is a substep.

1. This is a step.

    This is a nested paragraph.
    1. This is a substep.
    1. This is a substep.
~~~

### Nesting paragraphs and code blocks

To nest a paragraph or code block under a list item, insert an empty line and then indent the paragraph or code block 4 spaces:

~~~markdown
1. This is a step.

    This is a nested paragraph.

    ~~~shell
    command
    ~~~
~~~

Similarly, to nest a paragraph or code block under a **nested** list item, insert an empty line and then indent the paragraph or code block 8 spaces:

~~~markdown
1. This is a step.
    - This is a bullet.

        ~~~shell
        command
        ~~~
    - This is a bullet.

        ~~~shell
        command
        ~~~
~~~

## Tables

Use tables to display structured information in an easy-to-read format. We use two types of tables: [Markdown](#markdown-tables) and [HTML](#html-tables).

### Markdown tables

If you can keep the table formatting simple (for example, basic text formatting and using `<br>` tags for paragraph breaks), create a table using Markdown. This is the preferred table format.

To create a table, use pipes (`|`) between columns and at least 3 dashes (`-`) separating the header cells from the body cells. A return denotes the start of the next row. The text within each column does not need to align in order to be rendered correctly, and you can inline Markdown or HTML.

Do not use outer pipes.

Example:

~~~markdown
   Term   |         Description         |     Example
----------|-----------------------------|----------------
 `term_1` | This is a description.      | `3.14`
 `term_2` | This is also a description. | `"lola mcdog"`
~~~

You can use the following Markdown formatting within a Markdown table:

- [Bold](#bold)
- [Italics](#italics)
- [Inline code](#inline-code)
- [Links](#links)

The following formatting needs to be in HTML to be used within a Markdown table:

- Paragraph breaks (`<br>`)
- Lists (`ol` / `ul` / `<li>`)

If the formatting becomes too complex, create an [HTML table](#html-tables).

The following formatting is not supported within a Markdown table:

- [Liquid tags](https://shopify.github.io/Liquid/)
- [Code blocks](#code-blocks)

### HTML tables

If it's necessary to include more complex table formatting or if a [Markdown table](#markdown-tables) becomes too unwieldy, create a table using HTML. This formatting is not recommended unless necessary, since it is hard for other writers to parse and maintain.

You can use the following HTML formatting within an HTML table:

- Bold (`<strong>`)
- Italics (`<em>`)
- Inline code (`<code>`)
- Links (`<a href`)
- Paragraph breaks (`<p>`)
- Lists (`<ol>` / `<ul>` / `<li>`)

### Markdown vs. HTML

- Prefer Markdown syntax over HTML when possible for better readability and maintainability.
- Use HTML only when Markdown doesn't provide the necessary functionality.
- When mixing Markdown and HTML, ensure proper spacing and formatting. Preview the rendered page locally.

## Callouts

CockroachDB docs use three classes of "callouts," which are highlighted blocks of text: tips, notes, and warnings.

- To insert a **tip**, use the following code:

  ~~~
  {{site.data.alerts.callout_success}}
  tip text goes here
  {{site.data.alerts.end}}
  ~~~

- To insert a **note**, use the following code:

  ~~~
  {{site.data.alerts.callout_info}}
  note text goes here
  {{site.data.alerts.end}}
  ~~~

- To insert a **warning**, use the following code:

  ~~~
  {{site.data.alerts.callout_danger}}
  warning text goes here
  {{site.data.alerts.end}}
  ~~~

## Images

Use the following HTML and Liquid to include an image in a Markdown page:

~~~ html
<img src="{{ 'images/v2.1/image-name.png' | relative_url }}" alt="Alternative Text Here" style="border:1px solid #eee;max-width:100%" />
~~~

## Videos

Use the following Liquid to include an embedded video in a Markdown page:

~~~ md
{% include_cached youtube.html video_id="<YouTube ID>" [widescreen=true] %}
~~~

The `video_id` parameter is required and is whatever is after the `?v=` portion of the URL. If the URL to the video you wish to embed is `https://www.youtube.com/watch?v=5kiMg7GXAsY`, for example, then the value of `video_id` should be `5kiMg7GXAsY`. The `widescreen` parameter is optional and meant for videos with wide banners such as our video on [Foreign Key Constraints](https://www.youtube.com/watch?v=5kiMg7GXAsY).

You can optionally pass in a start time to the `video_id` parameter to make the video start at a specific timestamp. The below example embeds the [How to Create Tables with Foreign Keys in SQL](https://www.youtube.com/watch?v=mFQk1VsIkZA) video and starts playing it at 25 seconds:

~~~ md
{% include_cached youtube.html video_id="mFQk1VsIkZA?start=25" %}
~~~

## Versioning

Use version tags to highlight new features and version references to link to specific CockroachDB versions in documentation.

### Version tags

Version tags inform users of new and updated features in CockroachDB, and could motivate users to upgrade to the latest major or patch version of CockroachDB. Version tags also help us identify new and updated features that we can call out in [our GA release notes](https://cockroachlabs.atlassian.net/wiki/spaces/ED/pages/402718726/GA+Release+Checklist).

To add a version tag, use the following Liquid tag:

~~~
{% include_cached new-in.html version="v22.1" %}
~~~

<a name="version-tags-tables"></a>

Note: If using a version tag inside of a Markdown table, use `<span class="version-tag">New in vXX.Y:</span>` or `<span class="version-tag">New in vXX.Y.Z:</span>` instead.

Put version tags at the beginning of a paragraph, sentence, or description in a table cell.

If a feature is new in a GA release, use the major release number for the release version tag (e.g., `{% include_cached new-in.html version="v21.2" %}`).

If a feature has been backported to a previous version in a patch release, use the patch release number for the release version tag (for example, `{% include_cached new-in.html version="v21.2.10" %}`).

Version tags should only refer to the version of the docset that contains them. For example, the version tag `{% include_cached new-in.html version="v21.1.9" %}` should only be on pages in `v21.1` directories.

### Version references

To refer to a static version of CockroachDB:

~~~
{{site.versions["v22.2"]}}
~~~

To dynamically refer to the stable version of CockroachDB, as determined each time the site is built:

~~~
{{site.versions["stable"]}}
~~~

**Warning**: If you use a `stable` link on a versioned page which is for a previous version, the link points to a different version  of CockroachDB than the version the page documents. Similarly, if you use a `stable` link on a page for the current version and then a new version is added, the link points to a different version than the version the page documents. If this is a problem, use one of the following methods instead.

Pages that document CockroachDB itself exist within subdirectories that represent major versions. To refer to a page's major version (for example, v22.2), which matches its top-level subdirectory within the docs repo:

~~~
{{page.version.version}}
~~~

A patch release version of CockroachDB receives updates as patches. To refer to a page's current patch version (for example, v22.1.7):

~~~
{{ page.release_info.name }}
~~~

## Include files

There are [basic](#basic-include-file-usage) and [advanced](#advanced-include-file-usage) methods for using include files. Use the basic method unless you are sure you need the advanced.

<a name="basic-include-file-usage"></a>

### Basic include file usage

The basic method for using an include file is:

1. Find (or create) a block of content that you want to make appear on two or more different pages.
1. Create a new file in the subdirectory of the `_includes` directory associated with the product you are working on. For example, if you are working on CockroachDB Self-Hosted v22.1, the directory will be `_includes/v22.1/`. If you are working on CockroachDB Dedicated, it will be `_includes/cockroachcloud`. If the include text is not version- or product-specific, put it in the `common` directory.
1. In the pages where you want the included content to appear, add an `include` tag like one of the following: for CockroachDB Self-Hosted, `{% include {{page.version.version}}/some/shared-file.md %}`; for CockroachDB Dedicated, `{% include cockroachcloud/some/shared-file.md %}`.

The contents of `shared-file.md` will now appear on all of the pages where you added the `include` tag.

<a name="advanced-include-file-usage"></a>

### Advanced include file usage

#### Different content depending on page name

There may be cases where the content of the include file will need to vary slightly depending on what pages that content is being shared into. For example, while working on [cockroachdb/docs#12216](https://github.com/cockroachdb/docs/pull/12216),  I needed a way to:

- Have text be a link on the [Known Limitations](https://www.cockroachlabs.com/docs/stable/known-limitations) page.
- Have that same text _not_ be a link on the [Cost-Based Optimizer](https://www.cockroachlabs.com/docs/stable/cost-based-optimizer) page (since it would be a self-referring link).

The way to do this in Jekyll (with its templating language Liquid) is to add the following content to an include file that is shared into both pages:

    {% if page.name == "cost-based-optimizer.md" %} Locality-optimized search {% else %} [Locality-optimized search](cost-based-optimizer.html#locality-optimized-search-in-multi-region-clusters) {% endif %} only works for queries selecting a limited number of records (up to 10,000 unique keys). Also, it does not yet work with [`LIMIT`](limit-offset.html) clauses.

The syntax is a little hard to read inline, but based on some experimenting it appears that it _must_ be written as one line so as not to introduce line breaks in the resulting text.

Formatted for easier reading, the template code looks like:

```
{% if page.name == "cost-based-optimizer.md" %}
Locality-optimized search
{% else %}
[Locality-optimized search](cost-based-optimizer.html#locality-optimized-search-in-multi-region-clusters)
{% endif %}
```

#### Remote includes

Sometimes, you need to include files that are maintained in other places than the `cockroachdb/docs` repo but referenced in our docs. The `remote_include` tag is used for this. We most often use this tag for code samples, which are maintained in various repos.

For code samples, you usually want to show only part of a larger file to highlight a specific technique, or due to length considerations.

To accomplish this, the `remote_include` tag lets you pass arguments (usually named `START {text}` and `END {text}` by convention) that pull in the text of the remote file between `START {text}` and `END {text}`.

For example, the file `movr-flask-application.md` (which becomes the page [Develop a Global Web Application](https://www.cockroachlabs.com/docs/v22.1/movr-flask-application.html)) has the following `remote_include`:

```
{% remote_include https://raw.githubusercontent.com/cockroachlabs/movr-flask/v2-doc-includes/dbinit.sql ||-- START database ||-- END database %}
```

If you browse to the `dbinit.sql` file, you will find the following SQL code block that uses those start and end tags:

```
-- START database
CREATE DATABASE movr PRIMARY REGION "gcp-us-east1" REGIONS "gcp-us-east1", "gcp-europe-west1", "gcp-us-west1";
-- END database
```

For more information about the `remote_include` tag, see the README in the [jekyll-remote-include](https://github.com/cockroachdb/jekyll-remote-include) repo.

### Filter tabs

Use filter tabs to create navigation between related pages. The [`filter-tabs.md`](https://github.com/cockroachdb/docs/blob/main/src/current/_includes/filter-tabs.md) include generates tabs that link to different pages.

**Note:** Filter tabs link to different URLs/pages, not tabs within a single page.

**Setup process:**

1. Identify pages for filter tabs and note their HTML filenames (for example, `install-cockroachdb-mac.html`).

1. Create an include file in `_includes/<version>/filter-tabs/` with this structure:

    ```liquid
    {% assign tab_names_html = "Tab 1;Tab 2;Tab 3" %}
    {% assign html_page_filenames = "page1.html;page2.html;page3.html" %}
    {% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=<version> %}
    ```

1. Include the filter tabs on each target page: `{% include <version>/filter-tabs/<name>.html %}`

### Technical limitations of include files

Include files have the following technical limitations:

- Cannot be used in [Markdown tables](#markdown-tables)
- Remote includes cannot reference local includes
- Include files with paragraphs followed by code blocks may not render correctly in all contexts

## Tabs

To allow your reader to select from two or more versions of on-page content, use a tabset. This might be appropriate for:
  - Install procedurals with different steps for the different supported platforms (like macOS, Windows, Linux).
  - Reference material where the Enterprise and non-Enterprise versions of a feature differ.
  - Demonstrating how to connect from an example application in each supported programming language (like Python, C++, Java, etc.).

To add tabs to your copy, you first define the tabset for use later on the page, then you declare each tab's content within each tab.

To define the tabset:

```
<div class="filters clearfix">
  <button class="filter-button" data-scope="macos-install-steps">macOS</button>
  <button class="filter-button" data-scope="windows-install-steps">Windows</button>
</div>
```

This example defines two tabs (named `macOS` and `Windows`) and defines a unique `data-scope` for each (`macos-install-steps` and `windows-install-steps` respectively).

Then, to declare the content within each tab:

```
<section class="filter-content" markdown="1" data-scope="macos-install-steps">

1. To install CockroachDB on macOS, first you need to ...
...
</section>

<section class="filter-content" markdown="1" data-scope="windows-install-steps">

1. To install CockroachDB on Windows, first you need to ...
...
</section>

## This section outside of tabs

```

Now the user can freely switch between the `macOS` and `Windows` tabs as needed.

Tip: Do your tabs share a lot of common content betwen them? Tabs are often a great place to make use of [include files](#include-files)!

### Linking into tabbed content

To link to content that is contained within a tab, add the `filter` component to your link, specifying the `data-scope` you provided in your tabset definition. You can do this in the following two ways:

- To link to the top of a target page, with a specific tab selected:

  ```
  [Core changefeeds](create-and-configure-changefeeds.html?filters=core)
  ```

  This takes us to the top of `create-and-configure-changefeeds.html` and ensures the tab matching `data-scope: core` is selected. See [Create and Configure Changefeeds](https://www.cockroachlabs.com/docs/stable/create-and-configure-changefeeds.html?filters=core) to see this in action.

- For linking to a header contained within a tabset:

  ```
  [Create with column families](changefeeds-on-tables-with-column-families.html?filters=core#create-a-core-changefeed-on-a-table-with-column-families)
  ```

  This takes us directly to the `create-a-core-changefeed-on-a-table-with-column-families` header, within the `data-scope: core` tab. See [Create a Core changefeed on a table with column families](https://www.cockroachlabs.com/docs/stable/changefeeds-on-tables-with-column-families.html?filters=core#create-a-core-changefeed-on-a-table-with-column-families) to see this in action.

Considerations:

- If you intend to link to a header present on two or more tabsets on the same page, the header targets must be uniquely named. If you require identical header names, use explicit, unique HTML anchor names for each (in form `<a name="uniquename"></a>` as shown under [Links](#links).
- For the first-defined tab, specifying its `filter` value in a link is functionally the same as omitting it. For all other tabs, the explicit filter name is required. You can think of this first tab as the "default" tab in this context: if not otherwise specificed, Jekyll will always open with the first tab's contents displayed.

## Comments

There may be situations that require adding an explanation below a piece of content or to temporarily suppress content within a page. In those situations, use [Liquid comments](https://shopify.github.io/liquid/tags/template/#comment).

Page source:

```
This sentence is visible!
{% comment %}
This sentence is not visible!
{% endcomment %}
This sentence is visible except for a single commented word: {% comment %}CockroachDB{% endcomment %}
```

Final page HTML:

```
<p>This sentence is visible!</p>
<p>This sentence is visible except for a single commented word: </p>
```

Do not use HTML comments (`<!-- -->`), because HTML comments are visible in the page's HTML source code in production. Additionally, any HTML comment content must be processed by the Liquid parser, so any Liquid within an HTML comment is still processed and can produce errors, such as a broken include or broken link.

### TODOS

If you have future work to do in a particular file, simply add `TODO` or a `FIXME` inside of a comment. A colon after `TODO` or `FIXME` is optional.

Examples:

```
{% comment %}
TODO clean up the style guide
{% endcomment %}
```

```
{% comment %}
FIXME: Update example SQL commands
{% endcomment %}
```

Many popular code editors feature extensions that can highlight `TODO`s across the repository. One such extension is [Todo Highlight](https://marketplace.visualstudio.com/items?itemName=wayou.vscode-todo-highlight).
