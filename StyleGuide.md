CockroachDB docs follow these principles:

- **Commit to Excellence:** We commit to publishing documentation that serves our users and customers with a focus on excellence. We take pride in writing clear, concise, and correct docs, iterating constantly, and aiming to produce great work to help our users.
- **Communicate Openly and Honestly:** We produce our best documentation when we communicate openly and honestly with our users. Documenting features and limitations transparently enables users to effectively use Cockroach Labs products while instilling confidence in the docs as a trusted resource.
- **Respect:** We aim to write humble, positive, friendly, and above all else helpful documentation. We appreciate every user through inclusive, accessible, and non-hyperbolic language.
- **Establish balance:** We establish balance between complexity and accessibility for all users. We describe complex problems through accessible technical language and links to further information, without obfuscating meaning through unnecessarily complicated language. We also establish balance by always considering our style guidelines, but we can break these rules—or propose new rules—when it’s better for the user or promotes our other values.

The following guidance is provided to benefit authors and reviewers by reflecting past style decisions, and to benefit readers by promoting consistency and readability across our content.

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
- [Vale](#vale)
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
  - [Release note](#release-note)
- [Components](#components)
  - [Page title](#page-title)
  - [Headings](#headings)
  - [Text format](#text-format)
  - [Links](#links)
  - [Tips, notes, and warnings](#tips-notes-and-warnings)
  - [Known limitations](#known-limitations)
  - [Product names](#product-names)
  - [Code](#code)
  - [Examples](#examples)
  - [Version tags](#version-tags)
  - [Version references](#version-references)
  - [Tables](#tables)
  - [Lists](#lists)
  - [Images](#images)
  - [Include files](#include-files)
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

- Avoid using forward-looking language when writing about supported syntax and behavior:
    - Do not suggest that a feature may or may not be added in a future release.
    - Do not use the words "yet" and "currently" when writing about a feature that we do or do not support.
    - Do not reference the internal product roadmap.

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
- Ensure commas and periods are inside quotation marks, e.g., _CockroachDB's availability model is described as "Multi-Active Availability."_ Place other punctuation outside quotation marks, e.g., _What is "Multi-Active Availability"?_ . When any type of punctuation is part of a quote, place it inside the quotation marks, e.g., _To phrase it in the form of a question: "Who are the top 10 users by number of rides on a given date?"_.
- Avoid using slashes `/` and ampersands `&` as conjunctions in place of **or** and **and** respectively, unless space is very limited (e.g., in a table).
- Avoid using _and/or_ unless space is very limited (e.g., in a table). Instead, decide whether **and** or **or** can stand alone or make use of **both** when the inclusivity must be explicit, e.g., **x or y or both**.
- When listing a range of versions, do not use a dash. Instead, separate the first and last versions with `to` (for example, `v22.1.0 to v22.1.4`).

For more detail about how to format text, see [Components](#components).

## Vale

The CockroachDB documentation uses [Vale](https://vale.sh/) to identify common spelling mistakes or other patterns that may contradict the guidelines in this style guide. Check for items flagged by Vale in the **Files Changed** and **Checks** tabs of the pull request, grouped by file.

Try to address as many of the suggestions as possible. If Vale flags a word that is spelled and used correctly, add the word to `netlify/vale/vocab.txt` in the PR where the word is introduced. For other failed tests, you can work with your reviewer to correct the error in your PR or to improve the Vale test.

## File conventions

CockroachDB docs are mainly comprised of pages (`.md`) and images (`.png` or `.gif`). File names are lowercase with a dash between words, and should be brief but descriptive.

### Examples

- `this-is-a-doc.md`
- `name-of-your-image.png`

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v21.1 are in the `docs > v21.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/master/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are stored in a versioned directory under the `images` directory. For example, images for CockroachDB v21.1 are in the `docs > images > v21.1` directory. For more information, see [Images](#images).

### File naming

File names should match the page title. If you need to change a file name, it is necessary to do the following:

- Add the previous page URL with the new URL to `_redirects`.
- Replace all links to the previous file name with the new file name in the applicable docs versions.

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
- [What's New in v21.2.5](https://www.cockroachlabs.com/docs/releases/v21.2.html#v21-2-5)

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

Use bold text to emphasize an important word or phrase, or to create visual separation and callouts (e.g., **Example:**). Do not combine bold with italic.

Use bold text when you refer to the name of a UI section or field. The name should be in bold only if it appears verbatim in the UI. If a UI element, such as a table, is not labeled in the UI, do not bold when you reference the element in the documentation.
  
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

Use Markdown reference-style links when several parts of the same page refer to the same target URL (e.g., [Release Notes](releases/v22.1.html)).

Link capitalization should match our [capitalization rules](#capitalization-rules) for page titles and headers:

- **Use title case** when referring to the linked doc by its page title (e.g., "See __Best Practices__ for more information").
- **Use sentence case** when referring to the linked doc by one of its headers (e.g., "See __Clock synchronization__ for further guidance").
- **Use sentence case** - when referring to a linked doc without explicitly citing a page title or header (e.g., "[…] follow the __identifier rules__ when creating […]").

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

#### GitHub issues and pull requests

[Release notes](https://www.cockroachlabs.com/docs/releases/index.html) and [technical advisories](https://www.cockroachlabs.com/docs/advisories/index.html) contain links to individual GitHub issues and pull requests.

Reference issues and pull requests by their corresponding number, prepended with `#`.

**Example:** `[#1](https://github.com/cockroachdb/docs/pull/1)`

### Tips, notes, and warnings

Our docs use three classes of highlighted text (also referred to as callouts):

- [Tips](#tips)
- [Notes](#notes)
- [Warnings](#warnings)

The highlighting is generated using Liquid tags, each of which must be on its own line. You can use Markdown (preferred) or HTML within the highlighted text.

#### Tips

Use a tip to highlight nice-to-know pieces of information.

For example, you might include a tip to our GitHub repo's Terraform scripts on the Google Cloud Engine deployment page. It's nice to know it's there, but doesn't clarify anything nor is it critical.

To insert a tip, use the following code:

~~~
{{site.data.alerts.callout_success}}
<tip text goes here>
{{site.data.alerts.end}}
~~~

#### Notes

Use a note to call attention to a piece of clarifying information; this information should not be crucial to accomplishing the task in the document.

For example, you might use a note to let users know that the `DELETE` statement only deletes rows and that to delete columns you must use `ALTER TABLE`. This helps clarify `DELETE`‘s purpose and point users to the right place.

To insert a note, use the following code:

~~~
{{site.data.alerts.callout_info}}
<note text goes here>
{{site.data.alerts.end}}
~~~

#### Warnings

Use a warning to express that a piece of information is critical to understand to prevent data loss, security vulnerabilities, or unexpected behavior.

For example, you might include a warning that using `CASCADE` in `DROP INDEX` drops dependent objects without warning. This is critical to prevent users from unexpectedly losing constraints or additional indexes.

To insert a warning, use the following code:

~~~
{{site.data.alerts.callout_danger}}
<warning text goes here>
{{site.data.alerts.end}}
~~~

#### CockroachDB version callout

A custom callout at the top of the CockroachDB Cloud Release Notes displays the CockroachDB version that Cloud clusters are running.
It should not be used anywhere else.

~~~
{{site.data.alerts.callout_version}}
<CockroachDB version>
{{site.data.alerts.end}}
~~~

### Known limitations

#### What are known limitations?

Sometimes CockroachDB does not behave the way that users expect it to behave. These deviations from expected behavior can be in the form of:

- A difference in syntax between CockroachDB and [SQL Standard](https://blog.ansi.org/2018/10/sql-standard-iso-iec-9075-2016-ansi-x3-135)
- A difference in the behavior of CockroachDB and PostgreSQL
- A feature that is functional, but not yet fully implemented
- A feature that is fully implemented, but has some **long-standing** bugs (i.e., bugs that have existed across minor and/or major releases)
- A feature that limits performance

We list the general differences between CockroachDB and the SQL Standard on our [SQL Feature Support](https://www.cockroachlabs.com/docs/stable/sql-feature-support.html) page, and we provide more details on the differences between CockroachDB and PostgreSQL on our [PostgreSQL Compatibility](https://www.cockroachlabs.com/docs/stable/postgresql-compatibility.html). All other instances of known, but possibly unexpected, database behavior are known as **known limitations**.

Known limitations often have [associated GitHub issues in the `cockroach` repo](https://github.com/cockroachdb/cockroach/issues), meaning the limitation could be resolved one day. *Not all known limitations have GitHub issues, and not all known limitations will be resolved.*

The purpose of documenting known limitations is to help our users know more about using our product safely and effectively.

#### Where to find known limitations

Known limitations are generally listed in two places:

1. (More common) In the `cockroach` repo, as [open issues with the `docs-known-limitations` label, but *not* with the `docs-done` label](https://github.com/cockroachdb/cockroach/issues?q=is%3Aissue+label%3Adocs-known-limitation+-label%3Adocs-done+is%3Aopen). Usually, engineers and product managers add these labels to issues in the weeks leading up to the release.

1. (Less common) In the `docs` repo, as [open issues with the `T-known-limitation` label](https://github.com/cockroachdb/docs/issues?q=is%3Aopen+is%3Aissue+label%3AT-known-limitation).

If you come across some behavior that you believe qualifies as a known limitation, first open an issue in the `cockroach` repo, get some engineering/PM feedback on the issue, and then add a `docs-known-limitations` label to an issue.

#### When to document known limitations

Documenting known limitations should happen in the [weeks leading up to a GA release](https://cockroachlabs.atlassian.net/wiki/spaces/ED/pages/402718726/GA+Release+Checklist).

You might also need to document a known limitation that is discovered after the GA release. In this case, you will likely be notified by your product area PM and should coordinate with them to determine how best to document the limitation.

*Avoid documenting known limitations too early. Some "limitations" could be bugs that engineering finds the time to fix during the stability period leading up to a GA release.*

#### Who documents known limitations

In the past, the person assigned to known limitations is usually someone with extra bandwidth at the end of the GA release cycle. You might volunteer for this task, or your manager might assign it to you.

#### Where to document known limitations

Document all known limitations on the [Known Limitations](https://www.cockroachlabs.com/docs/stable/known-limitations.html) page.

If the limitation is related to a feature documented elsewhere on our docs site, you should also add the limitation to the page that documents that feature, under a dedicated "Known limitations" header. To avoid duplication, create an [include file](#include-files) in `_includes/vX.X/known-limitations` and include the file in both places.

#### How to document known limitations

Known limitations should generally follow this template:

~~~
<Level-3 header with a descriptive, concise title>

<Descriptive summary, with more details and possibly a workaround and/or an example>

<A link to the tracking issue on GitHub, if one exists>
~~~

For example:

~~~
### Feature doesn't do this thing

Feature doesn't do this thing because it doesn't do it. To get around this, do this other thing. For example, instead of `do this thing`, use `do this other thing`.

[Tracking GitHub Issue](https://github.com/cockroachdb/cockroach/issues/number)
~~~

For more examples, check out the [Known Limitations](https://www.cockroachlabs.com/docs/stable/known-limitations.html) page.

When the time comes to document known limitations, keep in mind that you are documenting known limitations for a specific release, just like you document any other feature. This means that you have to update all documented known limitations be relevant to the upcoming release

1. In the latest version's docset, move all existing known limitations from the ["New limitations"](https://www.cockroachlabs.com/docs/stable/known-limitations.html#new-limitations) header, and place them under the ["Unresolved limitations"](https://www.cockroachlabs.com/docs/stable/known-limitations.html#unresolved-limitations) header.

1. Verify that each of the limitations under "Unresolved limitations" is, in fact, still a limitation:

    1. Navigate to the linked GitHub tracking issue. If there is no GitHub issue associated with the limitation, you can assume that the limitation will not be resolved.

    1. If the tracking GitHub issue is still open, you should leave the known limitation as unresolved. If it is closed, you need to find the PR that resolved the issue, and see if it was backported to a previous release.

    1. Remove the limitation from the Known Limitations page, and from all other pages in the docs **for each version in which the resolving PR was merged**. If the resolving PR was not backported, then you can remove the limitation from just the latest release's docs.

1. [Document all new limitations](#where-to-find-known-limitations) under the "New limitations" header. Note that undocumented known limitations might apply to more than just one release. If the limitation applies to previous releases, then add the limitation under the "Existing limitations" header for each supported versioned docset to which the limitation applies.

1. After you document a known limitation, add the `docs-done` label to the limitation's tracking issue in the `cockroach` repo (it will have both `docs-known-limitations` and `docs-done` labels). *Do not close the issue* if it is in the `cockroach` repo. Documenting a limitation does not resolve the limitation.

1. Open a single PR with all of the known limitations updates for a GA release to the `docs` repo and add a manager as the reviewer. Known limitations are part of the GA checklist for docs, so managers need to be aware of the work.

### Product names

All product names except CockroachDB should be written as Liquid variables unless part of front-matter, file names, or non-Markdown files. Use the following code in place of product names:

- **CockroachDB Serverless** : `{{ site.data.products.serverless }}`
- **CockroachDB Dedicated** : `{{ site.data.products.dedicated }}`
- **CockroachDB Self-Hosted** : `{{ site.data.products.core }}`
- **CockroachDB Cloud** : `{{ site.data.products.db }}`


The first occurrence of a product name within a docs page should use full name. Discretionarily, subsequent occurrences may be shortened to “Dedicated”, “Serverless”, "Cloud", or "Self-Hosted", unless a writer (or reviewer) senses contextual ambiguity that could be improved by using the full product name. In long pages, it may be helpful to use the full name for each occurrence in a new sentence or if it's been a few paragraphs since an occurrence of the full product name.

### Code

You can mark up code [inline](#inline-code) or as a [code block](#code-blocks).

#### Inline code

Use inline code when referring to code, commands, or other technical syntax within a sentence. Inline `code` has `backticks (``) around` it.

**Example:** The `CREATE TABLE` statement creates a new table in a database.

#### Code block

Use a code block to provide executable code samples. A code block has an opening and closing set of 3 tildes (`~~~`) or 3 backticks (<code>```</code>). A code block supports syntax highlighting if you add the language name immediately after the first line of tildes or backticks. There should be one returned line before and after a code block, for better Markdown readability. For example:

```
This is a sample line of text.

{% include_cached copy-clipboard.html %}
~~~ shell
$ go get -u github.com/lib/pq
~~~

This is more sample text.
```
Using some special characters (e.g., double `{{ ... }}`) within code blocks may require to you [escape them](#how-to-escape-special-characters).

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

Notes for usage:
  
- **Copy to Clipboard** should be used for every code block that can be **executed**. 
- There must be a line break above the `{% include_cached copy-clipboard.html %}` line.

#### Placeholders

Code samples often include placeholder values, to be replaced by values specific to a user's environment. To denote that a value in a code sample is a placeholder value that should be replaced, use curly brackets (`{}`).

For example, suppose you have the following sample SQL statement: `SELECT * FROM TABLE {mytable};`. In this code sample, `{mytable}` would be replaced by some table name before the code could actually run (e.g., `SELECT * FROM TABLE realtable;`).

When you use placeholders, you usually need to define the value within the brackets, if the placeholder value (or the fact that the placeholder is a placeholder) isn't clear. If you are defining a placeholder value, do so immediately following the code sample/bracket. To determine the format of the value definition, you can roughly follow these guidelines:

- Always include the placeholder delimiters (i.e., the curly brackets `{}`) in the definitions.
- For a single placeholder value, use a follow-up sentence.
- For multiple placeholder values, use a [bulleted list](#lists).
- For many placeholder values (10+), and for placeholder values with complex definitions, use a [table](#tables).
- For large code blocks, define the placeholder values inside the code block, with an inline code comment.

Ensure that placeholders are placed within backticks `(``)`: `SET {session variable}`. This signifies that placeholder values are code.

If the code sample you are using is sensitive to curly bracket characters (e.g., JavaScript), you can use `<>` instead.

Using placeholders within code samples or in non-Markdown locations may require to you [escape them](#how-to-escape-special-characters).

For some examples, see [Connect to a CockroachDB Cluster](https://www.cockroachlabs.com/docs/stable/connect-to-the-database.html?filters=python).

#### How to escape special characters

Sometimes you may need to escape special characters to achieve proper rendering. This is most common in the following two cases:

- You are using Jekyll-reserved characters (e.g., double `{{ ... }}`) in code blocks. To escape these, wrap the specific line(s) you wish to escape using the Liquid tags `{% raw %} ... {% endraw %}`. For example:

  ```
  {% raw %}summary: Instance {{ $labels.instance }} has {{ $value }} tripped per-Replica circuit breakers{% endraw %}
  ```

  **Note:** Use these tags inline within the code block. Using `{% raw %}` or `{% endraw %}` tags on their own line will render the contained text correctly, but will introduce an extra newline of whitespace for each.

- You are using special characters (e.g., single `{ ... }`, `< ... >`, etc.) in non-Markdown copy, such as front matter (e.g., `title:` or `summary:`), or in the left-nav `sidebar-data` JSON files. To escape these, convert the special characters to Unicode. For example, to escape `SET {session variable}` in the front matter, use:

  ```
  title: SET &#123;session variable &#125;
  ```

  Or in one of the left-nav `sidebar-data` JSON files, use:

  ```
  {
    "title": "<code>SET &#123;session variable&#125;</code>",
    "urls": [
      "/${VERSION}/set-vars.html"
    ]
  },
  ```

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

Version tags inform users of new and updated features in CockroachDB, and could motivate users to upgrade to the latest major or minor version of CockroachDB. Version tags also help us identify new and updated features that we can call out in [our GA release notes](https://cockroachlabs.atlassian.net/wiki/spaces/ED/pages/402718726/GA+Release+Checklist).

To add a version tag, use the following Liquid tag:

~~~
{% include_cached new-in.html version="v22.1" %}
~~~

<a name="version-tags-tables"></a>

Note: If using a version tag inside of a Markdown table, use `<span class="version-tag">New in vXX.Y:</span>` or `<span class="version-tag">New in vXX.Y.Z:</span>` instead.

Put version tags at the beginning of a paragraph, sentence, or description in a table cell.

If a feature is new in a GA release, use the major release number for the release version tag (e.g., `{% include_cached new-in.html version="v21.2" %}`).

If a feature has been backported to a previous version in a patch release, use the minor release number for the release version tag (e.g., `{% include_cached new-in.html version="v21.2.10" %}`).

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

Pages that document CockroachDB itself exist within subdirectories that represent minor versions. To refer to a page's minor version (for example, v22.2), which matches its top-level subdirectory within the docs repo:

~~~
{{page.version.version}}
~~~

A minor version of CockroachDB receives updates as patches. To refer to a page's current patch version (for example, v22.1.7):

~~~
{{ page.release_info.name }}
~~~

### Tables

Use tables to display structured information in an easy-to-read format. We use two types of tables: [Markdown](#markdown) and [HTML](#html).

<a name="markdown"></a>

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

<a name="include-files"></a>

### Include files

Sometimes content needs to be duplicated across two or more pages in the documentation. For example, there may be several pages that need the same cluster setup, but describe how to use different features. Or a very specific [note](#notes) or [warning](#warnings) needs to be added to several different pages.

In these situations, you will need to use an _include file_. An include file is a separate Markdown file (stored in `_includes/some/shared-file.md`) where you will write content that is shared across multiple pages.

For more information about include files, see [the Jekyll `include` documentation](https://jekyllrb.com/docs/includes/).

_Note_: Using include files adds complexity to the docs site architecture and build process. It also makes writing the documentation more tricky, because instead of working on text in one document, the writer has to jump between two or more files. If you can link to existing content rather than using an include file, strongly consider doing that instead.

There are [basic](#basic-include-file-usage) and [advanced](#advanced-include-file-usage) methods for using include files. Use the basic method unless you are sure you need the advanced.

<a name="basic-include-file-usage"></a>

#### Basic include file usage

The basic method for using an include file is:

1. Find (or create) a block of content that you want to make appear on two or more different pages.
1. Create a new file in the subdirectory of the `_includes` directory associated with the product you are working on. For example, if you are working on CockroachDB Self-Hosted v22.1, the directory will be `_includes/v22.1/`. If you are working on CockroachDB Dedicated, it will be `_includes/cockroachcloud`. If the include text is not version- or product-specific, put it in the `common` folder.
1. In the pages where you want the included content to appear, add an `include` tag like one of the following: for CockroachDB Self-Hosted, `{% include {{page.version.version}}/some/shared-file.md %}`; for CockroachDB Dedicated, `{% include cockroachcloud/some/shared-file.md %}`.

The contents of `shared-file.md` will now appear on all of the pages where you added the `include` tag.

<a name="advanced-include-file-usage"></a>

#### Advanced include file usage

##### Different content depending on page name

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

<a name="remote-includes"></a>

##### Remote includes

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
  
#### Filter tabs
  
On some pages in our docs, there are tabs at the top of the page that will link to different pages at different hyperlinks. For example, in the [Install CockroachDB docs](https://www.cockroachlabs.com/docs/stable/install-cockroachdb.html), there are links to the Mac, Linux, and Windows pages at the top of the page.
  
Use [`filter-tabs.md`](https://github.com/cockroachdb/docs/blob/master/_includes/filter-tabs.md) to specify these tabs for any `cockroachcloud` docs or docs for CockroachDB v21.2 and later.

**Note:** this include file only produces tabs that link to different URLs/pages. It cannot be used for creating tabs within a single page.

The general process to follow and use this is as follows:
  
1. Identify each page to be linked from a filter tab.
    - Make a note of each HTML page filename (e.g., `install-cockroachdb-mac.html`).
    - Draft a tab name (e.g., `Install on <strong>Mac</strong>`)—the text to display on the tab itself. This supports HTML, not Markdown.
2. Create an include Markdown file within `_includes/<CRDB version>/filter-tabs` with the following structure:
    ```
    {% assign tab_names_html = "Tab Name 1;Tab Name 2;Tab Name 3" %}
    {% assign html_page_names = "page-name-1.html;page-name-2.html;page-name-3.html" %}

    {% include filter-tabs.md tab_names=tab_names_html page_names=html_page_names page_folder=<CRDB version> %}
    ```
    - `tab_names_html` is a semicolon-separated list of the HTML-supported tab names.
    - `html_page_names` is a semicolon-separated list of the page filenames with the `.html` extension.
    - `<crdb_version>` is `"cockroachcloud"` (with quotes) for any CockroachDB Cloud docs and `page.version.version` (without quotes) for any versioned docs (v21.2 and later).
3. For each page listed in `html_page_names`, paste `{% include <CRDB version>/filter-tabs/<filter-tab-include>.html %}` in the position where you want the tabs to be included.
  
#### Technical limitations of include files

Include files have the following technical limitations:

- They cannot be used in [Markdown tables](#tables). For example, this is why [the guidance about how to use version tags in tables](#version-tags-tables) is provided.
- A [remote include](#remote-includes) file in another repo that contains an [include file](#include-files) that references something in `cockroachdb/docs` will fail to pull in and render that include file.
- Include files containing a paragraph followed by a code block do not render correctly in the context of both paragraphs and lists in the files they are included from due to a limitation in our [Markdown](#markdown) renderer.

## Terminology and word usage

Term | Classification | Note
--- |:---:| ---
Postgres | 🔴 | This is a nickname for PostgreSQL. Use PostgreSQL instead: it's the official name, our docs site and Google treat these as synonyms, and Cmd+F on `Postgres` will still find `PostgreSQL`.
PostgreSQL | 🟢 | Preferred over Postgres.
vxx.x.x | 🟢 | This is the correct way to refer to any version of CockroachDB (for example, `v21.1.8`). Preferred over `version xx.x.x`. When listing a range of versions, separate the first and last version numbers with `to` (for example, `v22.1.0 to v22.1.4`). [Do not use a dash.](#punctuation-rules)
