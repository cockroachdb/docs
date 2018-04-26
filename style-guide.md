---
title: Style Guide
summary: The style guide for CockroachDB docs.
toc: false
---

CockroachDB docs should be:

- Clear
- Correct
- Concise

To enable this, we have the following specific guidance:


We also have additional guidance to ensure consistency with our existing documents.

<div id="toc"></div>

## Language

- Use the second-person imperative present tense, also known as "[imperative mood](https://en.wikipedia.org/wiki/Imperative_mood)."
- Use active voice instead of passive. For more information, refer to the [Purdue Online Writing Lab resource](https://owl.english.purdue.edu/owl/resource/539/02/).
- Use simple and direct language. Grammar can be incorrect to save simplicity.

## Capitalization and Punctuation

Prefer periods over semicolons.

- What are capitalized? Proper nouns?
- Links

## File Conventions

CockroachDB docs are mainly comprised of pages (`.md`) and images (`.png` or `.gif`). File names are lowercase with a dash between words, and should be brief but descriptive.

Examples:

- `this-is-a-doc.md`
- `name-of-your-image.png`

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v2.0 are in the `docs > v2.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are found in a directory named for the version under the `images` directory. For example, images for CockroachDB v1.0 are in the `docs > images > v1.0` directory. For more information, see [Images](#images).

## Components

### Code

Code can be shown [inline](#inline-code) or as a [code block](#code-blocks).

#### Inline Code

Inline `code` has `back-ticks (``) around` it and is used when referring to code, commands, or other technical syntax within a sentence.

Example: The `CREATE TABLE` statement creates a new table in a database.

#### Code Blocks

Code blocks are used to provide code samples, marked with an opening and closing set of 3 tildes (`~~~`). Code blocks can support syntax highlighting if you add the language name immediately after the first line of back-ticks. Shell and SQL commands should be syntax highlighted where appropriate using the following info:

**Shell Code Samples**

Start shell code samples with `~~~ shell` followed by a line break. The first character of the next line must be the terminal marker `$`.

**SQL Code Samples**

SQL code samples are broken into two sections: commands and responses.

- **Commands** (e.g., `SELECT`, `CREATE TABLE`) should begin with `~~~ sql` followed by a line break. The first character of the next line must be the terminal marker `>`. Commands should be properly capitalized, and there should be only one command per code sample.
- **Responses** (e.g., retrieved tables) should begin with `~~~` but should *not* be syntax highlighted.

  Note that not all responses warrant inclusion. For example, if a SQL code sample shows `CREATE TABLE`, `INSERT`, and then `SELECT`, it's unnecessary to show the responses for `CREATE TABLE` (which is just `CREATE TABLE`) and `INSERT` (which is just `INSERT <number of rows>`).

**Copy to Clipboard**

Many of our code blocks are written so users can copy and paste them directly into a terminal. To make that easier, add a **Copy to Clipboard** feature by placing

<pre>
{% raw %}{<span>% include copy-clipboard.html %}{% endraw %}
</pre>

on the line directly preceding the code block, for example:

<pre>
{% raw %}{% include copy-clipboard.html %}{% endraw %}
~~~ shell
$ go get -u github.com/lib/pq
~~~
</pre>

**Copy to Clipboard** should be used for every code block that can be executed.

### Examples

"How to title them
How to introduce them
Grammatical person to use (you vs we)
Split sentence by code or syntax?"

### Headings

Use headings to demarcate content into a hierarchy to help readers find information easier.

Headings should be title case, and are denoted by octothorps (`#`) followed by one space to denote headings. Enter a line break between a heading and its content. CockroachDB docs use Heading 2 (`##`) and Heading 3 (`###`). Heading 1 is reserved for page titles and anything under Heading 3 can be denoted by bolded text, or should be reformatted.

Examples:

- `## This is Heading 2`
- `### And This is Heading 3`

### Images

Use images to clarify a topic, and should be used only as needed. Images are either:

- **Screenshots** - Provide a UI visual. Screenshots should show enough of the UI that the user can easily orient themselves and understand what they are being shown. If a screenshot needs an annotation, use a red box.
- **Diagrams** - Provide a visual of a complicated theory. Diagrams should be simple and easy to read.

Use the following HTML and liquid to include an image in a markdown page:

~~~ html
<img src="{% raw %}{{ 'images/v2.1/image-name.png' | relative_url }}{% endraw %}" alt="Alternative Text Here" style="border:1px solid #eee;max-width:100%" />
~~~

### Links

Whenever a CockroachDB feature is referenced, a link to the relevant documentation should be provided. Links to external resources can also be provided, but only if the resource is vetted and no CockroachDB documentation covers the topic.

Link capitalization can be either title- or sentence- case:

- **Use title-case** when referring to the linked doc by name (e.g., “See __Best Practices__ for more information”).
- **Use sentence-case** - when linking in the middle of a sentence (e.g., “[…] follow the __identifier rules__ when creating […]“).

Links are marked with inline text surrounded by square brackets followed by the link address in parentheses. If you are including a relative link (to other pages in the docs), include just the name of the file.

Examples:
- `[here](name-of-article.html)`
- `[xyz](#heading-on-page-for-anchor-link)`
- `[Cockroach Labs](cockroachlabs.com)`

### Lists

When? how to introduce? how to punctuate?

For each item of a **numbered list**, use the step number followed by a period and a space, e.g., `1. This is a numbered list`.

For each item of a **bulleted list**, use one dash followed by one space to denote a list item, e.g., `- This is a bulleted list`.

#### Nesting Lists

When?

To nest a list under a list item, start the list on the next line (no empty line), and indent the new list four spaces, for example:

~~~
1. This is a step.
    - This is a bullet.
    - This is a bullet.
    - This is a bullet.

2. This is a step.
~~~

#### Nesting Paragraphs or Code Blocks

When?

To nest a paragraph or code block under a list item, insert an empty line and then indent the paragraph or code block 4 spaces, for example:

```
1. This is a step.

    This is a nested paragraph.

    ~~~ shell
    $ command
    ~~~
```

Similarly, to nest a paragraph or code block under a *nested* list item, insert an empty line and then indent the paragraph or code block 8 spaces, for example:

```
1. This is a step.
    - This is a bullet.

        ~~~ shell
        $ command
        ~~~
    - This is a bullet.

        ~~~ shell
        $ command
        ~~~
    - This is a bullet.

        ~~~ shell
        $ command
        ~~~

2. This is a step.
```

### Notes, Warnings, & Tips

When? note vs. note that vs. using call out

Our docs use three classes of highlighted text:

- [Tips](#tips)
- [Notes](#notes)
- [Warnings](#warnings)

The text of notes, warnings, and tips must be formatted in HTML instead of Markdown/Kramdown.

#### Tips

Use tips to highlight nice-to-know pieces of information.

For example, you might include a tip to our Github repo's Terraform scripts on the Google Cloud Engine deployment page. It's nice to know it's there, but doesn't clarify anything nor is it critical.

To insert a tip, use the following code:

~~~
{{site.data.alerts.callout_success}} <tip text goes here> {{site.data.alerts.end}}
~~~

#### Notes

Use notes to call attention to a piece of clarifying information; this information should not be crucial to accomplishing the task in the document.

For example, you might use a note to let users know that the `DELETE` statement only deletes rows and that to delete columns you must use `ALTER TABLE`. This helps clarify `DELETE`'s purpose and point misguided users to the right place.

To insert a note, use the following code:

~~~
{{site.data.alerts.callout_info}} <note text goes here> {{site.data.alerts.end}}
~~~

#### Warnings

Use warning to express that a piece of information is critical to understand to prevent unexpected things from happening.

For example, you might include a warning that using `CASCADE` in `DROP INDEX` drops dependent objects without warning. This is critical to prevent users from unexpectedly losing constraints or additional indexes.

To insert a warning, use the following code:

~~~
{{site.data.alerts.callout_danger}} <warning text goes here> {{site.data.alerts.end}}
~~~

### Tables

Use tables to display structured information in an easy-to-read format.

To create a table, use pipes (`|`) between columns and at least 3 dashes (`-`) separating the header cells from the body cells. A return denotes the start of the next row. The text within each column do not need to align in order to be rendered correctly, and you can inline Markdown or HTML.

when to move to html?

We do not use outer pipes.

Example:

~~~
   Term   |         Description         |     Example    
----------|-----------------------------|----------------
 `term_1` | This is a description.      | `3.14`         
 `term_2` | This is also a description. | `"lola mcdog"`
~~~

### Text Format

#### Bold

When?

Surround the text with two asterisks.

Example:

`**This is bold.**` or `Only **bold** will be bold.`

#### Italics

When?

Surround the text with one underline.

Example:

`_This is italicized._` or `Only _italics_ will be italicized.`

#### Monospace

See [Inline Code](#inline-code).

#### Quotations


#### Underline

When?

### Version Tags

Use HTML version tags to denote new or updated features for the version.

To insert a version tag, use the following code:

~~~
<span class="version-tag">New in vX.X:</span>
~~~
