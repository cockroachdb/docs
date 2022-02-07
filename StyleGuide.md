CockroachDB docs should be:

- Clear
- Correct
- Concise

The following guidance is provided to ensure consistency.

Included in this guide:

- [Style and tone](#style-and-tone)
- [Inclusive language](#inclusive-language)
- [Capitalization and punctuation](#capitalization-and-punctuation)
- [File conventions](#file-conventions)
- [Documentation types](#documentation-types)
- [Components](#components)
    - [Headings](#headings)
    - [Text format](#text-format)
    - [Links](#links)
    - [Tips, notes, and warnings](#tips-notes-and-warnings)
    - [Product names](#product-names)
    - [Code](#code)
    - [Examples](#examples)
    - [Version tags](#version-tags)      
    - [Tables](#tables)
    - [Lists](#lists)
    - [Images](#images)
- [Terminology and word usage](#terminology-and-word-usage)

## Style and tone

CockroachDB docs should be helpful, humble, positive, and friendly. To achieve this, all docs should be factual and free from hyperbolic language.

Other general guidance about language and tone:

- For [reference and general task-based docs](#reference-and-task-based-docs), use the second-person imperative present tense, also known as "[imperative mood](https://en.wikipedia.org/wiki/Imperative_mood)." These docs should be straightforward and conventional.

    **Example:** In a new terminal, as the `root` user, use the `cockroach user` command to create a new user, `maxroach`.

    **Example:** Now that you have a database, user, and a table, run the following code to insert rows into the table.

- For [tutorials and examples](#tutorials-and-examples), we recommend you use the second-person point of view (e.g., you). These docs should be more casual and conversational, as if they are teaching the user, but still straightforward and clear.

    **Example:** In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

- Use active voice instead of passive. For more information, refer to the [Purdue Online Writing Lab resource](https://owl.english.purdue.edu/owl/resource/539/02/).
- Use simple and direct language. Grammar can be incorrect to save simplicity (e.g., many descriptions in [reference docs](#reference-and-task-based-docs) are phrases).

    **Example:** `table name`: The name of the table you want to create audit logs for.

- To expand upon the idea of "free from hyperbolic language", avoid the use of the word "simple" (along with "just", "easily", "actually", etc.) since it's not really possible to tell what might be easy or hard for the user. Something you think is simple may be challenging for them.

- Use contractions to simplify language, but not in cases where a clear directive or prohibition is being given (e.g., `do not` / `cannot` / `should not` instead of `don't` / `can't` / `shouldn't`).

    **Example:** A primary key cannot be changed using `ALTER TABLE`.

    **Example:** If you leave versioned binaries on your servers, you do not need to do anything.

## Inclusive language

We want our education materials to be inclusive and written with diversity in mind. This section provides general guidelines, best practices, and examples when writing docs or training materials. This is a work in progress and we welcome any feedback and additions.

### Avoid ableist language

An informal tone can allow for problematic ableist language due to figures of speech and colloquial language. Ableist language includes words like “crazy”, “insane”, “blind”, “dummy”, “cripple”, and more.

Examples:
- Replace _dummy_ with **placeholder, sample**
- Replace _sanity-check_ with **final check, confirm**

### Avoid unnecessarily gendered language

Be aware of personal pronouns in examples and outdated gendered terms.

Best practices:

- Try to avoid personal pronouns (i.e., use proper nouns, “the user”, etc.)
- If personal pronoun is needed for clarity or conciseness, default to gender-neutral pronouns (they/them)
- Be aware of other possible gendered language (e.g., man-hours, man-in-the-middle attacks), and find alternatives.

Examples:

- Replace _man hours_ with one of: **work hours**, **staff hours**, **person hours**.
- Replace _manning_ with **staffing**.
- Replace _man-in-the-middle attack_ with **machine-in-the-middle attack**.

### Write diverse and inclusive examples

Avoid examples that are US-specific or centric.

Best practices:

- Avoid US-specific holidays, sports, figures of speech, etc.
- Use a diverse set of names in examples

### Avoid unnecessarily violent language

Avoid violent or harmful terms.

Examples:

- Replace _kill_ with **terminate**

Note: Terminology around "kill" vs. "stop" vs. "terminate" is nuanced, as described [here](https://github.com/cockroachdb/docs/issues/7767#issuecomment-662028864). Use your best judgement.

### Write accessible documentation

Don't use directional terms as the only clue to location. Left, right, up, down, above, and below aren’t very useful for people who use screen-reading software. Good replacements are "preceding" and "following". If you must use a directional term, provide additional text about the location, such as in the Save As dialog box, on the Standard toolbar, or in the title bar.

Provide Alt text that adequately summarizes the intent of each image.

Use meaningful link text. For example, don't use "here" or "this documentation".

### Write about features and users in inclusive ways

Avoid using socially-charged terms for features / technical concepts.

Examples:

- Replace _blacklist / whitelist_ with **denylist / allowlist**
- Replace _master / slave_ with **main/principal/primary/manager** and **secondary/subordinate/worker**
- Replace _native_ with **core, built-in, top-level, integrated, “built for”** or omit
- Replace _old_ with **existing, previous, first, original**

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

For more detail about how to format text, see [Components](#components).

## File conventions

CockroachDB docs are mainly comprised of pages (`.md`) and images (`.png` or `.gif`). File names are lowercase with a dash between words, and should be brief but descriptive.

Examples:

- `this-is-a-doc.md`
- `name-of-your-image.png`

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v2.0 are in the `docs > v2.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are found in a directory named for the version under the `images` directory. For example, images for CockroachDB v1.0 are in the `docs > images > v1.0` directory. For more information, see [Images](#images).

## Documentation types

There are four general documentation types:

- [How-to docs](#how-to-docs)
- [Tutorials](#tutorials)
- [Reference docs](#reference-docs)
- [Conceptual docs](#conceptual-docs)

When writing a document, you should follow these type definitions with a degree of flexibility, as there is some amount of cross-over between them.

### How-to docs

How-to docs provide step-by-step instructions on completing a specific goal. In contrast with [tutorials](#tutorials), how-to docs are discrete, action-based, and do not need to be limited to a specific use-case. 

Here are some principles to follow when writing a how-to doc:

- The title of the page should state an actionable goal for the user. For example, if the goal of a user is to start a cluster, the title of the how-to doc might be "Start a Cluster".
- The title of the page, and the steps on the page, should be second-person imperative. For example, if the first step in starting a cluster is to generate certificates, then the first header on the page might be "Generate certificates" (as opposed to "Generating certificates" or "How to generate certificates").
- Limit the amount of reference information on the page. You can add hyperlinks to the relevant sections of separate [reference docs](#reference-docs).
- When using examples (e.g., code snippets, or dedicated task-based examples), aim for utility and simplicity. Lengthier examples are better for tutorials. A large number of smaller examples is better for reference docs.
- If the instructions in the doc are ordered steps, the headings should include `Step N.` to denote the sequence of steps to follow.

Here are some examples of how-to docs in our documentation:

- [Create a CockroachCloud Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster.html)
- [Upgrade to CockroachDB vX.X](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version.html)

### Tutorials

Tutorials provide step-by-step instructions on using CockroachDB in the context of a specific use-case. In contrast with how-to docs, tutorials are meant to acquaint users with a specific feature of CockroachDB through an end-to-end example. As such, tutorials should be written in a more conversational [tone](#language-and-tone), as if they are teaching the user.

Here are some principles to follow when writing a tutorial:

- Headings should include `Step N.` to denote the sequence of steps to follow.
- Limit the number of steps. Aim for the heuristic maximum of 10 steps.
- Make the instructions prescriptive (i.e., tell the user exactly what to do).
- Try to keep the tutorial self-contained. It's okay to link to reference information at the end of a step, but if you are being prescriptive, the reader shouldn't have to consult multiple pages to actually complete the tutorial.

Here are some examples of tutorials in our documentation:

- [JSON Support](https://www.cockroachlabs.com/docs/stable/demo-json-support.html)
- [Spatial tutorial](https://www.cockroachlabs.com/docs/stable/spatial-tutorial.html)

### Reference docs

Reference docs provide information about a specific CockroachDB function, feature, or interface. Reference docs are detail-oriented, and should include all of the information available on a specific topic, without providing prescriptive guidance.

Here are some principles to follow when writing reference docs:

- Reference docs should be comprehensive and (above all else) accurate. This principle might apply to other doc types, but it is especially important for reference docs, as they are the ultimate source of truth (i.e., the "reference") for users of a particular feature or interface.
- Reference docs should be succinct. Prose is better suited for [conceptual docs](#conceptual-docs).

Here are some examples of reference docs in our documentation:

- **SQL reference doc example:** [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)
- **CLI reference doc example:** [`cockroach sql`](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html)

### Conceptual docs

Concept docs explain how a particular feature works, or how a specific system is designed. Conceptual docs do not provide prescriptive guidance or instruction.

Here are some principles to follow when writing conceptual docs:

- Do not assume that your reader knows everything. Provide as much relevant information as you can, and then link to other, external docs as necessary.
- Don't limit your content to words and tables. Use graphs and charts when you can.

Here are some examples of conceptual docs in our documentation:

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

- To link to another page in the docs, use just the name of the file.

    **Example:** `[here](name-of-article.html)`

- To link to a specific heading on another page, use the name of the file plus the heading.

    **Example:** `[xyz](name-of-article.html#heading-on-page)`

- To link to a specific heading on the current page, use just the heading.

    **Example:** `[xyz](#heading-on-page)`

- To link to a specific location on a page that is not a heading (e.g., a specific command-line flag in a table), add a manual anchor and use the `name` parameter:

    **Example:**

    ```
    # Anchor:
    <a name="flags-max-offset"></a>`--max-offset`
    ```

    ```
    # Link:
    [--max-offset](#flags-max-offset)
    ```

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

There is also a custom purple callout that uses the code `{{site.data.alerts.callout_version}}`. It is used at the top of the CockroachDB Cloud Release Notes to call attention to the latest CockroachDB version that Cloud clusters are running. It should not be used anywhere else.

Each liquid tag should be on its own line. Markdown can be used within the highlighted text.

### Product names

All product names except CockroachDB should be written as liquid variables unless part of front-matter, file names, or non-markdown files. Use the following code in place of product names:

**CockroachDB Serverless (beta)** : `{{ site.data.products.serverless }}`

**CockroachDB Serverless** : `{{ site.data.products.serverless-plan }}`

**CockroachDB Dedicated** : `{{ site.data.products.dedicated }}`

**CockroachDB Self-Hosted** : `{{ site.data.products.core }}`

**Enterprise** : `{{ site.data.products.enterprise }}`

**CockroachDB Cloud** : `{{ site.data.products.db }}`

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

- **Numbered** (i.e., ordered list) - Use to list information that should appear in order, like tutorial steps.

    **Example:** [Start CockroachDB](https://www.cockroachlabs.com/docs/stable/deploy-a-test-cluster.html#step-1-start-cockroachdb) in the Deploy a Test Cluster doc

- **Bulleted** (i.e., unordered list) - Use to list related information in an easy-to-read way.

    **Example:** [Start the First Node](https://www.cockroachlabs.com/docs/stable/start-a-local-cluster.html#step-1-start-the-first-node) in the Start a Local Cluster doc

Lists should be introduced by a sentence and a colon. Use periods at the end of list items if it is a sentence or completes a sentence.

For each item of a **numbered list**, use `1.` followed by a period and a space, e.g., `1. This is a numbered list`. Markdown will render the steps in the correct order.

For each item of a **bulleted list**, use one dash followed by one space to denote a list item, e.g., `- This is a bulleted list`.

#### Nesting lists

To nest a list under a list item, start the list on the next line (no empty line), and indent the new list four spaces, for example:

```
1. This is a step.
    - This is a bullet.
    - This is a bullet.
    - This is a bullet.

1. This is a step.

    This is a nested paragraph.
    - This is a bullet.
    - This is a bullet.
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

1. This is a step.
```

### Images

Use images to clarify a topic, but only use them as needed. Images are either:

- **Screenshots** - Provide a UI visual. Screenshots should show enough of the UI that the user can easily orient themselves and understand what they are being shown. If a screenshot needs an annotation, use a red box.
- **Diagrams** - Provide a visual of a complicated theory. Diagrams should be simple and easy to read.

**Note**: Screenshots are difficult to keep current, and impact the accessibility of our documentation. Screenshots should only be added to the docs if they are necessary for the user to accomplish a task or understand a feature. For example, a screenshot of a Contention metric graph in the DB Console could be necessary if it is used as an example of a cluster with high contention in a how-to on troubleshooting performance. It is not necessary in a reference topic about the DB Console user-interface. If you add a screenshot to a topic, make sure the topic describes what is being shown in the screenshot for SEO and accessibility for visually impaired users.

Use the following HTML and liquid to include an image in a markdown page:

~~~ html
<img src="{{ 'images/v2.1/image-name.png' | relative_url }}" alt="Alternative Text Here" style="border:1px solid #eee;max-width:100%" />
~~~

Example: [Decommission Nodes](https://www.cockroachlabs.com/docs/stable/remove-nodes.html#step-1-check-the-node-before-decommissioning)

## Terminology and word usage

Term | Classification | Note
--- |:---:| ---
Postgres | 🔴 | This is a nickname for PostgreSQL. Use PostgreSQL instead: it’s the official name, our docs site and Google treat these as synonyms, and Cmd+F on `Postgres` will still find `PostgreSQL`.
PostgreSQL | 🟢 | Preferred over Postgres. 
