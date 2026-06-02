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
  - ["Directory" vs "folder"](#directory-vs-folder)
  - ["Legacy" vs "deprecated"](#legacy-vs-deprecated)
  - ["In" vs "on" a cluster](#in-vs-on-a-cluster)
  - [AI](#ai)
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

For tasks, use the imperative present tense, aka "[imperative mood](https://www.grammar-monster.com/glossary/imperative_mood.htm)." The second-person subject ("you") is implied and can be omitted.

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

### Anthropomorphization

CockroachDB can be the grammatical subject of an active-voice sentence describing its behavior. However, when using CockroachDB as the subject, do not use verbs that imply human cognition or emotion.

Avoid verbs that suggest awareness or intent: "knows", "wants", "decides", "thinks", "believes", "understands", "sees", "prefers", "chooses", "expects". 

Instead, describe the actual mechanical or computational action: "assigns", "returns", "determines", "creates", "stores", "checks", "validates", "rejects", "routes", "distributes", "replicates", "calculates", "records", "tracks".

- **Avoid**: CockroachDB knows which node owns the range.
  **Prefer**: CockroachDB tracks which node holds the lease for each range.

- **Avoid**: CockroachDB decides where to place replicas based on locality constraints.
  **Prefer**: CockroachDB distributes replicas according to your locality constraints.

- **Avoid**: CockroachDB understands that the cluster is under high load.
  **Prefer**: CockroachDB detects high load and adjusts admission control accordingly.

### Prescriptive writing

Write in a prescriptive style that clearly guides the user. The user should feel confident and supported, without having to infer meaning or make too many decisions on their own.

Use active instead of passive voice.

- **Avoid:** Each parameter should be set explicitly.  
  **Prefer:** Set each parameter explicitly.

- **Avoid:** Additional options can be specified.  
  **Prefer:** You can specify additional options.

Use concise, direct language. Cut unnecessary words unless a conversational tone is intentional (for example, in tutorials). If a feature or concept is difficult to describe clearly or concisely, consider using an example or [image](#images) to complement the text.

- **Avoid:** Be mindful of the possibility that you might encounter a different result, depending on the specifics of your configuration, so you might want to do some testing first to see what happens.  
  **Prefer:** Run tests to verify that you get the expected result for your configuration.

- **Avoid:** `table_name`: This parameter is used to specify the name of the table you want to modify.  
  **Prefer:** `table_name`: The name of the table to modify.

Avoid these common filler phrases and inflated verbs:

- **Avoid:** "in order to"
  **Prefer:** "to"

- **Avoid:** "due to the fact that"
  **Prefer:** "because"

- **Avoid:** "at this point in time"
  **Prefer:** "now"
  This example does NOT apply when referencing the syntax `AS OF SYSTEM TIME`, or when discussing "as of system time" in prose.

- **Avoid:** "make use of"
  **Prefer:** "use"

- **Avoid:** "is able to"
  **Prefer:** "can"

- **Avoid:** "in the event that"
  **Prefer:** "if"

- **Avoid:** "prior to"
  **Prefer:** "before"

- **Avoid:** "with regard to"
  **Prefer:** "about"

- **Avoid:** "leverage"
  **Prefer:** "use"

- **Avoid:** "utilize"
  **Prefer:** "use"

- **Avoid:** "perform"
  **Prefer:** a more specific verb, such as "run", "complete", or "execute"

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

### Tense

Use present tense to describe CockroachDB's behavior, the state of the system, and the results of user actions.

- **Avoid:** When you run the command, CockroachDB will create a new table and will return a confirmation.
  **Prefer:** When you run the command, CockroachDB creates a new table and returns a confirmation.

- **Avoid:** The leaseholder will handle all reads and writes for the range.
  **Prefer:** The leaseholder handles all reads and writes for the range.

Use past tense only to refer to something that has already happened within a sequence.

**Example:** Now that you have created the database, add the schema.

Use future tense only when referring to something that occurs later in a sequence of steps.

**Example:** Later in this task, you will create a standby cluster. First, create and start the primary cluster:

Avoid mixing present and future tense within a single description of system behavior.

- **Avoid:** CockroachDB assigns a leaseholder to each range, which will handle all reads and writes.
  **Prefer:** CockroachDB assigns a leaseholder to each range, which handles all reads and writes.

### Speculation and feature support

Avoid forward-looking language when writing about supported syntax and behavior. Do not suggest that a feature may or may not be added in a future release. Avoid words like "yet" and "currently", and do not reference the internal product roadmap.

- **Avoid:** CockroachDB does not yet support column-level privileges. This is planned for a future release.  
  **Prefer:** CockroachDB does not support column-level privileges.

### Latinisms

For readability, avoid Latinisms.

- **Avoid:** Select a deployment option, e.g., {{ site.data.products.standard }} or {{ site.data.products.advanced }}.  
  **Prefer:** Select a deployment option such as {{ site.data.products.standard }} or {{ site.data.products.advanced }}.

- **Avoid:** Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (i.e., if your cluster loses a majority of its nodes).
  **Prefer:** Because CockroachDB is designed with high fault tolerance, backups are primarily needed for disaster recovery (that is, if your cluster loses a majority of its nodes).

- **Avoid:** databases, functions, tables, clusters, schemas, rows, users, jobs, etc.
  **Prefer:** databases, functions, tables, clusters, schemas, rows, users, jobs, and so on.

- **Avoid:** These can also be queried via `SHOW`.
  **Prefer:** These can also be queried with `SHOW`.

### Modal verbs

Maintain consistency when using modal verbs to signal the degree of obligation or certainty.

- Use _must_ to denote a required action with no alternative. Use for prerequisites, security requirements, and hard constraints.
- Avoid using _should_. Instead, use _Cockroach Labs recommends_ to denote a recommended action with viable alternatives. This includes best practices and suggestions.
- Use _can_ when describing an action that is possible, but is not directly recommended or not recommended. Use to describe capabilities, permissions, or options that are available to the user.
- Use _may_ when describing behavior that is non-deterministic or likely to vary.
- Use _avoid_ to denote actions that we specifically recommend against. Use for practices that are technically possible, but likely to cause difficulty for the user. If possible, include a brief explanation of why the user should avoid the action.
- Use _do not_ only to denote actions that will certainly harm the user's system. If there could conceivably be a valid reason for a user to do the action, use "avoid" instead.
- Use _cannot_ only to describe actions that are impossible.

Do not use "should" as a softer form of "must." If the user has no real alternative, use "must."
- **Avoid**: You should enable admission control before running a high-throughput workload.
  **Prefer**: You must enable admission control before running a high-throughput workload.

Use "may" only when describing results that genuinely vary. In user instructions, always use "can" instead of "may".
- **Example**: Changing this number may impact cluster throughput.
- **Avoid**: Users may query this table to view active sessions.
  **Prefer**: Users can query this table to view active sessions.

### Transition and connective language

Transitions help readers follow the relationship between ideas, but overused or redundant transitions add length without adding clarity.

Avoid these commonly overused transitions:

- "Note that...": State the information directly. Consider whether emphasizing the information is important enough to use a [note callout](#callouts).
- "As mentioned above" / "As noted earlier" / "As previously described": Either briefly restate the information or link to the relevant section. Do not ask the reader to remember something from earlier in the page.
- "Furthermore," "Moreover," "Additionally" at the start of a sentence: These transitions are usually redundant. If ideas are related, their connection should be clear from context.
- "However" / "But" at the start of a sentence: Use sparingly. When contrast is implied by the surrounding content, omit the transition.

Use parallel structure within lists and sequences. When items in a list or steps in a sequence share the same grammatical form, they are easier to scan. Begin each item with the same part of speech, ideally a verb.

- **Avoid:**
  - Create a cluster.
  - The database should then be configured.
  - Running the migration script completes the setup.

**Prefer:**
  - Create a cluster.
  - Configure the database.
  - Run the migration script.

### Conditional and variable behavior

When giving conditional instructions, lead with the condition, not the result. This tells the user whether a step applies to them before they read what to do.

- **Avoid:** Run `cockroach start` after verifying that the node is healthy.
  **Prefer:** After verifying that the node is healthy, run `cockroach start`.

When dealing with variable behavior, be specific. Do not use vague qualifiers like "depending on your setup," "this may vary," or "results may differ" without explaining exactly what behavior varies.

- **Avoid:** The default value may vary depending on your configuration.
  **Prefer:** The default value is X for CockroachDB Basic clusters and Y for CockroachDB Advanced clusters.

Do not use "depending on your use case" as a standalone qualifier. If a choice depends on the use case, describe the use cases and their corresponding recommendations.

- **Avoid:** You may want to adjust this setting depending on your use case.
  **Prefer:** Increase this value if your workload involves frequent long-running transactions. Keep the default if your workload is primarily short reads and writes.

## Word usage guidelines

This section logs decisions about dictionary words to use and avoid. Add specific guidelines we decide as a team to this section.

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

### AI

Write "AI" without periods. Not "A.I."

You don't need to precede the usage of the term "AI" with its elaboration (e.g. "Artificial Intelligence (AI).") Any reader will know what AI is.

When describing "AI tools," "AI agents," or "AI assistants" (etc.) in the context of integrating with CockroachDB, precede introductory instances of these terms with the word "your."

  - **Avoid:** The MCP server enables AI tools to access a cluster.
  - **Prefer:** The MCP server enables your AI tools to access a cluster.

This is a request from Cockroach Labs' legal team. The idea is to remind the reader that these tools are not Cockroach Labs', and so any mistaken/detrimental use of these tools is not Cockroach Labs' responsibility. Not every instance of these terms needs to be preceded with the word "your." This is mainly meant for early instances of these terms on the page (i.e. in introductory paragraphs), to establish this idea.

## Inclusivity

Use inclusive language that reflects a diverse readership. Avoid terms that inherently exclude, stereotype, or cause confusion.

### Avoid minimizing language

Minimizing language implies that a task is easy or obvious, which may not be true for all users.

Minimizing language includes words like "simple/simply", "just", "easy/easily", "actually", "obviously", "clearly", "of course", "straightforward", "trivial", and more.

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

Terminology around "kill" vs. "stop" vs. "terminate" is nuanced. In general, use "terminate" unless referring to a specific command that uses a different term in its syntax.

### Write accessible documentation

- Don't use directional terms as the only clue to location within a page. "Left", "right", "up", "down", "above", and "below" aren't useful for people who use screen-reading software. Good replacements are "preceding" and "following". If you must use a directional term, provide additional text about the location, such as in the Save As dialog box, on the Standard toolbar, or in the title bar.
- Replace "_see_" with **refer to**.
- Provide [alt text](https://en.wikipedia.org/wiki/Alt_attribute) that adequately summarizes the intent of each [image](#images).
- Link text should be the same as or summarize the title of the link target. Avoid **here** and **this documentation**.

### Write about features and users in inclusive ways

Avoid using socially-charged terms for features and technical concepts.

**Examples:**

- Replace _blacklist / whitelist_ with **denylist / allowlist**.
- Replace _master_ with **main/principal/primary/manager** and _slave_ with **secondary/subordinate/worker**.
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

- Use the Oxford (aka serial) comma.
    - **Avoid:** The connection string is pre-populated with your username, password, cluster name and other details.
    - **Prefer:** The connection string is pre-populated with your username, password, cluster name, and other details.
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

### Numbers and measurements

The following rules apply only to your own writing. When representing example commands, outputs, or UI elements, always use the exact wording that the user sees in practice.

In prose, spell out whole numbers one through nine. Use numerals for 10 and above. If referencing inexact numbers such as "dozens", "hundreds", or "thousands", spell out those words.

- **Example:** There are three replicas by default.
- **Example:** A cluster with 10 or more nodes benefits from zone-level fault tolerance.

In technical contexts, always use numerals regardless of size. This includes:

- Measurements with units: "5 minutes", `128 MiB`, "3 seconds"
- SQL values and parameters: `LIMIT 5`, `max_offset = 500ms`
- Percentages: "5%" (not "five percent")
- Version numbers: v25.1

Format technical values as used in programmatic syntax using code formatting (backticks).

For units, use the following conventions:

- Use "GiB" and "MiB" (not "GB" and "MB") for binary storage values, consistent with the DB Console and CockroachDB output.
- In prose, write time durations with the unit spelled out. 
  - **Avoid:**  "5 min"
    **Prefer:** "5 minutes"
  - **Avoid:**  "30s"
    **Prefer:** "30 seconds"
- Place a numeral directly before the unit with a space between them: "3 nodes," "128 MiB," "5 minutes."

Express numerical ranges with "to" between values. Do not use dashes for ranges.

- **Avoid:** "3-5 nodes"
  **Prefer:** "3 to 5 nodes"
- **Avoid:** "v22.1.0-v22.1.4"
  **Prefer:** "v22.1.0 to v22.1.4"

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

For templates that provide a starting point for writing concept topics, refer to the [concept templates](https://github.com/cockroachlabs/docs/tree/main/templates/concept).

#### Examples

- [Indexes](https://www.cockroachlabs.com/docs/stable/indexes.html)
- [Architecture Overview](https://www.cockroachlabs.com/docs/stable/architecture/overview.html)
- [SQL Layer](https://www.cockroachlabs.com/docs/stable/architecture/sql-layer.html)

### Task

A _task_ topic provides step-by-step instructions to complete a specific goal. Tasks are discrete and action-based. Tasks have the following properties:

- Answers the question "how do I do \<an action\>?" by describing precisely what to do and the order in which to do it.
- The first sentence of a task describes the outcome or goal of the task and directs the reader to the steps that follow.
- Corresponds to a specific user journey as defined by Product.
- The title or heading states an actionable goal for the user, ideally of the form **\<Imperative verb\> [\<article\>|\<conjunction\>] \<noun\> or \<proper noun\>**.

  **Example:** Create an Index

- The verb ideally should be specific. Avoid generic verbs such as **Use**, **Manage** unless naming a page containing specific tasks.
- Avoid **Your** because you may be using an object that you don't "own".

  **Example:** Connect to a Cluster, not Connect to Your Cluster

- Lead with the verb. Don't bury it at the end of the heading.

  **Example:** Access DB Console, not DB Console Access.

- Present the steps as a list of numbered headings, e.g., "Step 1. ...".

Tasks should **not** include concept or reference information; instead, a task should link to [Concept](#concept) and [Reference](#reference) topics as needed.

For templates that provide a starting point for writing task topics, refer to the [task templates](https://github.com/cockroachlabs/docs/tree/main/templates/task).

#### Examples

- [Create a CockroachCloud Cluster](https://www.cockroachlabs.com/docs/cockroachcloud/create-your-cluster.html)
- [Upgrade to CockroachDB vXY.Z](https://www.cockroachlabs.com/docs/stable/upgrade-cockroach-version.html)
- [Stream a Changefeed to Snowflake](https://www.cockroachlabs.com/docs/cockroachcloud/stream-changefeed-to-snowflake-aws)

### Reference

_Reference_ topics provide information about a specific CockroachDB function, feature, or interface. Reference topics are detail-oriented, and should include all of the information available on a specific topic, without providing prescriptive guidance. Prescriptive guidance is reserved for [Guide](#guide) topics.

The first paragraph of a reference topic describes the focus of the information to follow, and briefly clarifies how the information is useful.

Reference topics typically document programming constructs, interface parameters, or facts about a product, but do not provide explanations of [concepts](#concept) or [tasks](#task).

Reference topics help users understand the precise meaning and effect of CockroachDB SQL language constructs, platforms, configuration options, API parameter values, etc.

- The content should be comprehensive and accurate. This principle might apply to other page types, but it is especially important for reference, as it is the ultimate source of truth for a particular feature or interface.
- The content should be succinct. Details are often presented in table format. Prose is better suited for [Concept](#concept) topics.

For templates that provide a starting point for writing reference topics, refer to the [reference templates](https://github.com/cockroachlabs/docs/tree/main/templates/reference).

#### Examples

- SQL reference: [`CREATE TABLE`](https://www.cockroachlabs.com/docs/stable/create-table.html)
- CLI reference: [`cockroach sql`](https://www.cockroachlabs.com/docs/stable/cockroach-sql.html)
- API reference: [Cluster API](https://www.cockroachlabs.com/docs/api/cluster/v2)

### Guide

_Guides_ offer the reader a perspective on how to decide between a number of different ways of accomplishing a goal. They are meant to provide "guidance" (it's in the name) and should eventually lead the user to perform one or more [Tasks](#task).

To accomplish this goal, guides often link to several different [Concept](#concept) topics and compare and contrast them. They can also link to multiple [Task](#task) topics.

For templates that provide a starting point for writing guide topics, refer to the [guide templates](https://github.com/cockroachlabs/docs/tree/main/templates/guide).

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

Always introduce a code block with a lead-in sentence that ends with a colon. Do not drop a code block into a page without context, even if the preceding heading seems self-explanatory. Make the lead-in sentence as specific as possible. Avoid generic openers like "Run the following command:" when a more descriptive alternative is available.

- **Avoid:** Run the following command:
  **Prefer:** To start a CockroachDB node, run:
  **Prefer:** To view the list of active sessions, run the following SQL statement:

When showing the output of a command, introduce it with one of the following consistent phrases:
- "The output looks like the following:" for representative example output.
- "The command returns the following:" for exact return values.
- "The output includes the following:" when the example shows a relevant excerpt, not the full output.

When a task involves several steps, each with its own code block, give every code block its own lead-in sentence. Do not group multiple steps under a single introduction.

- **Avoid:** Run the following commands to initialize the cluster and add a user: {two code blocks}
  **Prefer:**
    - Initialize the cluster: {code block}
    - Add a user: {code block}

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

- Avoid using consecutive callouts.
- Avoid using more than one callout per major section. (Major sections are defined by H2s. Text areas under different H2s are in different major sections.)
- Most documentation belongs in the body of a page rather than in a callout. Only use a callout if including the information in the body would severely disrupt the flow of the writing, or if the information is crucial enough to require special attention.

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

**Example:** `[#1](https://github.com/cockroachlabs/docs/pull/1)`

#### External links

When linking to third-party documentation, consider the purpose and maintenance implications. Link to third-party sources for integration workflows, official API references, and tool configurations that change frequently.

**Best practices:**

- Link to stable, official documentation pages when possible and ensure links point to the appropriate version of the external product.
- Avoid linking to blog posts or unofficial sources.
- Consider whether a brief explanation in our docs would be more reliable than an external link.

For link syntax, refer to the [Markdown Guide](MarkdownGuide.md#links).

### UI elements

Use consistent verbs when describing interactions with UI elements. Do not mix synonyms for the same type of interaction.

- For activating a button, use _click_. **Example:** Click **Submit**.
- For choosing from a menu, list, or dropdown, use _select_. **Example:** Select **Advanced** from the deployment type menu.
- For pressing a physical button or key, use _press_. **Example:** Press **Enter**.
- For typing into a field, use _enter_. **Example:** In the **Cluster name** field, enter a name for your cluster.
- For enabling or disabling a toggle, use _turn on/off_. **Example:** Turn on **Admission control**.
- For checking or unchecking a checkbox, use _check/uncheck_. **Example:** Check the **Enable backups** checkbox.
- For navigating to a page in the UI, use _go to_. **Example:** Go to the **Clusters** page.

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
