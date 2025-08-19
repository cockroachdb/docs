# Markdown Guide

This guide covers Markdown-specific syntax and formatting conventions used in CockroachDB documentation. For general style guidelines, see [StyleGuide.md](StyleGuide.md).

## Table of Contents

- [Headings](#headings)
- [Text formatting](#text-formatting)
  - [Bold](#bold)
  - [Italics](#italics)
  - [Inline code](#inline-code)
- [Links](#links)
  - [Link syntax](#link-syntax)
  - [Jekyll links](#jekyll-links)
  - [Anchor links](#anchor-links)
- [Code blocks](#code-blocks)
  - [Basic syntax](#basic-syntax)
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

Use headings to demarcate content into a hierarchy to help readers find information. When the page is rendered, the first two heading levels appear in the page TOC at the right of the page.

A heading is denoted by one or more number signs (`#`) followed by one space: Heading 2 (`##`), Heading 3 (`###`) and Heading 4 (`####`). Use Heading 4 sparingly. Denote anything under Heading 4 by bolded text.

Headings should be sentence case.

Enter a line break between a heading and its content.

### Examples

- `## Heading 2`
- `### Heading 3`
- `## Step 2. A step in a tutorial`

## Text formatting

### Bold

Use bold text to emphasize an important word or phrase, or to create visual separation and callouts (e.g., **Example:**). Do not combine bold with italic.

To bold a word or phrase, surround the text with two asterisks (`**`).

**Examples:**

- The **Overview** dashboard is displayed. Hover over the **SQL Queries** graph at the top.
- **This is an experimental feature.** The interface and output of this feature are subject to change.
- **Default:** `NULL`

### Italics

Use italics to identify the term in a concept definition. Otherwise, do not use italicized text in CockroachDB docs. If it seems beneficial to emphasize a word or phrase, use [bold](#bold).

To italicize text, surround it with single asterisks (`*`) or underscores (`_`).

### Inline code

Use inline code when referring to code, commands, or other technical syntax within a sentence. Inline `code` has `backticks (``) around` it.

**Example:** The `CREATE TABLE` statement creates a new table in a database.

## Links

### Link syntax

Links are marked with inline text surrounded by square brackets followed by the link address in parentheses.

~~~markdown
[Link text](https://example.com)
~~~

Avoid using non-descriptive link names such as `here`, `this page`, or `go`.

Use Markdown reference-style links when several parts of the same page refer to the same target URL. Reference-style links contain two sets of square brackets. The first set of brackets contains the link text that will appear on the final rendered page. The second set of brackets contains the reference name.

**Example:**

~~~markdown
This text has a [link to a page][docs].
...
This text has a [link as well][docs].
...
[docs]: https://www.cockroachlabs.com/docs
~~~

### Jekyll links

To link to a page within the same directory (e.g., a page in `v23.1` to another page in `v23.1`), use the [Jekyll link syntax](https://jekyllrb.com/docs/liquid/tags/#links).

If the page is a versioned doc, use `{{ page.version.version }}` instead of the hardcoded version. Otherwise, use the regular path (e.g., `cockroachcloud`).

**Example:** `[Foreign Key Constraint]({% link {{ page.version.version }}/foreign-key.md %})`

**Example:** `[Foreign Key Constraint]({% link cockroachcloud/quickstart.md %})`

To include a subsection, place it outside of the Liquid tag.

**Example:** `[Rules for creating foreign keys]({% link {{ page.version.version }}/foreign-key.md %}#rules-for-creating-foreign-keys)`

### Anchor links

To link to a specific location on a page that is not a heading (e.g., a specific command-line flag in a table), add a manual anchor and use the `id` parameter:

**Example:**

~~~markdown
# Anchor:
<a id="flags-max-offset"></a>`--max-offset`
~~~

~~~markdown
# Link:
[--max-offset](#flags-max-offset)
~~~

## Code blocks

### Basic syntax

Use a code block to provide executable code samples. A code block has an opening and closing set of 3 tildes (`~~~`) or 3 backticks (<code>~~~</code>). There should be one returned line before and after a code block, for better Markdown readability.

~~~markdown
This is a sample line of text.

~~~
Code goes here
~~~

This is more sample text.
~~~

### Language highlighting

A code block supports syntax highlighting if you add the language name immediately after the first line of tildes or backticks.

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

### Shell code samples

Start shell code samples with `~~~ shell` followed by a line break. The first character of the next line must be the terminal marker `$`. For multi-line shell commands, use a backslash (`\`) at the end of each line to indicate a line break.

~~~markdown
~~~shell
$ cockroach start \
  --insecure \
  --store=node1 \
  --listen-addr=localhost:26257
~~~
~~~

### SQL code samples

SQL code samples are broken into two sections: commands and responses.

- **Commands** (e.g., `SELECT`, `CREATE TABLE`) should begin with `~~~ sql` followed by a line break. Commands should be properly capitalized, and there should be only one command per code sample.

- **Responses** (e.g., retrieved tables) should begin with `~~~` but should **not** be syntax highlighted.

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

- **Numbered** (ordered list) - Use to list information that should appear in order, like tutorial steps.
- **Bulleted** (unordered list) - Use to list related information in an easy-to-read way.

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

## Best practices

### When to use ordered lists

Don't use prose to describe multiple steps within a section. Instead, use an ordered list. If a topic introduces actions the user performs with "First, ..." and "Next, ..." you should make these an ordered list.

**Incorrect**

First, run this command:

~~~shell
command1 --option
~~~

Then, run another command:

~~~shell
command2 myfile.yaml
~~~

**Correct**

1. Run this command:

    ~~~shell
    command1 --option
    ~~~

1. Run another command:

    ~~~shell
    command2 myfile.yaml
    ~~~

### Markdown vs HTML

- Prefer Markdown syntax over HTML when possible for better readability and maintainability.
- Use HTML only when Markdown doesn't provide the necessary functionality.
- When mixing Markdown and HTML, ensure proper spacing and formatting.