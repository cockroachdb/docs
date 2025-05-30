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
    - [Examples](#examples)
  - [Avoid unnecessarily gendered language](#avoid-unnecessarily-gendered-language)
    - [Examples](#examples-1)
  - [Write diverse and inclusive examples](#write-diverse-and-inclusive-examples)
  - [Avoid unnecessarily violent language](#avoid-unnecessarily-violent-language)
    - [Examples](#examples-2)
  - [Write accessible documentation](#write-accessible-documentation)
  - [Write about features and users in inclusive ways](#write-about-features-and-users-in-inclusive-ways)
    - [Examples](#examples-3)
- [Capitalization and punctuation](#capitalization-and-punctuation)
  - [Capitalization rules](#capitalization-rules)
  - [Punctuation rules](#punctuation-rules)
- [Vale](#vale)
- [File conventions](#file-conventions)
  - [Examples](#examples-4)
  - [File naming](#file-naming)
- [Content types](#content-types)
  - [Concept](#concept)
    - [Examples](#examples-5)
  - [Task](#task)
    - [Examples](#examples-6)
  - [Reference](#reference)
    - [Examples](#examples-7)
  - [Definition](#definition)
    - [Examples](#examples-8)
- [Standard sections](#standard-sections)
  - [Glossary](#glossary)
    - [Examples](#examples-9)
  - [Before you begin](#before-you-begin)
  - [See also](#see-also)
- [Page types](#page-types)
  - [Tutorial](#tutorial)
    - [Examples](#examples-10)
  - [Best practice](#best-practice)
    - [Examples](#examples-11)
  - [Troubleshooting](#troubleshooting)
    - [Examples](#examples-12)
  - [FAQ](#faq)
    - [Examples](#examples-13)
  - [Release note](#release-note)
    - [Examples](#examples-14)
- [Components](#components)
  - [Page title](#page-title)
  - [Headings](#headings)
    - [Examples](#examples-15)
  - [Text format](#text-format)
    - [Bold](#bold)
    - [Monospace](#monospace)
    - [Quotation marks](#quotation-marks)
    - [Italics](#italics)
    - [Underline](#underline)
  - [Links](#links)
    - [Link capitalization](#link-capitalization)
    - [Links to CockroachDB docs pages in the same directory](#links-to-cockroachdb-docs-pages-in-the-same-directory)
    - [Links to CockroachDB docs pages outside of the current directory](#links-to-cockroachdb-docs-pages-outside-of-the-current-directory)
    - [Links to a specific location on a page that is not a heading](#links-to-a-specific-location-on-a-page-that-is-not-a-heading)
    - [Localized external links](#localized-external-links)
    - [GitHub issues and pull requests](#github-issues-and-pull-requests)
  - [Tips, notes, and warnings](#tips-notes-and-warnings)
    - [Tips](#tips)
    - [Notes](#notes)
    - [Warnings](#warnings)
    - [CockroachDB version callout](#cockroachdb-version-callout)
  - [Known limitations](#known-limitations)
    - [What are known limitations?](#what-are-known-limitations)
    - [Where to find known limitations](#where-to-find-known-limitations)
    - [When to document known limitations](#when-to-document-known-limitations)
    - [Who documents known limitations](#who-documents-known-limitations)
    - [Where to document known limitations](#where-to-document-known-limitations)
    - [How to document known limitations](#how-to-document-known-limitations)
  - [Product names](#product-names)
  - [Code](#code)
    - [Inline code](#inline-code)
    - [Code block](#code-block)
    - [Placeholders](#placeholders)
    - [How to escape special characters](#how-to-escape-special-characters)
  - [Examples](#examples-16)
  - [Version tags](#version-tags)
  - [Version references](#version-references)
  - [Tables](#tables)
    - [Markdown](#markdown)
    - [HTML](#html)
  - [Lists](#lists)
    - [Nest lists](#nest-lists)
    - [Nest paragraphs or code blocks](#nest-paragraphs-or-code-blocks)
    - [Use ordered lists when there are multiple steps in a section](#use-ordered-lists-when-there-are-multiple-steps-in-a-section)
  - [Images](#images)
  - [Videos](#videos)
  - [Include files](#include-files)
    - [Basic include file usage](#basic-include-file-usage)
    - [Advanced include file usage](#advanced-include-file-usage)
      - [Different content depending on page name](#different-content-depending-on-page-name)
      - [Remote includes](#remote-includes)
    - [Filter tabs](#filter-tabs)
    - [Technical limitations of include files](#technical-limitations-of-include-files)
  - [Tabs](#tabs)
    - [Linking into tabbed content](#linking-into-tabbed-content)
  - [Comments](#comments)
- [Word usage guidelines](#word-usage-guidelines)

## Style and tone

CockroachDB docs should be helpful, humble, positive, and friendly. To achieve this, all docs should be factual and free from hyperbolic language.

Other general guidance about language and tone:

- For [reference and general task-based docs](#reference-and-task-based-docs), use the second-person imperative present tense, also known as the "[imperative mood](https://www.grammar-monster.com/glossary/imperative_mood.htm)." These docs should be straightforward and conventional.

    **Example:** In a new terminal, as the `root` user, use the `cockroach user` command to create a new user, `maxroach`.

    **Example:** Now that you have a database, user, and a table, run the following code to insert rows into the table.

- Recommended usage of the personal pronoun "we":

    - "We" can be used to describe the group of people developing CockroachDB, instead of "Cockroach Labs," only when it is clear who "we" is referring to.
    - Do not use "we" in place of "CockroachDB" for when you are talking about something the _product_ does or supports.
    - Do not use "we" in tutorials. See the next bullet for more on tutorials and examples.

- For [tutorials and examples](#tutorials-and-examples), we recommend you use the second-person point of view (e.g., you). These docs should be more casual and conversational, as if they are teaching the user, but still straightforward and clear.

    **Example:** In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

- Use active voice instead of passive. For more information, refer to the [Purdue Online Writing Lab resource](https://owl.english.purdue.edu/owl/resource/539/02/).
- Use simple and direct language. Grammar can be incorrect to save simplicity (e.g., many descriptions in [reference docs](#reference-and-task-based-docs) are phrases).

    **Example:** `table name`: The name of the table to create audit logs for.

- Avoid using "please" when giving an instruction, except when asking the user to go outside the scope of the task (such as contacting Cockroach Labs or filing a support issue).

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
- Replace "_hit_ your resource limits" with **reach your resource limits**
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
- Append singular possessive nouns with `'s`, including when they end with `s`. For example, `Cockroach Labs's`.
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

Each version's pages are found in a directory named for the version. For example, pages for CockroachDB v21.1 are in the `docs > v21.1` directory. For more information about page structure, see the [Pages](https://github.com/cockroachdb/docs/blob/main/CONTRIBUTING.md#pages) section in our [Contributing Guide](https://github.com/cockroachdb/docs/blob/main/CONTRIBUTING.md). For more information about how to style page content, see [Components](#components).

Each version's images are stored in a versioned directory under the `images` directory. For example, images for CockroachDB v21.1 are in the `docs > images > v21.1` directory. For more information, see [Images](#images).

### File naming

File names should match the page title. If you need to change a file name, it is necessary to do the following:

- Add the previous page URL with the new URL to `_redirects`.
- Replace all links to the previous file name with the new file name in the applicable docs versions.

## Page components

### Title

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

Links are marked with inline text surrounded by square brackets followed by the link address in parentheses.

Avoid using non-descriptive link names such as `here`, `this page`, or `go`.

Use Markdown reference-style links when several parts of the same page refer to the same target URL. Reference-style links contain two sets of square brackets. The first set of brackets contains the link text that will appear on the final rendered page. The second set of brackets contains the reference name.

**Example:**

```
This text has a [link to a page][docs].
...
This text has a [link as well][docs].
...
[docs]: https://www.cockroachlabs.com/docs
```

#### Link capitalization

Link capitalization should match our [capitalization rules](#capitalization-rules) for page titles and headers:

- **Use title case** when referring to the linked doc by its page title (e.g., "See __Best Practices__ for more information").
- **Use sentence case** when referring to the linked doc by one of its headers (e.g., "See __Clock synchronization__ for further guidance").
- **Use sentence case** - when referring to a linked doc without explicitly citing a page title or header (e.g., "[…] follow the __identifier rules__ when creating […]").

#### Links to CockroachDB docs pages in the same directory

To link to a page within the same directory (e.g., a page in `v23.1` to another page in `v23.1`), use the [Jekyll link syntax](https://jekyllrb.com/docs/liquid/tags/#links).

If the page is a versioned doc, use `{{ page.version.version }}` instead of the hardcoded version. Otherwise, use the regular path (e.g., `cockroachcloud`).

**Example:** `[Foreign Key Constraint]({% link {{ page.version.version }}/foreign-key.md %})`

**Example:** `[Foreign Key Constraint]({% link cockroachcloud/quickstart.md %})`

To include a subsection, place it outside of the Liquid tag.

**Example:** `[Rules for creating foreign keys]({% link {{ page.version.version }}/foreign-key.md %}#rules-for-creating-foreign-keys)`

This also applies to files within a subdirectory of the same directory (e.g., a link from `v23.1/abc.md` to `v23.1/architecture/xyz.md` or from `v23.1/architecture/xyz.md` to `v23.1/abc.md`).

**Example:** `[Multi-active availability]({% link {{ page.version.version }}/architecture/glossary.md %}#multi-active-availability)`

#### Links to CockroachDB docs pages outside of the current directory

To link to a page outside of the current directory (e.g., a link from `v23.1` to `cockroachcloud`), use the fully qualified production URL:

**Example:** `[Quickstart with CockroachDB](https://www.cockroachlabs.com/docs/cockroachcloud/quickstart)`

#### Links to a specific location on a page that is not a heading

To link to a specific location on a page that is not a heading (e.g., a specific command-line flag in a table), add a manual anchor and use the `id` parameter:

**Example:**

```
# Anchor:
<a id="flags-max-offset"></a>`--max-offset`
```

```
# Link:
[--max-offset](#flags-max-offset)
```

#### Localized external links

For websites that automatically localize pages, avoid using localization elements directly within the URL. For example:

- GitHub
  - Instead of `https://docs.github.com/**en/**graphql/overview/explorer`
  - Use `https://docs.github.com/graphql/overview/explorer`
- Wikipedia
  - Instead of `https://en.wikipedia.org/wiki/SQL:2011`
  - Use `https://www.wikipedia.org/wiki/SQL:2011` or `https://wikipedia.org/wiki/SQL:2011`

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
- A feature that is fully implemented, but has some **long-standing** bugs (i.e., bugs that have existed across patch and/or major releases)
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

Known limitations for a given product area are documented by the writer assigned to that product area.

#### Where to document known limitations

Document all known limitations on the [Known Limitations](https://www.cockroachlabs.com/docs/stable/known-limitations.html) page.

If the limitation is related to a feature documented elsewhere on our docs site, you should also add the limitation to the page that documents that feature, under a dedicated "Known limitations" header. To avoid duplication, create an [include file](#include-files) in `_includes/vX.X/known-limitations` and include the file in both places.

#### How to document known limitations

Refer to the [wiki](https://cockroachlabs.atlassian.net/wiki/spaces/ED/pages/3516825623/Document+known+limitations).

### Product names

All product names except CockroachDB should be written as Liquid variables unless part of front-matter, file names, or non-Markdown files. Use the following code in place of product names:

- **CockroachDB Cloud** : `CockroachDB {{ site.data.products.cloud }}`
- **CockroachDB Basic** : `CockroachDB {{ site.data.products.basic }}`
- **CockroachDB Standard** : `CockroachDB {{ site.data.products.standard }}`
- **CockroachDB Advanced** : `CockroachDB {{ site.data.products.advanced }}`
- **self-hosted** : `CockroachDB {{ site.data.products.core }} cluster`
- **Enterprise** : `{{ site.data.products.enterprise }}`

The first occurrence of a product name within a docs page should use its full name. At the writer's discretion, subsequent occurrences may be shortened to "Basic", "Advanced", or "Cloud", unless a writer (or reviewer) senses contextual ambiguity that could be improved by using the full product name. In long pages, it may be helpful to use the full name for each occurrence in a new sentence or if it's been a few paragraphs since an occurrence of the full product name.

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

In an example command to download an artifact using the command line, `curl` is preferred over `wget` because it is included in Linux, macOS, and recent builds of Windows. Use syntax like:

```
curl -o {optional_output_path}/{output_file_name} [-H {header_keys_and_values}] {url} 
```

- In general, always specify `-o` or `--output` to a path and filename, or omit the path to save the file to the current working directory.

  Omit `-o` to print the response to standard output. Printing a binary file can corrupt the terminal session or lead to unintended results, and is generally useful only when piping or redirecting the output to another command or a file.
- Headers are optional, but certain APIs such as the CockroachDB Cloud API require certain header fields to be set.

**SQL code samples**

SQL code samples are broken into two sections: commands and responses.

- **Commands** (e.g., `SELECT`, `CREATE TABLE`) should begin with `~~~ sql` followed by a line break. Commands should be properly capitalized, and there should be only one command per code sample.

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

**Example:** [Query Options](admin-ui-custom-chart-debug-page.html#query-options) table (see [GitHub](https://raw.githubusercontent.com/cockroachdb/docs/main/src/current/_includes/v2.1/admin-ui-custom-chart-debug-page-00.html) for the raw HTML)

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

Nested ordered lists work similarly:

```
1. This is a step.
    1. This is a substep.
    1. This is a substep.
    1. This is a substep.

1. This is a step.

    This is a nested paragraph.
    1. This is a substep.
    1. This is a substep.
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

#### Use ordered lists when there are multiple steps in a section

Don't use prose to describe multiple steps within a section. Instead, use an ordered list. If a topic introduces actions the user performs with "First, ..." and "Next, ..." you should make these an ordered list.

**Incorrect**

First, run this command:

~~~ shell
command1 --option
~~~

Then, run another command:

~~~ shell
command2 myfile.yaml
~~~

**Correct**

1. Run this command:

    ~~~ shell
    command1 --option
    ~~~

1. Run another command:

    ~~~ shell
    command2 myfile.yaml
    ~~~

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

<a name="videos"></a>

### Videos

Like images, use videos to clarify a topic, but only use them as needed. Typically, videos should be hosted on the official [CockroachDB YouTube page](https://www.youtube.com/@cockroachdb) and are surfaced by our Marketing team.

Use the following Liquid to include an embedded video in a Markdown page:

~~~ md
{% include_cached youtube.html video_id="<YouTube ID>" [widescreen=true] %}
~~~

The `video_id` parameter is required and is whatever is after the `?v=` portion of the URL. If the URL to the video you wish to embed is `https://www.youtube.com/watch?v=5kiMg7GXAsY`, for example, then the value of `video_id` should be `5kiMg7GXAsY`. The `widescreen` parameter is optional and meant for videos with wide banners such as our video on [Foreign Key Constraints](https://www.youtube.com/watch?v=5kiMg7GXAsY).

You can optionally pass in a start time to the `video_id` parameter to make the video start at a specific timestamp. The below example embeds the [How to Create Tables with Foreign Keys in SQL](https://www.youtube.com/watch?v=mFQk1VsIkZA) video and starts playing it at 25 seconds:

~~~ md
{% include_cached youtube.html video_id="mFQk1VsIkZA?start=25" %}
~~~

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
1. Create a new file in the subdirectory of the `_includes` directory associated with the product you are working on. For example, if you are working on CockroachDB Self-Hosted v22.1, the directory will be `_includes/v22.1/`. If you are working on CockroachDB Dedicated, it will be `_includes/cockroachcloud`. If the include text is not version- or product-specific, put it in the `common` directory.
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

Use [`filter-tabs.md`](https://github.com/cockroachdb/docs/blob/main/src/current/_includes/filter-tabs.md) to specify these tabs for any `cockroachcloud` docs or docs for CockroachDB v21.2 and later.

**Note:** this include file only produces tabs that link to different URLs/pages. It cannot be used for creating tabs within a single page.

The general process to follow and use this is as follows:

1. Identify each page to be linked from a filter tab.
    - Make a note of each HTML page filename (e.g., `install-cockroachdb-mac.html`).
    - Draft a tab name (e.g., `Install on <strong>Mac</strong>`)—the text to display on the tab itself. This supports HTML, not Markdown.
2. Create an include Markdown file within `_includes/<CRDB version>/filter-tabs` with the following structure:
    ```
    {% assign tab_names_html = "Tab Name 1;Tab Name 2;Tab Name 3" %}
    {% assign html_page_filenames = "page-name-1.html;page-name-2.html;page-name-3.html" %}

    {% include filter-tabs.md tab_names=tab_names_html page_filenames=html_page_filenames page_folder=<CRDB version> %}
    ```
    - `tab_names_html` is a semicolon-separated list of the HTML-supported tab names.
    - `html_page_filenames` is a semicolon-separated list of the page filenames with the `.html` extension.
    - `<crdb_version>` is `"cockroachcloud"` (with quotes) for any CockroachDB Cloud docs and `page.version.version` (without quotes) for any versioned docs (v21.2 and later).
3. For each page listed in `html_page_filenames`, paste `{% include <CRDB version>/filter-tabs/<filter-tab-include>.html %}` in the position where you want the tabs to be included.

#### Technical limitations of include files

Include files have the following technical limitations:

- They cannot be used in [Markdown tables](#tables). For example, this is why [the guidance about how to use version tags in tables](#version-tags-tables) is provided.
- A [remote include](#remote-includes) file in another repo that contains an [include file](#include-files) that references something in `cockroachdb/docs` will fail to pull in and render that include file.
- Include files containing a paragraph followed by a code block do not render correctly in the context of both paragraphs and lists in the files they are included from due to a limitation in our [Markdown](#markdown) renderer.

<a name="tabs"></a>

### Tabs

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

#### Linking into tabbed content

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

### Comments

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

#### TODOS

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

## Word usage guidelines

This section logs decisions about dictionary words to use and avoid. Add specific guidelines we decide as a team to this section. Refer also to [Technical terminology](#technical-termilogy) for technical terms that may not be in a dictionary.

### Directories and folders

- Use "directory" to refer to a filesystem directory, either locally or in a VM. For example, "Compress the directory into a `zip` archive."
- Use "folder" to refer to a folder within a UI, such as a web UI or an IDE. For example, "Create a folder in your CockroachDB Cloud organization."

### Technical terminology

This section logs decisions about software branding and terminology. In general, align third-party branding with that brand's usage. For example, the [PostgreSQL project](https://www.postgresql.org/) uses the word "PostgreSQL" with that capitalization. Add specific guidelines we decide as a team to this table.

Term | Classification | Note
--- |:---:| ---
Postgres | 🔴 | This is a nickname for PostgreSQL. Use PostgreSQL instead: it's the official name, our docs site and Google treat these as synonyms, and Cmd+F on `Postgres` will still find `PostgreSQL`.
PostgreSQL | 🟢 | Preferred over Postgres.
vxx.x.x | 🟢 | This is the correct way to refer to any version of CockroachDB (for example, `v21.1.8`). Preferred over `version xx.x.x`. When listing a range of versions, separate the first and last version numbers with `to` (for example, `v22.1.0 to v22.1.4`). [Do not use a dash.](#punctuation-rules)
