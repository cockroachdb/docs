CockroachDB docs should be:

- Clear
- Correct
- Concise

The following guidance is provided to ensure consistency.

Included in this guide:

- [Style and tone](#style-and-tone)
- [Inclusive language](#inclusive-language)
  - [Avoid ableist language](#avoid-ableist-language)
  - [Avoid unnecessarily gendered language](#avoid-unnecessarily-gendered-language)
  - [Write diverse and inclusive examples](#write-diverse-and-inclusive-examples)
  - [Avoid unnecessarily violent language](#avoid-unnecessarily-violent-language)
  - [Write accessible documentation](#write-accessible-documentation)
  - [Write about features and users in inclusive ways](#write-about-features-and-users-in-inclusive-ways)
- [Capitalization and punctuation](#capitalization-and-punctuation)
  - [Capitalization rules](#capitalization-rules)
  - [Punctuation rules](#punctuation-rules)
- [File conventions](#file-conventions)
- [Content types](#content-types)
  - [Concept](#concept)
  - [Task](#task)
  - [Reference](#reference)
  - [Definition](#definition)
- [Standard sections](#standard-sections)
  - [Glossary](#glossary)
  - [See also](#see-also)
  - [Prerequisites](#prerequisites)
- [Page types](#page-types)
  - [Tutorial](#tutorials)
  - [Best practice](#best-practice)
  - [Troubleshooting](#troubleshooting)
  - [FAQ](#faq)
  - [Release note](release-note)
- [Components](#components)
  - [Page title](#page-title)
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

    **Example:** `table name`: The name of the table to create audit logs for.

- To expand upon the idea of "free from hyperbolic language", avoid the use of the word "simple" (along with "just", "easily", "actually", etc.) since it's not really possible to tell what might be easy or hard for the user. Something you think is simple may be challenging for them.

- Use contractions to simplify language, but not in cases where a clear directive or prohibition is being given (e.g., `do not` / `cannot` / `should not` instead of `don't` / `can't` / `shouldn't`).

    **Example:** You cannot change primary key using `ALTER TABLE`.

    **Example:** If you leave versioned binaries on your servers, you do not need to do anything.

## Inclusive language

We want our education materials to be inclusive and written with diversity in mind. This section provides general guidelines, best practices, and examples when writing docs or training materials. This is a work in progress and we welcome any feedback and additions.

### Avoid ableist language

An informal tone can allow for problematic ableist language due to figures of speech and colloquial language. Ableist language includes words like "crazy", "insane", "blind", "dummy", "cripple", and more.

#### Examples

- Replace _dummy_ with **placeholder, sample**.
- Replace _sanity-check_ with **final check, confirm**.

### Avoid unnecessarily gendered language

Be aware of personal pronouns in examples and outdated gendered terms.

Best practices:

- Avoid personal pronouns (i.e., use proper nouns, "the user", etc.).
- If a personal pronoun is needed for clarity or conciseness, default to gender-neutral pronouns (they/them).
- Be aware of other possible gendered language (e.g., man-hours, man-in-the-middle attacks), and find alternatives.

#### Examples

- Replace _man hours_ with one of: **work hours**, **staff hours**, **person hours**.
- Replace _manning_ with **staffing**.
- Replace _man-in-the-middle attack_ with **machine-in-the-middle attack**.

### Write diverse and inclusive examples

Avoid examples that are US-specific or centric.

Best practices:

- Avoid US-specific holidays, sports, figures of speech, etc.
- Use a diverse set of names in examples.

### Avoid unnecessarily violent language

Avoid violent or harmful terms.

#### Examples

- Replace "_kill_" with **terminate**
- Replace "_hit_ Enter" with **press Enter**.
- Replace "_hit_ your spend limit" with **reach your spend limit**
- Replace "_hit_ an error" with **experience an error**.
- Replace "performance _hit_" with **reduced performance**.
- Replace "want to _hit_ up" with **want to visit**.

Terminology around "kill" vs. "stop" vs. "terminate" is nuanced, as described [in this GitHub comment](https://github.com/cockroachdb/docs/issues/7767#issuecomment-662028864). Use your best judgement.

### Write accessible documentation

- Don't use directional terms as the only clue to location within a page. "Left", "right", "up", "down", "above", and "below" aren't useful for people who use screen-reading software. Good replacements are "preceding" and "following". If you must use a directional term, provide additional text about the location, such as in the Save As dialog box, on the Standard toolbar, or in the title bar.
- Provide Alt text that adequately summarizes the intent of each image.
- Link text should be the same as or summarize the title of the link target. Avoid **here** and **this documentation**.

### Write about features and users in inclusive ways

Avoid using socially-charged terms for features and technical concepts.

#### Examples

- Replace _blacklist / whitelist_ with **denylist / allowlist**
- Replace _master / slave_ with **main/principal/primary/manager** and **secondary/subordinate/worker**
- Replace _native_ with **core, built-in, top-level, integrated, "built for"** or omit
- Replace _old_ with **existing, previous, first, original**

## Capitalization and punctuation

### Capitalization rules

- Use title case for titles.
- Use sentence case instead of title case for all [headings](#headings).
- Depending on the target, use title case or sentence case for [links](#links).
- Capitalize proper nouns, CockroachDB specific terms, and the names of UI features:

    **Examples:** CockroachDB, Cockroach Labs, the Overview dashboard, the SQL Queries graph

- Follow SQL capitalization standards.
- In body text, only capitalize proper nouns. Do not capitalize common nouns, even if the common noun is an important product concept.

    **Example:**
      - Correct: New clusters will now have admission control enabled by default.
      - Incorrect: New clusters will now have Admission Control enabled by default.

### Punctuation rules

- Limit semicolon usage. Instead, try two simple sentences.
- Don't use end punctuation (e.g., periods or colons) in headings.
- Use periods at the end of list items if they are sentences or complete a sentence.
- Use the [Oxford (a.k.a. serial) comma](https://en.wikipedia.org/wiki/Serial_comma).

For more detail about how to format text, see [Components](#components).

## File conventions

CockroachDB docs are mainly comprised of pages (`.md`) and images (`.png` or `.gif`). File names are lowercase with a dash between words, and should be brief but descriptive.

### Examples

- `this-is-a-doc.md`
- `name-of-your-image.png`

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v21.1 are in the `docs > v21.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are stored in a versioned directory under the `images` directory. For example, images for CockroachDB v21.1 are in the `docs > images > v21.1` directory. For more information, see [Images](#images).

## Content types

There are four fundamental content types:

- [Concept](#concept)
- [Task](#task)
- [Reference](#reference)
- [Definition](#definition)

A page or a heading within a page can be one of these content types.

### Concept

_Concept_ content explains how a particular feature works, or how a specific system is designed. Conceptual pages do not provide prescriptive guidance or instruction.

Concept content helps users understand the foundation of Cockroach Labs services and product features, including definitions of terms with specific meaning in CockroachDB and descriptions of how CockroachDB and Cockroach services are structured.

Concept content often includes a [glossary](#glossary).

- The first sentence answers the implicit question "what is a \<singular noun\>?" in the form **A _\<singular noun\>_ is ….**.

  **Example:** An _index_ is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space to maintain the index data structure.

- For simple concept pages, the title should be a plural noun representing the concept(s) or entities(s) to be described, optionally followed by a page descriptor, such as **Overview**.

  **Example:** Indexes.

- Provide as much relevant information as you can, and then link to other pages as necessary. If there is a related reference topic, link to it within the topic.
- Use diagrams and graphs when you can.

#### Examples

- [Indexes](https://www.cockroachlabs.com/docs/stable/indexes.html)
- [Architecture Overview](https://www.cockroachlabs.com/docs/stable/architecture/overview.html)
- [SQL Layer](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html)
- [Multi-Region Capabilities Overview](https://www.cockroachlabs.com/docs/stable/multiregion-overview.html)

### Task

_Task_ content provides step-by-step instructions to complete a specific goal. In contrast with [tutorials](#tutorials), tasks are discrete, action-based, and do not need to be limited to a specific use case.

Task content helps users efficiently develop, deploy, and manage applications.

At the page level, a task could take two different forms: a page with multiple, related tasks or a single longer task.

- Answers the question of "how to do \<an action\>?" by describing precisely what to do and the order in which to do it.
- The title or heading should state an actionable goal for the user and ideally of the form **\<Imperative verb\> [\<article\>|\<conjunction\>] \<noun\> or \<proper noun\>**.

  **Example:** Create an Index
- The verb ideally should be specific. Avoid generic verbs such as **Use**, **Manage** unless naming a page containing specific tasks.
- Avoid **Your** because you may be using an object that you don't "own".

  **Example:** Connect to a Cluster, not Connect to Your Cluster
- Lead with the verb. Don't bury it at the end of the heading.

  **Example:** Access DB Console, not DB Console Access.

- Present the steps as an ordered list.

- The title of the page, and the steps on the page, should be second-person imperative. For example, if the first step in starting a cluster is to generate a certificate, then the first header on the page might be **Generate a certificate** (as opposed to **Generating a certificate** or **How to generate a certificate**).
- Limit the amount of reference information on the page. You can add links to the relevant sections of [reference](#reference) in line or in the [See also](#see-also) section.
- When using examples (e.g., code snippets, or dedicated task-based examples), aim for utility and simplicity. Lengthier examples are better for tutorials. A large number of smaller examples is better for reference docs.
- If the headings on a page each represent an ordered step of a single task, each heading should start with `Step N.` to denote this sequence, and its substeps should take the form of an ordered list.

#### Examples

- [Create a CockroachCloud Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster.html)
- [Upgrade to CockroachDB vX.X](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version.html)
- [Configure Replication Zones](https://www.cockroachlabs.com/docs/stable/configure-replication-zones.html)

### Reference

_Reference_ content provides information about a specific CockroachDB function, feature, or interface. Reference is detail-oriented, and should include all of the information available on a specific topic, without providing prescriptive guidance. It typically documents programming constructs, interface parameters, or facts about a product that provide quick access to facts, but does not provide explanation of concepts or procedures.

Reference content helps users understand the precise meaning and affect of CockroachDB SQL language constructs, platform, configuration options, and API parameter values, etc.

- The content should be comprehensive and accurate. This principle might apply to other pages types, but it is especially important for reference, as it is the ultimate source of truth (i.e., the "reference") for a particular feature or interface.
- The content should be succinct. Details are typically presented in tabular form. Prose is better suited for [conceptual pages](#conceptual).

#### Examples

- **SQL reference:** [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)
- **CLI reference:** [`cockroach sql`](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html)
- **API reference:** [Cluster API](https://www.cockroachlabs.com/docs/api/cluster/v2)

### Definition

A _definition_ is the statement of the meaning of a term, configuration property, or parameter. A _definition_ consists of a _definition term_ and a _definition description_. Definitions typically appear in [glossaries](#glossary) and [reference](#reference) content.

The definition description should not repeat the definition term.

#### Examples

- Node: An individual machine running CockroachDB. One or more nodes join together to create a cluster.
- Leaseholder: For each range, one of the replicas holds the "range lease." This replica, referred to as the "leaseholder," is the one that receives and coordinates all read and write requests for the range.

## Standard sections

### Glossary

A _glossary_ is a collection (usually in tabular form) of [definitions](#definition).

#### Examples

- [Architecture Glossary](https://www.cockroachlabs.com/docs/v21.2/architecture/overview.html#glossary)
- [Cockroach Cloud Concepts](https://www.cockroachlabs.com/docs/cockroachcloud/architecture.html#cockroachdb-cloud-terms)

### Prerequisites

A _prerequisites_ section describes conditions that must be satisfied before starting a [task](#task) or [tutorial](#tutorial).

### See also

A _see also_ section is a list of related pages.

This section is always the last section in a page.

Keep the list of links short, and think about whether the related pages should instead be linked within the content itself to give users more context around _why_ another topic is related. For example, if the task describes how to perform an action on the command line, and another task describes how to perform the same action in a GUI, the link to the GUI task should be in the topic's introduction, not in the See also section.

## Page types

In addition to the content types, CockroachDB docs have the following special purpose page types:

- [Tutorial](#tutorial)
- [Best practice](#best-practice)
- [Troubleshooting](#troubleshooting)
- [FAQs](#faqs)
- [Release note](#release-note)

### Tutorial

A _tutorial_ is a task that provides instructions on using CockroachDB in the context of a specific use case. Tutorials acquaint users with a specific feature of CockroachDB through an end-to-end example that achieves a concrete result.

A tutorial helps users quickly achieve competence in a CockroachDB feature or understand tradeoffs between different features and feature configurations. The latter usage is complementary to a [Best Practice](#best-practice) guide.

- The title is of the form **\<Imperative verb\> xxx \<noun\>**.

  **Example:** Stream a Changefeed to Snowflake

- The first section describes [prerequisites](#prerequisites). Heading title: **Before you begin** or **Prerequisites**.
- Subsequent headings are **Step 1. \<Imperative verb\> a \<noun\>**, **Step 2. \<Imperative verb\> a \<noun\>**, etc., each containing a small ordered list of steps. Within each **Step**, limit the number of steps. Aim for the heuristic maximum of 10 steps.
- Tutorials should be written in a conversational [tone](#language-and-tone), as if it is teaching the user.
- The instructions should be prescriptive (i.e., tell the user exactly what to do).
- Tutorials should be self-contained. The reader shouldn't have to consult multiple pages to complete the tutorial.

#### Examples

- [Deploy a Local Cluster with Kubernetes](https://www.cockroachlabs.com/docs/stable/orchestrate-a-local-cluster-with-kubernetes.html)
- [Visualize CockroachDB Schemas with DBeaver](https://www.cockroachlabs.com/docs/stable/dbeaver.html)

### Best practice

A _best practice_ guide is a set of recommendations on how to choose among CockroachDB features and their available configurations to achieve specific goals. Goals can include throughput, latency, survivability, and security.

A best practice guide helps users weigh alternative CockroachDB features or feature configurations and achieve specified goals for application availability, response time, etc.

#### Examples

- [SQL Performance Best Practices](https://www.cockroachlabs.com/docs/stable/performance-best-practices-overview.html)
- [When to use ZONE vs. REGION Survival Goals](https://www.cockroachlabs.com/docs/stable/when-to-use-zone-vs-region-survival-goals.html)

### Troubleshooting

A _troubleshooting_ guide describes how to resolve errors. It typically has a series of observed, undesired behavior and recommendations on how to mitigate the behavior.

A troubleshooting guide helps users quickly recognize the source of an error condition and take steps to mitigate the error.

- Title: **Troubleshoot <XXX>**
- Filename: `xxx-troubleshooting.md`

#### Examples

- [Error Handling and Troubleshooting](https://www.cockroachlabs.com/docs/stable/error-handling-and-troubleshooting.html)
- [Troubleshoot SQL Behavior](https://www.cockroachlabs.com/docs/stable/query-behavior-troubleshooting.html)

### FAQ

A _FAQ_ is a list of frequently asked questions and answers to the questions.

A FAQ helps users quickly find answers to questions that recur.

- Title: **<XXX> FAQs**
- Filename: `<title>-faqs.md`.

#### Examples

- [Operational FAQs](https://www.cockroachlabs.com/docs/stable/operational-faqs.html)
- [CockroachDB Cloud FAQs](https://www.cockroachlabs.com/docs/cockroachcloud/frequently-asked-questions.html)

### Release note

A _release note_ is a description of features and bug fixes related to a specific release of CockroachDB.

A release note helps users understand what they gain from upgrading to the version of CockroachDB.

#### Examples

- [CockroachDB Cloud Release Notes](https://www.cockroachlabs.com/docs/releases/cloud.html)
- [What's New in v21.2.5](https://www.cockroachlabs.com/docs/releases/v21.2.5.html)

## Components

### Page title

Set the page title in the `title:` metadata. The title should be in title case. Heading 1 (`#`) is reserved for page titles and **should not** be used in pages.

### Headings

Use headings to demarcate content into a hierarchy to help readers find information. When the page is rendered, the first two heading levels appear in the page TOC at the right of the page.

A heading is denoted by one or more number signs (`#`) followed by one space: Heading 2 (`##`), Heading 3 (`###`) and Heading 4 (`####`). Use Heading 4 sparingly. Denote anything under Heading 4 by bolded text.

Headings should be sentence case.

Enter a line break between a heading and its content.

#### Examples

- `## Heading 2`
- `### Heading 3`
- `## Step 2. A step in a tutorial`

### Text format

#### Bold

Use bold text to emphasize an important word or phrase, when referring to the name of a UI section or field, or to create visual separation and callouts (e.g., **Example:**). Do not combine bold with italic.

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

Use italics to identify the term in a concept definition. Otherwise, do not use italicized text in CockroachDB docs. If it seems beneficial to emphasize a word or phrase, use [bold](#bold).

#### Underline

Do not use underlined text in CockroachDB docs. If it seems beneficial to emphasize a word or phrase, use [bold](#bold).

### Links

Whenever a CockroachDB feature is referenced, provide a link to the relevant documentation. You can also provide links to external resources, but only if the resource is confirmed to be accurate by a technical reviewer or the author is a Cockroach Labs SME and no CockroachDB documentation covers the topic.

Use Markdown reference-style links when several parts of the same page refer to the same target URL (e.g., [Release Notes](https://raw.githubusercontent.com/cockroachdb/docs/master/releases/v2.1.0-alpha.20180507.md)).

Link capitalization can be either title or sentence case:

- **Use title case** when referring to the linked doc by name (e.g., "See __Best Practices__ for more information").
- **Use sentence case** - when linking in the middle of a sentence (e.g., "[…] follow the __identifier rules__ when creating […]").

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

Use a tip to highlight nice-to-know pieces of information.

For example, you might include a tip to our GitHub repo's Terraform scripts on the Google Cloud Engine deployment page. It's nice to know it's there, but doesn't clarify anything nor is it critical.

To insert a tip, use the following code:

~~~
{{site.data.alerts.callout_success}}
<tip text goes here>
{{site.data.alerts.end}}
~~~

Each Liquid tag should be on its own line. You can use Markdown within the highlighted text.

#### Notes

Use a note to call attention to a piece of clarifying information; this information should not be crucial to accomplishing the task in the document.

For example, you might use a note to let users know that the `DELETE` statement only deletes rows and that to delete columns you must use `ALTER TABLE`. This helps clarify `DELETE`‘s purpose and point users to the right place.

To insert a note, use the following code:

~~~
{{site.data.alerts.callout_info}}
<note text goes here>
{{site.data.alerts.end}}
~~~

Each Liquid tag should be on its own line. You can use Markdown within the highlighted text.

#### Warnings

Use a warning to express that a piece of information is critical to understand to prevent unexpected things from happening.

For example, you might include a warning that using `CASCADE` in `DROP INDEX` drops dependent objects without warning. This is critical to prevent users from unexpectedly losing constraints or additional indexes.

To insert a warning, use the following code:

~~~
{{site.data.alerts.callout_danger}}
<warning text goes here>
{{site.data.alerts.end}}
~~~

There is also a custom purple callout that uses the code `{{site.data.alerts.callout_version}}`. It is used at the top of the CockroachDB Cloud Release Notes to call attention to the latest CockroachDB version that Cloud clusters are running. It should not be used anywhere else.

Each Liquid tag should be on its own line. You can use Markdown within the highlighted text.

### Product names

All product names except CockroachDB should be written as Liquid variables unless part of front-matter, file names, or non-Markdown files. Use the following code in place of product names:

- **CockroachDB Serverless (beta)** : `{{ site.data.products.serverless }}`
- **CockroachDB Serverless** : `{{ site.data.products.serverless-plan }}`
- **CockroachDB Dedicated** : `{{ site.data.products.dedicated }}`
- **CockroachDB Self-Hosted** : `{{ site.data.products.core }}`
- **Enterprise** : `{{ site.data.products.enterprise }}`
- **CockroachDB Cloud** : `{{ site.data.products.db }}`

### Code

You can mark up code [inline](#inline-code) or as a [code block](#code-blocks).

#### Inline code

Use inline code when referring to code, commands, or other technical syntax within a sentence. Inline `code` has `backticks (``) around` it.

Example: The `CREATE TABLE` statement creates a new table in a database.

#### Code block

Use a code block to provide executable code samples. A code block has an opening and closing set of 3 tildes (`~~~`). A code block supports syntax highlighting if you add the language name immediately after the first line of backticks. There should be one returned line before and after a code block, for better Markdown readability. For example:

```
This is a sample line of text.

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

This is more sample text.
```

Highlight shell and SQL commands where appropriate using the following info:

**Shell code samples**

Start shell code samples with `~~~ shell` followed by a line break. The first character of the next line must be the terminal marker `$`. For multi-line shell commands, use a backslash (`\`) at the end of each line to indicate a line break.

**SQL code samples**

SQL code samples are broken into two sections: commands and responses.

- **Commands** (e.g., `SELECT`, `CREATE TABLE`) should begin with `~~~ sql` followed by a line break. The first character of the next line must be the terminal marker `>`. Commands should be properly capitalized, and there should be only one command per code sample.

- **Responses** (e.g., retrieved tables) should begin with `~~~` but should **not** be syntax highlighted.

  Note that not all responses warrant inclusion. For example, if a SQL code sample shows `CREATE TABLE`, `INSERT`, and then `SELECT`, it's unnecessary to show the responses for `CREATE TABLE` (which is just `CREATE TABLE`) and `INSERT` (which is just `INSERT <number of rows>`).

**Copy to Clipboard Button**

Many of our code blocks are written so users can copy and paste them directly into a terminal. To make that easier, add the **Copy to Clipboard** button by placing `{% include_cached copy-clipboard.html %}` on the line directly preceding the code block, for example:

```
{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~
```

**Copy to Clipboard** should be used for every code block that can be **executed**.

### Examples

Examples help show the feature in action. Examples follow a basic format:

1. The **Title** should start with a verb and should describe the task the example is outlining. It should use title case.

    **Example:** Create a Table that Mirrors Key-Value Storage

2. **Introductory information** should be provided if some context is needed to orient the user and can also be used to introduce code blocks. This should be written in a conversational tone.

    **Example:** "CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:"

- **[Code blocks](#code-blocks)** provide executable code samples.

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

#### Examples

- [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)

### Tables

Use tables to display structured information in an easy-to-read format. We use two types of tables: [Markdown](#markdown) and [HTML](#html).

#### Markdown

If you can keep the table formatting simple (e.g., basic text formatting and using `<br>` tags for paragraph breaks), create a table using Markdown. This is the preferred table format.

To create a table, use pipes (`|`) between columns and at least 3 dashes (`-`) separating the header cells from the body cells. A return denotes the start of the next row. The text within each column does not need to align in order to be rendered correctly, and you can inline Markdown or HTML.

Do not use outer pipes.

Example:

~~~
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

If the formatting becomes too complex, create an [HTML table](#html).

The following formatting is not supported within a Markdown table:

- [Liquid tags](https://shopify.github.io/Liquid/)
- [Code blocks](#code-blocks)

#### HTML

If it's necessary to include more complex table formatting or if a [Markdown table](#markdown) becomes too unwieldy, create a table using HTML. This formatting is not recommended unless necessary, since it is hard for other writers to parse and maintain.

You can use the following HTML formatting  within an HTML table:

- Bold (`<strong>`)
- Italics (`<em>`)
- Inline code (`<code>`)
- Links (`<a href`)
- Paragraph breaks (`<p>`)
- Lists (`<ol>` / `<ul>` / `<li>`)

**Example:** [Query Options](admin-ui-custom-chart-debug-page.html#query-options) table (see [GitHub](https://raw.githubusercontent.com/cockroachdb/docs/master/_includes/v2.1/admin-ui-custom-chart-debug-page-00.html) for the raw HTML)

### Lists

CockroachDB docs use two types of lists:

- **Numbered** (i.e., ordered list) - Use to list information that should appear in order, like tutorial steps.

    **Example:** [Start CockroachDB](https://www.cockroachlabs.com/docs/stable/deploy-a-test-cluster.html#step-1-start-cockroachdb) in the Deploy a Test Cluster doc

- **Bulleted** (i.e., unordered list) - Use to list related information in an easy-to-read way.

    **Example:** [Start the First Node](https://www.cockroachlabs.com/docs/stable/start-a-local-cluster.html#step-1-start-the-first-node) in the Start a Local Cluster doc

Introduce a list with a sentence and a colon. Use periods at the end of list items if they are sentences or complete a sentence.

For each item of a **numbered list**, use `1.` followed by a period and a space, e.g., `1. This is a numbered list item`. The HTML renderer will render the steps in the correct order.

For each item of a **bulleted list**, use one dash followed by one space, e.g., `- This is a bulleted list item`.

#### Nest lists

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

#### Nest paragraphs or code blocks

To nest a paragraph or code block under a list item, insert an empty line and then indent the paragraph or code block 4 spaces, for example:

```
1. This is a step.

    This is a nested paragraph.

    ~~~ shell
    $ command
    ~~~
```

Similarly, to nest a paragraph or code block under a **nested** list item, insert an empty line and then indent the paragraph or code block 8 spaces, for example:

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

  **Note**: Screenshots are difficult to keep current, and impact the accessibility of our documentation. Use a screenshot if it is necessary for the user to accomplish a task or understand a feature. For example, a screenshot of a Contention metric graph in the DB Console could be necessary if it is used as an example of a cluster with high contention in a how-to on troubleshooting performance. It is not necessary in a reference topic about the DB Console user interface. If you add a screenshot to a topic, make sure the topic describes what is being shown in the screenshot for SEO and accessibility.

- **Diagrams** - Provide a visual of a complicated theory. Diagrams should be simple and easy to read.

Use the following HTML and Liquid to include an image in a Markdown page:

~~~ html
<img src="{{ 'images/v2.1/image-name.png' | relative_url }}" alt="Alternative Text Here" style="border:1px solid #eee;max-width:100%" />
~~~

Example: [Decommission Nodes](https://www.cockroachlabs.com/docs/stable/remove-nodes.html#step-1-check-the-node-before-decommissioning)

## Terminology and word usage

Term | Classification | Note
--- |:---:| ---
Postgres | 🔴 | This is a nickname for PostgreSQL. Use PostgreSQL instead: it's the official name, our docs site and Google treat these as synonyms, and Cmd+F on `Postgres` will still find `PostgreSQL`.
PostgreSQL | 🟢 | Preferred over Postgres.
