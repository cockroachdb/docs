# CockroachDB Docs Style Guide

CockroachDB docs should be:

- Clear
- Correct
- Concise

The following guidance is provided to ensure consistency.

**Note:** This style guide should be viewed in its [rendered state](https://github.com/cockroachdb/docs/blob/master/STYLE.md), not in raw Markdown.

Included in this guide:

- [Language and tone](#language-and-tone)
- [Capitalization and punctuation](#capitalization-and-punctuation)
- [File conventions](#file-conventions)
- [Documentation types](#documentation-types)
    - [Reference and task-based docs](#reference-and-task-based-docs)
    - [Tutorials, training, and examples](#tutorials-training-and-examples)
    - [Concept docs](#concept-docs)
- [Components](#components)
    - [Headings](#headings)
    - [Text format](#text-format)
    - [Links](#links)
    - [Tips, notes, and warnings](#tips-notes-and-warnings)  
    - [Code](#code)
    - [Examples](#examples)
    - [Version tags](#version-tags)      
    - [Tables](#tables)
    - [Lists](#lists)
    - [Images](#images)

## Language and tone

CockroachDB docs should be helpful, humble, positive, and friendly. To achieve this, all docs should be factual and free from hyperbolic language.

Other general guidance about language and tone:

- For [reference and general task-based docs](#reference-and-task-based-docs), use the second-person imperative present tense, also known as "[imperative mood](https://en.wikipedia.org/wiki/Imperative_mood)." These docs should be straightforward and conventional.

    **Example:** In a new terminal, as the `root` user, use the `cockroach user` command to create a new user, `maxroach`.

    **Example:** Now that you have a database, user, and a table, run the following code to insert rows into the table.

- For [tutorials, training, and examples](#tutorials-training-and-examples), we recommend you use the second-person point of view (e.g., you). These docs should be more casual and conversational, as if they are teaching the user, but still straightforward and clear.

    **Example:** In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

- Use active voice instead of passive. For more information, refer to the [Purdue Online Writing Lab resource](https://owl.english.purdue.edu/owl/resource/539/02/).
- Use simple and direct language. Grammar can be incorrect to save simplicity (e.g., many descriptions in [reference docs](#reference-and-task-based-docs) are phrases).

    **Example:** `table name`: The name of the table you want to create audit logs for.

- To expand upon the idea of "free from hyperbolic language", avoid the use of the word "simple" (along with "just", "easily", "actually", etc.) since it's not really possible to tell what might be easy or hard for the user. Something you think is simple may be challenging for them.

- Use contractions to simplify language, but not in cases where a clear directive or prohibition is being given (e.g., `do not` / `cannot` / `should not` instead of `do not` / `cannot` / `shouldn't`).

    **Example:** A primary key cannot be changed using `ALTER TABLE`.

    **Example:** If you leave versioned binaries on your servers, you do not need to do anything.

## Capitalization and punctuation

Capitalization rules:

- Use sentence-case instead of title-case for all [headings](#headings).
- Depending on the context, use title-case or sentence-case for [links](#links).
- Capitalize proper nouns, CockroachDB specific terms, and the names of UI features:

    **Examples:** CockroachDB, Cockroach Labs, the Overview dashboard, the SQL Queries graph

- Follow SQL capitalization standards.

Punctuation rules:

- Limit semicolon usage. Instead, try two simple sentences.
- Don't use end punctuation (e.g., periods or colons) in headings.
- Use periods at the end of list items if it is a sentence or completes a sentence.
- Use the [Oxford (a.k.a. serial) comma](https://en.wikipedia.org/wiki/Serial_comma).

For more detail about how to format text, see [Componenets](#components).

## File conventions

CockroachDB docs are mainly comprised of pages (`.md`) and images (`.png` or `.gif`). File names are lowercase with a dash between words, and should be brief but descriptive.

Examples:

- `this-is-a-doc.md`
- `name-of-your-image.png`

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v2.0 are in the `docs > v2.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are found in a directory named for the version under the `images` directory. For example, images for CockroachDB v1.0 are in the `docs > images > v1.0` directory. For more information, see [Images](#images).

## Documentation types

### Reference and task-based docs

Reference docs are informational and provide a comprehensive description of a CockroachDB function or feature, while task-based docs are instructional and provide prescriptive, step-by-step guidance to help a user complete a specific task.

Examples:

- **SQL reference doc example:** [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)
- **CLI reference doc example:** [Use the Built-in SQL Client](https://www.cockroachlabs.com/docs/stable/use-the-built-in-sql-client.html)
- **Task-based doc example:** [Orchestrate CockroachDB with Kubernetes](https://www.cockroachlabs.com/docs/stable/orchestrate-cockroachdb-with-kubernetes.html)

### Tutorials, training, and examples

Tutorials, training, and examples are educational docs or sections meant to acquaint users with CockroachDB and its features. These docs should be written in a more conversational [tone](#language-and-tone), as if they are teaching the user.

Headings in tutorials and training docs should include `Step N.` to denote the sequence of steps to follow.

- **Tutorial example:** [JSON Support](https://www.cockroachlabs.com/docs/stable/demo-json-support)
- **Training example:** [Cluster Startup and Scaling](https://www.cockroachlabs.com/docs/stable/training/cluster-startup-and-scaling.html)
- **Example examples:** [Define Table Partitions](https://www.cockroachlabs.com/docs/stable/partitioning.html#examples), [Manage Roles](https://www.cockroachlabs.com/docs/stable/roles.html#example)

### Concept docs

Concept docs are guides that detail how CockroachDB is built, but does not explain how you should architect an application using CockroachDB.

Examples:

- [Architecture Overview](https://www.cockroachlabs.com/docs/stable/architecture/overview.html)
- [SQL Layer](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html)

## Components

### Headings

Use headings to demarcate content into a hierarchy to help readers find information easier.

Headings should be sentence-case, and are denoted by number signs (`#`) followed by one space. Enter a line break between a heading and its content. CockroachDB docs use Heading 2 (`##`), Heading 3 (`###`) and Heading 4 (`####`). We try to use Heading 4 sparingly.

Heading 1 is reserved for page titles and should be title-case. Anything under Heading 4 can be denoted by bolded text, or other layout options should be considered.

Examples:

- `## This is heading 2`
- `### And this is heading 3`
- `## Step 2. This is a step in a tutorial`

### Text format

#### Bold

Use bolded text to emphasize an important word or phrase, when referring to the name of a UI section or field, or to create visual separation and callouts (e.g., **Example:**). Bold should not be combined with italic.

To bold a word or phrase, surround the text with two asterisks (`**`).

**Examples:**

- The **Overview** dashboard is displayed. Hover over the **SQL Queries** graph at the top.
- **This is an experimental feature.** The interface and output of this feature are subject to change.
- **Default:** `NULL`

#### Monospace

See [Inline Code](#inline-code).

#### Quotation marks

Use quotation marks (`""`) to indicate a direct, word-for-word quotation.

**Example:** As stated in RFC8259, "JavaScript Object Notation (JSON) is a lightweight, text-based, language-independent data interchange format."

#### Italics

Do not use italicized text in CockroachDB docs. If it seems beneficial to emphasize a word or phrase, use [bold](#bold).

#### Underline

Do not use underlined text in CockroachDB docs. If it seems beneficial to emphasize a word or phrase, use [bold](#bold).

### Links

Whenever a CockroachDB feature is referenced, a link to the relevant documentation should be provided. Links to external resources can also be provided, but only if the resource is vetted and no CockroachDB documentation covers the topic.

Use Markdown's reference-style links when several parts of the same page refer to the same target URLs (e.g., [Release Notes](https://raw.githubusercontent.com/cockroachdb/docs/master/releases/v2.1.0-alpha.20180507.md)).

Link capitalization can be either title- or sentence-case:

- **Use title-case** when referring to the linked doc by name (e.g., “See __Best Practices__ for more information”).
- **Use sentence-case** - when linking in the middle of a sentence (e.g., “[…] follow the __identifier rules__ when creating […]“).

Links are marked with inline text surrounded by square brackets followed by the link address in parentheses. If you are including a relative (i.e., internal) link:

- To another page in the docs, use just the name of the file.

    **Example:** `[here](name-of-article.html)`

- To a specific section on another page, use the name of the file plus the heading.

    **Example:** `[xyz](name-of-article.html#heading-on-page)`

- To a specific section on the current page, use just the heading.

    **Example:** `[xyz](#heading-on-page)`

### Tips, notes, and warnings

Our docs use three classes of highlighted text:

- [Tips](#tips)
- [Notes](#notes)
- [Warnings](#warnings)

The text of notes, warnings, and tips must be formatted in HTML instead of Markdown.

#### Tips

Use tips to highlight nice-to-know pieces of information.

For example, you might include a tip to our Github repo's Terraform scripts on the Google Cloud Engine deployment page. It's nice to know it's there, but doesn't clarify anything nor is it critical.

To insert a tip, use the following code:

~~~
{{site.data.alerts.callout_success}}
<tip text goes here>
{{site.data.alerts.end}}
~~~

Each liquid tag should be on its own line. Markdown can be used within the highlighted text.

#### Notes

Use notes to call attention to a piece of clarifying information; this information should not be crucial to accomplishing the task in the document.

For example, you might use a note to let users know that the `DELETE` statement only deletes rows and that to delete columns you must use `ALTER TABLE`. This helps clarify `DELETE`'s purpose and point users to the right place.

To insert a note, use the following code:

~~~
{{site.data.alerts.callout_info}}
<note text goes here>
{{site.data.alerts.end}}
~~~

Each liquid tag should be on its own line. Markdown can be used within the highlighted text.

#### Warnings

Use warning to express that a piece of information is critical to understand to prevent unexpected things from happening.

For example, you might include a warning that using `CASCADE` in `DROP INDEX` drops dependent objects without warning. This is critical to prevent users from unexpectedly losing constraints or additional indexes.

To insert a warning, use the following code:

~~~
{{site.data.alerts.callout_danger}}
<warning text goes here>
{{site.data.alerts.end}}
~~~

Each liquid tag should be on its own line. Markdown can be used within the highlighted text.

### Code

Code can be shown [inline](#inline-code) or as a [code block](#code-blocks).

#### Inline code

Inline `code` has `back-ticks (``) around` it and is used when referring to code, commands, or other technical syntax within a sentence.

Example: The `CREATE TABLE` statement creates a new table in a database.

#### Code blocks

Code blocks are used to provide executable code samples, marked with an opening and closing set of 3 tildes (`~~~`). Code blocks can support syntax highlighting if you add the language name immediately after the first line of back-ticks. There should be one returned line before and after a code block, for better Markdown readability. For example:

```
This is a sample line of text.

{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

This is more sample text.
```

Shell and SQL commands should be syntax highlighted where appropriate using the following info:

**Shell code samples**

Start shell code samples with `~~~ shell` followed by a line break. The first character of the next line must be the terminal marker `$`. For multi-line shell commands, use a backslash (`\`) at the end of each line to indicate a line break.

**SQL code samples**

SQL code samples are broken into two sections: commands and responses.

- **Commands** (e.g., `SELECT`, `CREATE TABLE`) should begin with `~~~ sql` followed by a line break. The first character of the next line must be the terminal marker `>`. Commands should be properly capitalized, and there should be only one command per code sample.

- **Responses** (e.g., retrieved tables) should begin with `~~~` but should *not* be syntax highlighted.

  Note that not all responses warrant inclusion. For example, if a SQL code sample shows `CREATE TABLE`, `INSERT`, and then `SELECT`, it's unnecessary to show the responses for `CREATE TABLE` (which is just `CREATE TABLE`) and `INSERT` (which is just `INSERT <number of rows>`).

**Copy to Clipboard Button**

Many of our code blocks are written so users can copy and paste them directly into a terminal. To make that easier, add the **Copy to Clipboard** button by placing `{% include copy-clipboard.html %}` on the line directly preceding the code block, for example:

```
{% include copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~
```

**Copy to Clipboard** should be used for every code block that can be **executed**.

### Examples

Examples help show the feature in action. Examples follow a basic format:

1. The **Title** should start with a verb and should describe the task the example is outlining. It should use title-case.

    **Example:** Create a Table that Mirrors Key-Value Storage

2. **Introductory information** should be provided if some context is needed to orient the user and can also be used to introduce code blocks. This should be written in a conversational tone.

    **Example:** "CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:"

- **[Code blocks](#code-blocks)** should be used to provide executable code samples.

    **Example:** "CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:

    ~~~
    > CREATE TABLE kv (k INT PRIMARY KEY, v BYTES);
    ~~~

    When such a "simple" table has no indexes or foreign keys, `INSERT`/`UPSERT`/`UPDATE`/`DELETE` statements translate to key-value operations with minimal overhead (single digit percent slowdowns)." [_Click here to see the rest of the example._](https://www.cockroachlabs.com/docs/stable/create-table.html#create-a-table-that-mirrors-key-value-storage)

### Version tags

Use HTML version tags to denote new or updated features for the version. Version tags can be put at the end of a heading, if the whole section describes something that is new or updated. Otherwise, version tags can introduce a paragraph, sentence, or description in a table cell.

To insert a version tag, use the following code:

~~~
<span class="version-tag">New in vX.X:</span>
~~~

Note: Version tags cannot be used in bulleted lists items. To denote a new feature in a bulleted list, start the bulleted item with "**New in vX.X:**".

Examples:

- [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)

### Tables

Use tables to display structured information in an easy-to-read format. There are two types of tables we use: [Markdown](#markdown) and [HTML](#html).

#### Markdown

If table formatting can be kept simple (e.g., basic text formatting and using `<br>` tags for paragraph breaks), create a table using Markdown. This is the preferred table format.

To create a table, use pipes (`|`) between columns and at least 3 dashes (`-`) separating the header cells from the body cells. A return denotes the start of the next row. The text within each column does not need to align in order to be rendered correctly, and you can inline Markdown or HTML.

We do not use outer pipes.

Example:

~~~
   Term   |         Description         |     Example    
----------|-----------------------------|----------------
 `term_1` | This is a description.      | `3.14`         
 `term_2` | This is also a description. | `"lola mcdog"`
~~~

The following Markdown formatting can be used within a Markdown table:

- [Bold](#bold)
- [Italics](#italics)
- [Inline code](#inline-code)
- [Links](#links)

The following formatting needs to be in HTML to be used within a Markdown table:

- Paragraph breaks (`<br>`)
- Lists (`ol` / `ul` / `<li>`)

Note that if the formatting becomes too complex, create an [HTML table](#html).

The following formatting is not supported within a Markdown table:

- [Liquid tags](https://shopify.github.io/liquid/)
- [Code blocks](#code-blocks)

#### HTML

If it's necessary to include more complex table formatting or if a [Markdown table](#markdown) becomes too unwieldy, create a table using HTML. This formatting is not recommended unless necessary, since it is hard for other writers to parse and maintain.

The following HTML formatting can be used within an HTML table:

- Bold (`<strong>`)
- Italics (`<em>`)
- Inline code (`<code>`)
- Links (`<a href`)
- Paragraph breaks (`<p>`)
- Lists (`<ol>` / `<ul>` / `<li>`)

**Example:** [Query Options](admin-ui-custom-chart-debug-page.html#query-options) table (see [GitHub](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/admin-ui-custom-chart-debug-page-00.html) for the raw HTML)

### Lists

CockroachDB docs uses two types of lists:

- **Numbered** (i.e., ordered list) - Use to list information that should appear in order, like steps.

    **Example:** [Start CockroachDB](https://www.cockroachlabs.com/docs/stable/deploy-a-test-cluster.html#step-1-start-cockroachdb) in the Deploy a Test Cluster doc

- **Bulleted** (i.e., unordered list) - Use to list related information in an easy-to-read way.

    **Example:** [Start the First Node](https://www.cockroachlabs.com/docs/stable/start-a-local-cluster.html#step-1-start-the-first-node) in the Start a Local Cluster doc

Lists should be introduced by a sentence and a colon. Use periods at the end of list items if it is a sentence or completes a sentence.

For each item of a **numbered list**, use the step number followed by a period and a space, e.g., `1. This is a numbered list`.

For each item of a **bulleted list**, use one dash followed by one space to denote a list item, e.g., `- This is a bulleted list`.

#### Nesting lists

To nest a list under a list item, start the list on the next line (no empty line), and indent the new list four spaces, for example:

```
1. This is a step.
    - This is a bullet.
    - This is a bullet.
    - This is a bullet.

2. This is a step.
```

#### Nesting paragraphs or code blocks

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

### Images

Use images to clarify a topic, but only use them as needed. Images are either:

- **Screenshots** - Provide a UI visual. Screenshots should show enough of the UI that the user can easily orient themselves and understand what they are being shown. If a screenshot needs an annotation, use a red box.
- **Diagrams** - Provide a visual of a complicated theory. Diagrams should be simple and easy to read.

Use the following HTML and liquid to include an image in a markdown page:

~~~ html
<img src="{{ 'images/v2.1/image-name.png' | relative_url }}" alt="Alternative Text Here" style="border:1px solid #eee;max-width:100%" />
~~~

Example: [Decommission Nodes](https://www.cockroachlabs.com/docs/stable/remove-nodes.html#step-1-check-the-node-before-decommissioning)
