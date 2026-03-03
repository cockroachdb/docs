# Style Guide

The following guidance is provided to benefit CockroachDB docs authors and reviewers by reflecting past style decisions, and to benefit readers by promoting consistency and readability across our content.

Included in this guide:

- [Style and tone](#style-and-tone)
  - [Perspective and voice](#perspective-and-voice)
  - [Prescriptive writing](#prescriptive-writing)
  - [Speculation and feature support](#speculation-and-feature-support)
  - [Latinisms](#latinisms)
- [Word usage guidelines](#word-usage-guidelines)
  - [CockroachDB products](#cockroachdb-products)
  - [CockroachDB versions](#cockroachdb-versions)
  - [Third-party products](#third-party-products)
- [Inclusivity](#inclusivity)
  - [Avoid ableist language](#avoid-ableist-language)
  - [Avoid unnecessarily gendered language](#avoid-unnecessarily-gendered-language)
  - [Write diverse and inclusive examples](#write-diverse-and-inclusive-examples)
  - [Avoid unnecessarily violent language](#avoid-unnecessarily-violent-language)
  - [Write accessible documentation](#write-accessible-documentation)
  - [Write about features and users in inclusive ways](#write-about-features-and-users-in-inclusive-ways)
- [Capitalization and punctuation](#capitalization-and-punctuation)
  - [Capitalization rules](#capitalization-rules)
  - [Punctuation rules](#punctuation-rules)
- [Vale](#vale)
- [File conventions](#file-conventions)
- [Content types](#content-types)
  - [Concept](#concept)
  - [Task](#task)
  - [Reference](#reference)
  - [Guide](#guide)
- [Page components](#page-components)
  - [Code](#code)
  - [Callouts](#callouts)
  - [Images](#images)
  - [Videos](#videos)
  - [Include files](#include-files)
  - [Links](#links)
    - [GitHub links](#github-links)
    - [External links](#external-links)
- [Page sections](#page-sections)
  - [Before you begin](#before-you-begin)
  - [Known limitations](#known-limitations)
  - [See also](#see-also)

For Markdown-specific syntax and formatting guidelines, refer to the [Markdown Guide](MarkdownGuide.md).

## Style and tone

CockroachDB docs should be helpful, humble, positive, friendly, and free from hyperbolic language.

### Perspective and voice

For instructions, use the imperative present tense, aka "[imperative mood](https://www.grammar-monster.com/glossary/imperative_mood.htm)." The second-person subject ("you") is implied and can be omitted.

**Examples:**

- Run `cockroach start`.
- Click **Next**.

In tutorials, where a conversational tone is sometimes helpful, use the second person ("you").

**Examples:**

- In this tutorial, you'll start with a new cluster, so stop and clean up any existing clusters.
- After you create the database, insert some rows.

In page titles and headings, use the imperative mood to name a task. Do not use the gerund form or a noun phrase.

- **Avoid:** Managing Users  
  **Avoid:** User Management  
  **Prefer:** Manage Users

Do not use "we" to refer to "CockroachDB" or "Cockroach Labs".

- **Avoid:** We support changefeeds.  
  **Prefer:** CockroachDB supports changefeeds.

- **Avoid:** We recommend ...  
  **Prefer:** Cockroach Labs recommends ...

### Prescriptive writing

Write in a prescriptive style that clearly guides the user. The user should feel confident and supported, without having to infer meaning or make too many decisions on their own.

Use active instead of passive voice.

- **Avoid:** Each parameter should be set explicitly.  
  **Prefer:** Set each parameter explicitly.

- **Avoid:** Additional options can be specified.  
  **Prefer:** You can specify additional options.

Use concise, direct language. Cut unnecessary words unless a conversational tone is intentional (for example, in tutorials). If a feature or concept is difficult to describe clearly or concisely, consider using an [example](#examples) or [image](#images) to complement the text.

- **Avoid:** Be mindful of the possibility that you might encounter a different result, depending on the specifics of your configuration, so you might want to do some testing first to see what happens.  
  **Prefer:** Run tests to verify that you get the expected result for your configuration.

- **Avoid:** `table_name`: This parameter is used to specify the name of the table you want to modify.  
  **Prefer:** `table_name`: The name of the table to modify.

Provide guidance rather than leave decisions to the user. For example, phrases like "change what you need" or "modify the relevant settings" may raise questions like "What would I need to change?" and "Which settings are relevant?". When user discretion is required, be as explicit as possible to reduce ambiguity and cognitive load.

- **Avoid:** Increase the threshold as needed.  
  **Prefer:** Increase the threshold until you see a performance improvement.

- **Avoid:** Define additional settings as desired.  
  **Prefer:** Depending on your configuration, you may need to define additional settings. For example, ...

- **Avoid:** Edit the profile using your preferred text editor.  
  **Prefer:** Edit the profile in a text editor.

Avoid vague time estimates. Provide a specific timeframe when possible.

- **Avoid:** You should set the grace period to at least a few minutes.  
  **Prefer:** Set the grace period to at least 5 minutes.

- **Avoid:** This should take a few moments. When finished, click **Next**.  
  **Prefer:** When finished, click **Next**.

Do not use contractions when giving a technical description or instruction.

- **Example:** You cannot change primary key using `ALTER TABLE`.
- **Example:** If you leave versioned binaries on your servers, you do not need to do anything.

Do not use "please" when giving an instruction, except when asking the user to go outside the scope of the task (for example, contacting Cockroach Labs or filing a support issue).

- **Example:** If you need assistance, please contact [support](https://support.cockroachlabs.com/).

- **Avoid:** Please click on the **Next** button.  
  **Prefer:** Click **Next**.

Do not use language that could be read as presumptuous or condescending.

- **Avoid:** If you aren't willing to do this for some reason, ...  
  **Prefer:** If this is not possible, ...

- **Avoid:** Monitoring the cluster is simple.  
  **Prefer:** Monitor the cluster with the following tools:

### Speculation and feature support

Avoid forward-looking language when writing about supported syntax and behavior. Do not suggest that a feature may or may not be added in a future release. Avoid words like "yet" and "currently", and do not reference the internal product roadmap.

- **Avoid:** CockroachDB does not yet support column-level privileges. This is planned for a future release.  
  **Prefer:** CockroachDB does not support column-level privileges.

### Latinisms

For readability, avoid Latinisms.

- **Avoid:** Select a deployment option, e.g., {{ site.data.products.standard }} or {{ site.data.products.advanced }}.  
  **Prefer:** Select a deployment option such as {{ site.data.products.standard }} or {{ site.data.products.advanced }}.

## Word usage guidelines

This section logs decisions about dictionary words to use and avoid. Add specific guidelines we decide as a team to this section. Refer also to [Technical terminology](#technical-terminology) for technical terms that may not be in a dictionary.

### CockroachDB products

- Use the following combinations of `CockroachDB` and Liquid variables to display product names on docs pages. Liquid variables cannot be used in Markdown front-matter, file names, or non-Markdown files. In those cases, write the product names manually.

  - **CockroachDB Cloud** : `CockroachDB {{ site.data.products.cloud }}`
  - **CockroachDB Basic** : `CockroachDB {{ site.data.products.basic }}`
  - **CockroachDB Standard** : `CockroachDB {{ site.data.products.standard }}`
  - **CockroachDB Advanced** : `CockroachDB {{ site.data.products.advanced }}`
  - **CockroachDB self-hosted cluster** : `CockroachDB {{ site.data.products.core }} cluster`

- Use the full product name on its first occurrence on a page. You may subsequently shorten product names to "Basic", "Advanced", or "Cloud", unless this would introduce ambiguity (for example, on long pages where product names might be separated by multiple paragraphs).

- Do not shorten "CockroachDB" to "CRDB".

- Use "`cockroach`" to refer to the CockroachDB binary.

  - **Avoid:** Cockroach process  
    **Prefer:** `cockroach` process

### CockroachDB versions

Refer to CockroachDB versions as `vxx.x.x` (for example, `v21.1.8`). Do not use `version xx.x.x`.

For version ranges, use `to` between numbers (for example, `v22.1.0 to v22.1.4`). Do not use a dash. Refer to [Punctuation rules](#punctuation-rules).

Refer to "earlier" and "later" versions, rather than "lower" and "higher" versions. For example, `CockroachDB v25.3 and earlier`.

### Third-party products

In general, align third-party branding with that brand's usage. Do not use the shortened versions of product names.

|  Avoid   |   Prefer   |
|----------|------------|
| Postgres | PostgreSQL |
| K8s      | Kubernetes |

### "Directory" vs. "folder"

- Use "directory" to refer to a filesystem directory, either locally or in a VM. For example, `Compress the directory into a .zip archive.`
- Use "folder" to refer to a folder within a UI, such as a web UI or an IDE. For example, `Create a folder in your CockroachDB Cloud organization.`

### "Legacy" vs. "deprecated"

- Use "legacy" only for our own earlier products, features, or workflows to signal that a newer option is preferred. Avoid using "legacy" as a pejorative; if no preference is intended, say "earlier" or "previous". Do not use "legacy" to refer to competitors' products.
- Prefer "deprecated" when there is an approved plan for end of support and removal. If deprecation is not approved but guidance is needed, you may call the previous option "legacy".

### "In" vs. "on" a cluster

Use "in a cluster" when referring to elements that form the cluster itself.

**Examples:**

- Nodes in the cluster
- Ranges in the cluster

Use **on a cluster** when referring to workloads, services, or databases that run on the cluster's infrastructure.

**Examples:**

- Databases on the cluster
- Jobs running on the cluster

## Inclusivity

Use inclusive language that reflects a diverse readership. Avoid terms that inherently exclude, stereotype, or cause confusion.

### Avoid ableist language

An informal tone can allow for problematic ableist language due to figures of speech and colloquial language. Ableist language includes words like "crazy", "insane", "blind", "dummy", "cripple", and more.

**Examples:**

- Replace _dummy_ with **placeholder, sample**.
- Replace _sanity-check_ with **final check, confirm**.

### Avoid unnecessarily gendered language

Be aware of personal pronouns in examples and outdated gendered terms.

**Best practices:**

- Avoid personal pronouns (i.e., use proper nouns, "the user", etc.).
- If a personal pronoun is needed for clarity or conciseness, default to gender-neutral pronouns (they/them).

**Examples:**

- Replace _man hours_ with one of: **work hours**, **staff hours**, **person hours**.
- Replace _manning_ with **staffing**.
- Replace _man-in-the-middle attack_ with **machine-in-the-middle attack**.

### Write diverse and inclusive examples

Avoid examples that are U.S.-specific or centric.

**Best practices:**

- Avoid U.S.-specific holidays, sports, figures of speech, etc.
- Use a diverse set of names in examples.

### Avoid unnecessarily violent language

Avoid terms that imply violence or harm.

**Examples:**

- Replace "_kill_" with **terminate**.
- Replace "_hit_ Enter" with **press Enter**.
- Replace "_hit_ your resource limits" with **reach your resource limits**
- Replace "_hit_ an error" with **experience an error**.
- Replace "performance _hit_" with **reduced performance**.
- Replace "want to _hit_ up" with **want to visit**.

Terminology around "kill" vs. "stop" vs. "terminate" is nuanced, as described [in this GitHub comment](https://github.com/cockroachdb/docs/issues/7767#issuecomment-662028864). Use your best judgement.

### Write accessible documentation

- Don't use directional terms as the only clue to location within a page. "Left", "right", "up", "down", "above", and "below" aren't useful for people who use screen-reading software. Good replacements are "preceding" and "following". If you must use a directional term, provide additional text about the location, such as in the Save As dialog box, on the Standard toolbar, or in the title bar.
- Replace "_see_" with **refer to**.
- Provide [alt text](https://en.wikipedia.org/wiki/Alt_attribute) that adequately summarizes the intent of each [image](#images).
- Link text should be the same as or summarize the title of the link target. Avoid **here** and **this documentation**.

### Write about features and users in inclusive ways

Avoid using socially-charged terms for features and technical concepts.

**Examples:**

- Replace _blacklist / whitelist_ with **denylist / allowlist**.
- Replace _master / slave_ with **main/principal/primary/manager** and **secondary/subordinate/worker**.
- Replace _native_ with **core, built-in, top-level, integrated, "built for"** or omit.
- Replace _old_ with **existing, previous, first, original**.

## Capitalization and punctuation

### Capitalization rules

- Use [title case](https://apastyle.apa.org/style-grammar-guidelines/capitalization/title-case) for titles.
- Use [sentence case](https://apastyle.apa.org/style-grammar-guidelines/capitalization/sentence-case) for all [headings](#headings).
- Capitalize proper nouns, CockroachDB product terms, and the names of UI features.
    - **Examples:** CockroachDB, Cockroach Labs, the Overview dashboard, the SQL Queries graph
- Follow [SQL capitalization standards](https://dataschool.com/how-to-teach-people-sql/syntax-conventions/#all-caps-sql-commands) for SQL syntax.

For links to CockroachDB docs, match the capitalization of the linked content:

- Use title case when referring to the linked doc by its page title (for example, `Refer to [Migration Strategy](https://www.cockroachlabs.com/docs/molt/migration-strategy) for more information.`).
- Use sentence case when referring to the linked doc by one of its headers (for example, `Refer to [Capacity planning](https://www.cockroachlabs.com/docs/molt/migration-strategy#capacity-planning) for further guidance.`).

### Punctuation rules

- Use the [Oxford (aka serial) comma](https://en.wikipedia.org/wiki/Serial_comma).
- Use straight `'` rather than curved `‘` quotes.
- Limit semicolon usage. Instead, use two simple sentences.
    - **Avoid:** CockroachDB is a distributed database; it scales horizontally across multiple nodes.  
      **Prefer:** CockroachDB is a distributed database. It scales horizontally across multiple nodes.
- Do not end headings with punctuation (for example, periods or colons).
- Use periods on either all [list items](MarkdownGuide.md#lists) or none. If some items are sentences or complete a sentence, use periods.
- Use colons instead of dashes.
    - **Avoid:** **Default** - true  
      **Prefer:** **Default:** true
- When listing a range of versions, do not use a dash. Instead, separate the first and last versions with `to` (for example, `v22.1.0 to v22.1.4`).
- For singular proper nouns ending in **s**, form the possessive with **'s**.
    - **Example:** Postgres's syntax
- For plural words or names ending in **s**, form the possessive with just an apostrophe.
    - **Example:** Cockroach Labs' products
- Place commas and periods inside quotation marks (for example, `CockroachDB's availability model is described as "Multi-Active Availability."`). Place other punctuation outside quotation marks (for example, `What is "Multi-Active Availability"?`). When any type of punctuation is part of a quote, place it inside the quotation marks (for example, `To phrase it in the form of a question: "Who are the top 10 users by number of rides on a given date?"`).
- Avoid using slashes "/" and ampersands "&" in place of "or" and "and" respectively, unless space is very limited (such as in a table). Similarly, avoid using "and/or" unless space is very limited. Instead, decide whether "and" or "or" can stand alone, or make use of "both" when the inclusivity must be explicit (for example, `x or y or both`).

## Vale

The CockroachDB documentation uses [Vale](https://vale.sh/) to identify common spelling mistakes or other patterns that may contradict the guidelines in this style guide. Check for items flagged by Vale in the **Files Changed** and **Checks** tabs of the pull request, grouped by file.

Try to address as many of the suggestions as possible. If Vale flags a word that is spelled and used correctly, add the word to `netlify/vale/vocab.txt` in the PR where the word is introduced. For other failed tests, you can work with your reviewer to correct the error in your PR or to improve the Vale test.

## File conventions

File names in the CockroachDB docs repo should be lowercase with a dash between words. File names for docs pages should match the page title whenever possible.

**Examples:**

- `this-is-a-doc.md`
- `name-of-your-image.png`

## Content types

There are four fundamental content types:

- [Concept](#concept)
- [Task](#task)
- [Reference](#reference)
- [Guide](#guide)

### Concept

A _concept_ topic explains how a particular feature works, or how a specific system is designed. Conceptual pages do not provide prescriptive guidance or instruction. For guidance or instruction, refer to [Task](#task) or [Guide](#guide).

- The first sentence answers the implicit question "what is a \<singular noun\>?" in the form **A _\<singular noun\>_ is ….**.

  **Example:** An _index_ is a data structure that improves the speed of data retrieval operations on a database table at the cost of additional writes and storage space to maintain the index data structure.

- Provide as much relevant information as you can, and then link to other pages as necessary. If there is a related [reference](#reference) topic, link to it from within the conceptual topic.

For templates that provide a starting point for writing concept topics, refer to the [concept templates](https://github.com/cockroachdb/docs/tree/main/templates/concept).

#### Examples

- [Indexes](https://www.cockroachlabs.com/docs/stable/indexes.html)
- [Architecture Overview](https://www.cockroachlabs.com/docs/stable/architecture/overview.html)
- [SQL Layer](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html)

### Task

A _task_ topic provides step-by-step instructions to complete a specific goal. Tasks are discrete and action-based. Tasks have the following properties:

- Answers the question "how do I do \<an action\>?" by describing precisely what to do and the order in which to do it.
- Corresponds to a specific user journey as defined by Product.
- The title or heading should state an actionable goal for the user, ideally of the form **\<Imperative verb\> [\<article\>|\<conjunction\>] \<noun\> or \<proper noun\>**.

  **Example:** Create an Index

- The verb ideally should be specific. Avoid generic verbs such as **Use**, **Manage** unless naming a page containing specific tasks.
- Avoid **Your** because you may be using an object that you don't "own".

  **Example:** Connect to a Cluster, not Connect to Your Cluster

- Lead with the verb. Don't bury it at the end of the heading.

  **Example:** Access DB Console, not DB Console Access.

- Present the steps as a list of numbered headings, e.g., "Step 1. ...".

Tasks should **not** include concept or reference information; instead, a task should link to [Concept](#concept) and [Reference](#reference) topics as needed.

For templates that provide a starting point for writing task topics, refer to the [task templates](https://github.com/cockroachdb/docs/tree/main/templates/task).

#### Examples

- [Create a CockroachCloud Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster.html)
- [Upgrade to CockroachDB vXY.Z](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version.html)
- [Stream a Changefeed to Snowflake](https://www.cockroachlabs.com/docs/cockroachcloud/stream-changefeed-to-snowflake-aws)

### Reference

_Reference_ topics provide information about a specific CockroachDB function, feature, or interface. Reference topics are detail-oriented, and should include all of the information available on a specific topic, without providing prescriptive guidance. Prescriptive guidance is reserved for [Guide](#guide) topics.

Reference topics typically document programming constructs, interface parameters, or facts about a product, but do not provide explanations of [concepts](#concept) or [tasks](#task).

Reference topics help users understand the precise meaning and effect of CockroachDB SQL language constructs, platforms, configuration options, API parameter values, etc.

- The content should be comprehensive and accurate. This principle might apply to other page types, but it is especially important for reference, as it is the ultimate source of truth for a particular feature or interface.
- The content should be succinct. Details are often presented in table format. Prose is better suited for [Concept](#concept) topics.

For templates that provide a starting point for writing reference topics, refer to the [reference templates](https://github.com/cockroachdb/docs/tree/main/templates/reference).

#### Examples

- SQL reference: [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)
- CLI reference: [`cockroach sql`](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html)
- API reference: [Cluster API](https://www.cockroachlabs.com/docs/api/cluster/v2)

### Guide

_Guides_ offer the reader a perspective on how to decide between a number of different ways of accomplishing a goal. They are meant to provide "guidance" (it's in the name) and should eventually lead the user to perform one or more [Tasks](#task).

To accomplish this goal, guides often link to several different [Concept](#concept) topics and compare and contrast them. They can also link to multiple [Task](#task) topics.

For templates that provide a starting point for writing guide topics, refer to the [guide templates](https://github.com/cockroachdb/docs/tree/main/templates/guide).

#### Examples

- [Migration Strategy](https://www.cockroachlabs.com/docs/molt/migration-strategy)
- [Disaster Recovery Overview](https://www.cockroachlabs.com/docs/stable/disaster-recovery-overview)
- [Multi-region Survival Goals](https://www.cockroachlabs.com/docs/stable/multiregion-survival-goals)

## Page components

This section describes how to approach page elements other than body text. For Markdown syntax and formatting, refer to the [Markdown Guide](MarkdownGuide.md).

### Code

#### Code blocks

Use separate code blocks for input and output. For example, rather than place both a SQL command and its resulting output within a single code block, place the SQL command inside one code block, followed by its output in another code block.

When you use multiple code blocks to demonstrate a task, interleave the code blocks with text that explains the content of each code block and clarifies where it stands in the overall flow.

**Example:**

```
1. To view all virtual clusters on the standby, run:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SHOW VIRTUAL CLUSTERS;
    ~~~

    The standby cluster will show the `main` virtual cluster is in a `replicating` state.

    ~~~
      id |  name  | data_state  | service_mode
    -----+--------+-------------+---------------
       1 | system | ready       | shared
       3 | main   | replicating | none
    (2 rows)
    ~~~
```

#### Placeholders

Code samples often include placeholder values, to be replaced by values specific to a user's environment. To denote that a value in a code sample is a placeholder value that should be replaced, use curly brackets (`{}`).

- **Example:** `SELECT * FROM TABLE {mytable};`.

When you use placeholders, you usually need to define the value within the brackets, if the placeholder value isn't clear. Define placeholder values immediately following the code sample:

- For a single placeholder value, use a follow-up sentence.
- For multiple placeholder values, use a bulleted list.
- For many placeholder values (10+), use a table.
- For large code blocks, define the placeholder values inside the code block with an inline code comment.

Ensure that placeholders are placed within backticks: `SET {session variable}`. This signifies that placeholder values are code.

If the code sample is sensitive to curly bracket characters (as in JavaScript), you can use `<>` instead.

For code block syntax and formatting, refer to the [Markdown Guide](MarkdownGuide.md#code).

### Callouts

CockroachDB docs use three classes of "callouts," which are highlighted blocks of text: tips, notes, and warnings.

- Use a _tip_ to highlight nice-to-know pieces of information.

  For example, you might use a tip to link to our GitHub repo's Terraform scripts on the Google Cloud Engine deployment page. It's nice to know it's there, but doesn't clarify anything nor is it critical.

- Use a _note_ to call attention to a piece of clarifying information. This information should **not** be crucial to accomplishing the task in the document.

  For example, you might use a note to let users know that the `DELETE` statement only deletes rows and that to delete columns you must use `ALTER TABLE`. This helps clarify `DELETE`'s purpose and point users to the right place.

- Use a _warning_ to express that a piece of information is critical to understand to prevent data loss, security vulnerabilities, or unexpected behavior.

  For example, you might include a warning that using `CASCADE` in `DROP INDEX` drops dependent objects without warning. This is critical to prevent users from unexpectedly losing constraints or additional indexes.

**Best practices:**

- Avoid placing callouts next to each other.
- Do not overuse callouts. Most documentation belongs in the body of a page rather than in a callout.

For code block syntax and formatting, refer to the [Markdown Guide](MarkdownGuide.md#callouts).

### Images

Use images to clarify a topic, but only use them as needed. Images are either:

- **Screenshots:** Depict a UI element. Screenshots should only show enough of the UI that the user can easily orient themselves and understand what they are being shown. Exclude UI elements that are not relevant to the screenshot's purpose. If a screenshot needs an annotation, use a red box.

  **Note:** Screenshots are difficult to keep current, and impact accessibility. Use a screenshot only if it is necessary for the user to accomplish a task or understand a feature. For example, in a page on troubleshooting cluster performance, a screenshot of a Contention metric graph in the DB Console might be used to depict a cluster with high contention. The same screenshot would not be necessary in a reference topic about the DB Console user interface. 

  To optimize accessibility and SEO, a screenshot should be accompanied by text and [alt-text](#write-accessible-documentation) describing its contents.

- **Diagrams:** Visualize a complicated mechanism. Diagrams should not reproduce such complexity, and can simplify a process. A diagram should be easy to follow.

  The Docs team uses the following tools to compose diagrams:

  - [Monodraw](https://monodraw.helftone.com/): useful for abstract concept diagrams
  - [Omnigraffle](https://www.omnigroup.com/omnigraffle): useful for diagrams with branded elements like logos and colors

  Icons for diagrams can be sourced from the [`cockroach-studios`](https://github.com/cockroachlabs/cockroach-studios/tree/main/icons) repo. The `.gstencil` file in the `icons` directory is an Omnigraffle template listing our branded primary/secondary/extended color palette.

For image syntax and embedding, refer to the [Markdown Guide](MarkdownGuide.md#images).

### Videos

Like images, use videos to clarify a topic, but only use them as needed. Typically, videos should be hosted on the official [CockroachDB YouTube page](https://www.youtube.com/@cockroachdb) and are surfaced by our Marketing team.

Place videos under their own page heading. For video embedding syntax, refer to the [Markdown Guide](MarkdownGuide.md#videos).

### Include files

Sometimes content needs to be duplicated across **two or more pages** in the documentation. For example, there may be several pages that need the same cluster setup, but describe how to use different features. Or a [callout](#callout) needs to be added to several different pages.

In these situations, use an [_include file_](https://jekyllrb.com/docs/includes/). An include file is a separate Markdown file (stored in `_includes/some/shared-file.md`) whose content is shared across multiple pages.

**Note:** Using include files adds complexity to the docs site architecture and build process. Consider linking to an existing page or subheading rather than using an include file.

For include file syntax, refer to the [Markdown Guide](MarkdownGuide.md#include-files).

### Links

#### GitHub links

[Release notes](https://www.cockroachlabs.com/docs/releases/index.html), [technical advisories](https://www.cockroachlabs.com/docs/advisories/index.html), and [known limitations](https://www.cockroachlabs.com/docs/stable/known-limitations.html) contain links to individual GitHub issues and pull requests.

Reference issues and pull requests by their corresponding number, prepended with `#`.

**Example:** `[#1](https://github.com/cockroachdb/docs/pull/1)`

#### External links

When linking to third-party documentation, consider the purpose and maintenance implications. Link to third-party sources for integration workflows, official API references, and tool configurations that change frequently.

**Best practices:**

- Link to stable, official documentation pages when possible and ensure links point to the appropriate version of the external product.
- Avoid linking to blog posts or unofficial sources.
- Consider whether a brief explanation in our docs would be more reliable than an external link.

For link syntax, refer to the [Markdown Guide](MarkdownGuide.md#links).

## Page sections

For page headings, refer to the [Markdown Guide](MarkdownGuide.md#page-headings).

### Before you begin

A `Before you begin` section describes prerequisites for following the page content. These may be setup requirements or contextual information that's helpful to the task. Place this section immediately after the page introduction.

**Best practices:**

- Keep prerequisites specific and actionable.
- Link to relevant setup or configuration pages.
- Use a bulleted list for multiple prerequisites.
- Avoid generic statements like "Have CockroachDB installed" unless the page specifically requires a fresh installation.

### Known limitations

A `Known limitations` section describes unexpected database behaviors that differ from SQL standards, PostgreSQL behavior, or expected functionality. Document all known limitations on the [Known Limitations](https://www.cockroachlabs.com/docs/stable/known-limitations.html) page and on feature-specific pages under a dedicated "Known limitations" header.

Document limitations during GA release weeks or when discovered post-release. For detailed procedures, refer to the [documentation wiki](https://cockroachlabs.atlassian.net/wiki/spaces/ED/pages/3516825623/Document+known+limitations).

### See also

A `See also` section contains links to related pages.  This is always the last section in a page.
