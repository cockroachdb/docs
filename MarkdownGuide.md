# Markdown Guide

This guide covers Markdown-specific syntax and formatting conventions used in CockroachDB documentation. For general style guidelines, refer to the [Style Guide](StyleGuide.md).

## Table of Contents

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
- [Best practices](#best-practices)

## Headings

Use headings to establish a content hierarchy. When the page is rendered, the first two heading levels appear in the page TOC at the right of the page.

Add a line break between a heading and its content.

**Examples:**

- `## Heading 2`
- `### Heading 3`
- `## Step 2. A step in a tutorial`

## Text formatting

### Bold

Use bold text to emphasize a UI element, important word or phrase, or to create visual separation and callouts (e.g., **Example:**). Do **not** combine bold with italic.

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

**Example:** [`debug.zip`]({% link v25.1/cockroach-debug-zip.md %})

### Custom anchor links

To link to a specific location on a page that is not a heading (e.g., a specific command-line flag in a table), add a manual anchor and use the `id` parameter:

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

For websites that automatically localize pages, avoid using localization elements directly within the URL. 

**Examples:**

- Instead of `https://docs.github.com/**en/**graphql/overview/explorer`, use `https://docs.github.com/graphql/overview/explorer`.
- Instead of `https://en.wikipedia.org/wiki/SQL:2011`, use `https://www.wikipedia.org/wiki/SQL:2011` or `https://wikipedia.org/wiki/SQL:2011`.

## Code

### Inline code

Use inline code when referring to code, commands, or other technical syntax within a sentence. Inline `code` is surrounded by backticks (``).

**Example:** The `CREATE TABLE` statement creates a new table in a database.

### Code block

Use a code block to provide executable code samples. A code block has an opening and closing set of 3 tildes (`~~~`). There should be one returned line before and after a code block, for better Markdown readability.

~~~markdown
This is a sample line of text.

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

This is more sample text.
~~~

### Language highlighting

A code block supports syntax highlighting if you add the language name (`shell`, `sql`, `json`, etc.) immediately after the first line of tildes.

~~~markdown
~~~sql
SELECT * FROM users;
~~~
~~~

~~~markdown
~~~shell
$ cockroach start --insecure
~~~
~~~

### Multi-line samples

For multi-line commands, use a backslash (`\`) at the end of each line to indicate a line break.

~~~markdown
~~~shell
$ cockroach start \
  --insecure \
  --store=node1 \
  --listen-addr=localhost:26257
~~~
~~~

### Copy to clipboard

Many of our code blocks are written so users can copy and paste them directly into a terminal. To make that easier, add the **Copy to Clipboard** button by placing `{% include_cached copy-clipboard.html %}` on the line directly preceding the code block:

~~~markdown
{% include_cached copy-clipboard.html %}
~~~shell
$ go get -u github.com/lib/pq
~~~
~~~

Notes for usage:

- **Copy to Clipboard** should be used for every code block that can be **executed**.
- There must be a line break above the `{% include_cached copy-clipboard.html %}` line.

### Placeholders

Code samples often include placeholder values, to be replaced by values specific to a user's environment. To denote that a value in a code sample is a placeholder value that should be replaced, use curly brackets (`{}`).

For example: `SELECT * FROM TABLE {mytable};`. In this code sample, `{mytable}` would be replaced by some table name before the code could actually run.

When you use placeholders, you usually need to define the value within the brackets, if the placeholder value isn't clear. Define placeholder values immediately following the code sample:

- For a single placeholder value, use a follow-up sentence.
- For multiple placeholder values, use a bulleted list.
- For many placeholder values (10+), use a table.
- For large code blocks, define the placeholder values inside the code block with an inline code comment.

Ensure that placeholders are placed within backticks: `SET {session variable}`. This signifies that placeholder values are code.

If the code sample is sensitive to curly bracket characters (e.g., JavaScript), you can use `<>` instead.

### Escaping special characters

Sometimes you may need to escape special characters to achieve proper rendering:

- **Jekyll-reserved characters** (e.g., double `{{ ... }}`) in code blocks: Wrap the specific line(s) with Liquid tags `{% raw %} ... {% endraw %}`.

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

For each item of a **numbered list**, use `1.` followed by a period and a space, e.g., `1. This is a numbered list item`. The HTML renderer will render the steps in the correct order.

~~~markdown
1. This is the first step.
1. This is the second step.
1. This is the third step.
~~~

### Unordered lists

For each item of a **bulleted list**, use one dash followed by one space, e.g., `- This is a bulleted list item`.

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
    $ command
    ~~~
~~~

Similarly, to nest a paragraph or code block under a **nested** list item, insert an empty line and then indent the paragraph or code block 8 spaces:

~~~markdown
1. This is a step.
    - This is a bullet.

        ~~~shell
        $ command
        ~~~
    - This is a bullet.

        ~~~shell
        $ command
        ~~~
~~~

## Tables

Use tables to display structured information in an easy-to-read format. We use two types of tables: [Markdown](#markdown-tables) and [HTML](#html-tables).

### Markdown tables

If you can keep the table formatting simple (e.g., basic text formatting and using `<br>` tags for paragraph breaks), create a table using Markdown. This is the preferred table format.

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

### Markdown vs HTML

- Prefer Markdown syntax over HTML when possible for better readability and maintainability.
- Use HTML only when Markdown doesn't provide the necessary functionality.
- When mixing Markdown and HTML, ensure proper spacing and formatting. Preview the rendered page locally.