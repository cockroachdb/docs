# Style Guide

The following guidance is provided to benefit CockroachDB docs authors and reviewers by reflecting past style decisions, and to benefit readers by promoting consistency and readability across our content.

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
- [Product names](#product-names)
- [Page components](#page-components)
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
  - [Examples](#examples-15)
- [Content elements](#content-elements)
  - [Images](#images)
  - [Videos](#videos)
- [Word usage guidelines](#word-usage-guidelines)

For Markdown-specific syntax and formatting guidelines, refer to the [Markdown Guide](MarkdownGuide.md).

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

- For tutorials and examples, we recommend you use the second-person point of view (e.g., you). These docs should be more casual and conversational, as if they are teaching the user, but still straightforward and clear.

    **Example:** In this lab, you'll start with a fresh cluster, so make sure you've stopped and cleaned up the cluster from the previous labs.

- Use active voice instead of passive. For more information, refer to the [Purdue Online Writing Lab resource](https://owl.english.purdue.edu/owl/resource/539/02/).
- Use simple and direct language. Grammar can be incorrect to save simplicity (e.g., many descriptions in reference docs are phrases).

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
- Capitalize proper nouns, CockroachDB specific terms, and the names of UI features.

    **Examples:** CockroachDB, Cockroach Labs, the Overview dashboard, the SQL Queries graph

- Follow SQL capitalization standards.
- In body text, only capitalize proper nouns. Do not capitalize common nouns, even if the common noun is an important product concept.

    **Example:**

      - Correct: New clusters will now have admission control enabled by default.
      - Incorrect: New clusters will now have Admission Control enabled by default.

#### Link capitalization

For [links](#links), capitalization should match the context:

- **Use title case** when referring to the linked doc by its page title (e.g., "See __Best Practices__ for more information").
- **Use sentence case** when referring to the linked doc by one of its headers (e.g., "See __Clock synchronization__ for further guidance").
- **Use sentence case** when referring to a linked doc without explicitly citing a page title or header (e.g., "[…] follow the __identifier rules__ when creating […]").

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

## Product names

All product names except CockroachDB should be written as Liquid variables unless part of front-matter, file names, or non-Markdown files. Use the following code in place of product names:

- **CockroachDB Cloud** : `CockroachDB {{ site.data.products.cloud }}`
- **CockroachDB Basic** : `CockroachDB {{ site.data.products.basic }}`
- **CockroachDB Standard** : `CockroachDB {{ site.data.products.standard }}`
- **CockroachDB Advanced** : `CockroachDB {{ site.data.products.advanced }}`
- **self-hosted** : `CockroachDB {{ site.data.products.core }} cluster`

The first occurrence of a product name within a docs page should use its full name. At the writer's discretion, subsequent occurrences may be shortened to "Basic", "Advanced", or "Cloud", unless a writer (or reviewer) senses contextual ambiguity that could be improved by using the full product name. In long pages, it may be helpful to use the full name for each occurrence in a new sentence or if it's been a few paragraphs since an occurrence of the full product name.

## Page components

### GitHub issues and pull requests

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

### Examples

Examples help show the feature in action. Examples follow a basic format:

1. The **Title** should start with a verb and should describe the task the example is outlining. It should use title case.

    **Example:** Create a Table that Mirrors Key-Value Storage

2. **Introductory information** should be provided if some context is needed to orient the user and can also be used to introduce code blocks. This should be written in a conversational tone.

    **Example:** "CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:"

- **Code blocks** provide executable code samples.

    **Example:** "CockroachDB is a distributed SQL database built on a transactional and strongly-consistent key-value store. Although it is not possible to access the key-value store directly, you can mirror direct access using a "simple" table of two columns, with one set as the primary key:

    ~~~
    > CREATE TABLE kv (k INT PRIMARY KEY, v BYTES);
    ~~~

    When such a "simple" table has no indexes or foreign keys, `INSERT`/`UPSERT`/`UPDATE`/`DELETE` statements translate to key-value operations with minimal overhead (single digit percent slowdowns)." [_Click here to see the rest of the example._](https://www.cockroachlabs.com/docs/stable/create-table.html#create-a-table-that-mirrors-key-value-storage)

## Content elements

This section covers various content elements used in CockroachDB documentation.

### Images

Use images to clarify a topic, but only use them as needed. Images are either:

- **Screenshots** - Provide a UI visual. Screenshots should show enough of the UI that the user can easily orient themselves and understand what they are being shown. If a screenshot needs an annotation, use a red box.

  **Note**: Screenshots are difficult to keep current, and impact the accessibility of our documentation. Use a screenshot if it is necessary for the user to accomplish a task or understand a feature. For example, a screenshot of a Contention metric graph in the DB Console could be necessary if it is used as an example of a cluster with high contention in a how-to on troubleshooting performance. It is not necessary in a reference topic about the DB Console user interface. If you add a screenshot to a topic, make sure the topic describes what is being shown in the screenshot for SEO and accessibility.

- **Diagrams** - Provide a visual of a complicated theory. Diagrams should be simple and easy to read.

### Videos

Like images, use videos to clarify a topic, but only use them as needed. Typically, videos should be hosted on the official [CockroachDB YouTube page](https://www.youtube.com/@cockroachdb) and are surfaced by our Marketing team.

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

### Legacy vs. Deprecated

Use _legacy_ only for our own earlier products, features, or workflows to signal that a newer option is preferred. Avoid using legacy as a pejorative; if no preference is intended, say "earlier" or "previous". Do not use legacy to refer to competitors' products.

Prefer _deprecated_ when there is an approved plan for end of support and removal. If deprecation is not approved but guidance is needed, you may call the previous option legacy.
