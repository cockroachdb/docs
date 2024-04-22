---
title: Full-Text Search
summary: Full-text searches using TSVECTOR and TSQUERY enable natural-language searches on documents with ranked results.
toc: true
docs_area: develop
---

A full-text search is used to perform natural-language searches on documents such as articles, websites, or other written formats.

This page describes how to perform full-text searches using the provided [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions).

{{site.data.alerts.callout_info}}
Some PostgreSQL syntax and features are unsupported. For details, see [Unsupported features](#unsupported-features).
{{site.data.alerts.end}}

## How does full-text search work?

In the PostgreSQL terminology, a *document* is a natural-language text [converted to a data type](#process-a-document) that is searchable using [specially formatted queries](#form-a-query). A document is typically stored within a single database row or concatenated from multiple fields.

A full-text search has the following advantages over pattern matching with `LIKE` and `ILIKE`:

- A full-text search can specify a [text search configuration](#text-search-configuration) that enables language-specific searches.
- The results of a full-text search can be [ranked](#rank-search-results).
- A full-text search can be accelerated using a [full-text index](#full-text-indexes).
- `LIKE` and `ILIKE` are only fast for prefix searches or when indexed with a [trigram index]({% link {{ page.version.version }}/trigram-indexes.md %}).

{{site.data.alerts.callout_success}}
{% include {{ page.version.version }}/sql/use-case-trigram-indexes.md %}
{{site.data.alerts.end}}

### Process a document

To make a document searchable, convert it to the [`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %}) data type. A `TSVECTOR` value consists of individual *lexemes*, which are normalized strings used for text matching. Each lexeme also includes a list of integer positions that indicate where the lexeme existed in the original document.

The `to_tsvector()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) converts a string input into a `TSVECTOR` value:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('How do trees get on the internet?');
~~~

~~~
           to_tsvector
---------------------------------
  'get':4 'internet':7 'tree':3
~~~

This `TSVECTOR` consists of the lexemes `get`, `internet`, and `tree`. Normalization removes the following from the input:

- Derivatives of words, which are reduced using a [stemming](https://wikipedia.org/wiki/Stemming) algorithm. In this example, "trees" is normalized to `tree`.
- *Stop words*. These are words that are considered not useful for indexing and searching, based on the [text search configuration](#text-search-configuration). This example does not specify a configuration, and `english` is used by default. "How", "do", "on", and "the" are identified as stop words.
- Punctuation and capitalization.

In the preceding output, the integers indicate that `get` is in the fourth position, `internet` is in the seventh position, and `tree` is in the third position in the input.

### Form a query

A full-text search attempts to match a *query* to a document. A full-text search query has the [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %}) data type. Like `TSVECTOR`, a `TSQUERY` value consists of individual *lexemes*, which are normalized strings used for text matching. Lexemes in a `TSQUERY`  are separated with any combination of `&` (AND), `|` (OR), `<->` (FOLLOWED BY), or `!` (NOT) operators.

- The `to_tsquery()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) normalizes a `TSQUERY` input. The input must also be formatted as a `TSQUERY`, or the statement will error.

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT to_tsquery('How & do & trees & get & on & the & internet?');
    ~~~

    ~~~
              to_tsquery
    -------------------------------
      'tree' & 'get' & 'internet'
    ~~~

- The `plainto_tsquery()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) converts a string input into a `TSQUERY` value, and separates the lexemes with `&` (AND):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT plainto_tsquery('How do trees get on the internet?');
    ~~~

    ~~~
            plainto_tsquery
    -------------------------------
      'tree' & 'get' & 'internet'
    ~~~

- The `phraseto_tsquery()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) converts a string input into a `TSQUERY` value, and separates the lexemes with `<->` (FOLLOWED BY):

    ~~~ sql
    SELECT phraseto_tsquery('How do trees get on the internet?');
    ~~~

    ~~~
             phraseto_tsquery
    -----------------------------------
      'tree' <-> 'get' <3> 'internet'
    ~~~

    In the preceding output, `<->` (equivalent to `<1>`) indicates that `get` must follow `tree` in a matching `TSVECTOR`. `<3>` further indicates that `get` and `internet` must be separated by **two** lexemes in a matching `TSVECTOR`. This resulted from converting the stop words "on" and "the" in the input.

    To match this query, a document must therefore contain phrases such as "get tree" and "get {word} {word} internet".

Queries and documents are matched using the [`@@` comparison operator](#comparisons). For usage examples, see [Match queries to documents](#match-queries-to-documents).

### Rank search results

You can rank the results of a full-text search.

The `ts_rank()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) outputs a search rank based on the frequency of matching lexemes. In the following example, two lexemes match:

~~~ sql
SELECT ts_rank(to_tsvector('How do trees get on the internet?'), plainto_tsquery('how to get internet'));
~~~

{% include_cached copy-clipboard.html %}
~~~
   ts_rank
--------------
  0.09735848
~~~

In this example, three lexemes match, resulting in a higher rank:

~~~ sql
SELECT ts_rank(to_tsvector('How do trees get on the internet?'), plainto_tsquery('wow, do trees get internet?'));
~~~

{% include_cached copy-clipboard.html %}
~~~
   ts_rank
--------------
  0.26426345
~~~

{{site.data.alerts.callout_info}}
Because a rank must be calculated for each matching document, ranking a full-text search can incur a performance overhead if there are many matching documents.
{{site.data.alerts.end}}

For more information about using `ts_rank()`, see the [PostgreSQL documentation](https://www.postgresql.org/docs/15/textsearch-controls.html#TEXTSEARCH-RANKING).

## Comparisons

Full-text searches support the following comparison operator:

- **matching**: [`@@`]({% link {{ page.version.version }}/functions-and-operators.md %}#operators). This operator is set between a `TSQUERY` and `TSVECTOR`, and returns `true` if the lexemes match. The `TSQUERY` and `TSVECTOR` can be specified in any order.

For usage examples, see [Match queries to documents](#match-queries-to-documents).

## Full-text indexes

{{site.data.alerts.callout_info}}
You can perform full-text searches without a full-text index. However, an index will drastically improve search performance when searching a large number of documents.
{{site.data.alerts.end}}

To create a full-text index, use the [`CREATE INDEX`]({% link {{ page.version.version }}/create-index.md %}) syntax that defines an [inverted index]({% link {{ page.version.version }}/inverted-indexes.md %}), specifying a `TSVECTOR` column.

- Using the PostgreSQL-compatible syntax:

    ~~~ sql
    CREATE INDEX {optional name} ON {table} USING GIN ({column});
    ~~~

    {{site.data.alerts.callout_info}}
    GIN and GiST indexes are implemented identically on CockroachDB. `GIN` and `GIST` are therefore synonymous when defining a full-text index.
    {{site.data.alerts.end}}

- Using `CREATE INVERTED INDEX`:

    ~~~ sql
    CREATE INVERTED INDEX {optional name} ON {table} ({column});
    ~~~

For more ways to define full-text indexes, see [Create a full-text index with an expression](#create-a-full-text-index-with-an-expression) and [Create a full-text index with a stored computed column](#create-a-full-text-index-with-a-stored-computed-column).

## Text search configuration

A *text search configuration* determines how inputs are parsed into `TSVECTOR` and `TSQUERY` values. This includes a dictionary that is used to identify derivatives of words, as well as stop words to exclude when normalizing [documents](#process-a-document) and [queries](#form-a-query).

The supported dictionaries are English, Danish, Dutch, Finnish, French, German, Hungarian, Italian, Norwegian, Portuguese, Russian, Spanish, Swedish, and Turkish. An additional `simple` dictionary does not perform stemming or stopwording when normalizing [documents](#process-a-document) or [queries](#form-a-query).

You can specify a text search configuration as the first parameter when calling any of the [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to [process a document](#process-a-document) or [form a query](#form-a-query). For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('swedish', 'Hur får träd tillgång till internet?');
~~~

~~~
                 to_tsvector
----------------------------------------------
  'får':2 'internet':6 'tillgång':4 'träd':3
~~~

If you do not specify a configuration when calling the function, the value of the [`default_text_search_config`]({% link {{ page.version.version }}/set-vars.md %}#default-text-search-config)  session variable is used. This defaults to `english` and can be changed as follows:

{% include_cached copy-clipboard.html %}
~~~ sql
SET default_text_search_config = swedish;
~~~

For more information about text search configurations, see the [PostgreSQL documentation](https://www.postgresql.org/docs/current/textsearch-intro.html#TEXTSEARCH-INTRO-CONFIGURATIONS).

{{site.data.alerts.callout_info}}
At this time, only the dictionary can be specified in a text search configuration. See [Unsupported features](#unsupported-features).
{{site.data.alerts.end}}

## Examples

### Match queries to documents

Use the `@@` operator to match a query (`TSQUERY`) to a searchable document (`TSVECTOR`). In the following example, because the `TSQUERY` comprises the lexemes `get` and `internet`, which are both contained in the `TSVECTOR`, the output will be `true`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('How do trees get on the internet?') @@ to_tsquery('How & to & get & internet?');
~~~

~~~
  ?column?
------------
     t
~~~

Use the `plainto_tsquery()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to match text to a searchable document. This search is equivalent to the preceding example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('How do trees get on the internet?') @@ plainto_tsquery('How to get internet?');
~~~

~~~
  ?column?
------------
     t
~~~

Use the `phraseto_tsquery()` [built-in function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) to match text phrases to a searchable document. Because `phraseto_tsquery()` separates the lexemes `get` and `internet` with the `<->` (FOLLOWED BY) operator, and the document does not contain a phrase like "get internet", the output will be `false`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT to_tsvector('How do trees get on the internet?') @@ phraseto_tsquery('How to get internet?');
~~~

~~~
  ?column?
------------
     f
~~~

For an example of how text matching is used on a table, see [Perform a full-text search with ranked results](#perform-a-full-text-search-with-ranked-results).

### Create a full-text index with an expression

You can create an [expression index]({% link {{ page.version.version }}/expression-indexes.md %}) on a `STRING` column, using [`to_tsvector()`](#process-a-document) to convert the value to `TSVECTOR`.

Given the table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (a STRING);
~~~

Create an expression index that converts column `a` to `TSVECTOR`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE INDEX ON t USING GIN (to_tsvector('english', a));
~~~

{{site.data.alerts.callout_info}}
When using a [full-text search function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) in an expression index, you **must** specify a [text search configuration](#text-search-configuration). In the preceding example, the `english` configuration is specified.
{{site.data.alerts.end}}

### Create a full-text index with a stored computed column

You can create a full-text index on a [stored computed column]({% link {{ page.version.version }}/computed-columns.md %}) that has a `TSVECTOR` data type.

Given the table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE t (a STRING);
~~~

Add a new `TSVECTOR` column that is computed from `a` using [`to_tsvector()`](#process-a-document):

{% include_cached copy-clipboard.html %}
~~~ sql
ALTER TABLE t ADD COLUMN b TSVECTOR 
  AS (to_tsvector('english', a)) STORED;
~~~

{{site.data.alerts.callout_info}}
When using a [full-text search function]({% link {{ page.version.version }}/functions-and-operators.md %}#full-text-search-functions) in a stored generated column, you **must** specify a [text search configuration](#text-search-configuration). In the preceding example, the `english` configuration is specified.
{{site.data.alerts.end}}

View the columns on the table:

{% include_cached copy-clipboard.html %}
~~~ sql
SHOW COLUMNS FROM t;
~~~

~~~
  column_name | data_type | is_nullable | column_default |   generation_expression   |       indices       | is_hidden
--------------+-----------+-------------+----------------+---------------------------+---------------------+------------
  a           | STRING    |      t      | NULL           |                           | {t_pkey}            |     f
  rowid       | INT8      |      f      | unique_rowid() |                           | {t_expr_idx,t_pkey} |     t
  b           | TSVECTOR  |      t      | NULL           | to_tsvector('english', a) | {t_pkey}            |     f
(3 rows)
~~~

Create an inverted index on the `TSVECTOR` column:

~~~ sql
CREATE INDEX ON t USING GIN (b);
~~~

### Perform a full-text search with ranked results

1. Create a table with `STRING` columns:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE dadjokes (opener STRING, response STRING);
	~~~

1. Populate the table with sample values. These are the documents that you will search:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	INSERT INTO dadjokes (opener, response) VALUES
	  ('How do trees get on the internet?', 'They log on.'),
	  ('What do you call a pony with a sore throat?', 'A little horse.'),
	  ('What would a bathroom for fancy cats be called?', 'The glitter box.'),
      ('Why did the scarecrow win an award?', 'It was outstanding in its field.'),
      ('What kind of tree fits in your hand?', 'A palm tree.'),
      ('What was a better invention than the first telephone?', 'The second one.'),
      ('Where do you learn to make banana splits?', 'At sundae school.'),
      ('How did the hipster burn the roof of his mouth?', 'He ate the pizza before it was cool.'),
      ('What did one wall say to the other wall?', 'Meet you at the corner.'),
      ('When does a joke become a dad joke?', 'When it becomes apparent.');
	~~~

1. You can use `LIKE` or `ILIKE` to search for text. However, the results will be unranked:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT opener, response
    FROM dadjokes
    WHERE opener LIKE '%tree%' OR response LIKE '%tree%';
    ~~~

    ~~~
                     opener                |   response
    ---------------------------------------+---------------
      How do trees get on the internet?    | They log on.
      What kind of tree fits in your hand? | A palm tree.
    (2 rows)
    ~~~

1. Create a full-text index on the concatenation of both table columns, specifying a [text search configuration](#text-search-configuration) (in this case, `english`), as is mandatory when [defining an expression index](#create-a-full-text-index-with-an-expression):

	~~~ sql
	CREATE INDEX ON dadjokes USING GIN (to_tsvector('english', opener || response));
	~~~

    {{site.data.alerts.callout_info}}
    Because inverted joins on `TSVECTOR` values are not yet supported, this index won't be used to accelerate the SQL queries in this example. See [Unsupported features](#unsupported-features).
    {{site.data.alerts.end}}

1. Search the table for a query (in this case, `tree`), and rank the results.

    In the following statement, [`to_tsvector()`](#process-a-document) makes the table values searchable, [`to_tsquery()`](#form-a-query) forms the query, and [`ts_rank()`](#rank-search-results) calculates the search rankings:

    ~~~ sql
    SELECT opener, response, ts_rank(joke, query) AS rank
    FROM dadjokes, to_tsvector(opener || response) joke, to_tsquery('tree') query
    WHERE query @@ joke
    ORDER BY rank DESC
    LIMIT 10;
    ~~~

    ~~~
                     opener                |   response   |    rank
    ---------------------------------------+--------------+--------------
      What kind of tree fits in your hand? | A palm tree. | 0.075990885
      How do trees get on the internet?    | They log on. |  0.06079271
    (2 rows)
    ~~~

    The frequency of the `tree` lexeme in each row determines the difference in the rankings.

1. Search the table for the query `calling`, and rank the results:
    
    ~~~ sql
    SELECT opener, response, ts_rank(joke, query) AS rank
    FROM dadjokes, to_tsvector(opener || response) joke, to_tsquery('calling') query
    WHERE query @@ joke
    ORDER BY rank DESC
    LIMIT 10;
    ~~~

    ~~~
                          opener                      |     response     |    rank
    --------------------------------------------------+------------------+-------------
      What would a bathroom for fancy cats be called? | The glitter box. | 0.06079271
      What do you call a pony with a sore throat?     | A little horse.  | 0.06079271
    (2 rows)
    ~~~

    Unlike pattern matching with `LIKE` and `ILIKE`, a full-text search for `calling` produced matches. This is because [`to_tsvector()`](#process-a-document) and [`to_tsquery()`](#form-a-query) each normalized derivatives of the word "call" in their respective inputs to the lexeme `call`, using the default `english` [text search configuration](#text-search-configuration).

1. Use [`plainto_tsquery()`](#form-a-query) to convert text input to a search query:

    ~~~ sql
    SELECT opener, response, ts_rank(joke, query) AS rank
    FROM dadjokes, to_tsvector(opener || response) joke, plainto_tsquery('no more joking, dad') query
    WHERE query @@ joke
    ORDER BY rank DESC
    LIMIT 10;
    ~~~

    ~~~
                    opener                |         response          |    rank
    --------------------------------------+---------------------------+-------------
      When does a joke become a dad joke? | When it becomes apparent. | 0.18681315
    (1 row)
    ~~~

1. Alternatively, use [`phraseto_tsquery()`](#form-a-query) to search for matching text phrases (in this example, "joke dad"):

    ~~~ sql
    SELECT opener, response, ts_rank(joke, query) AS rank
    FROM dadjokes, to_tsvector(opener || response) joke, phraseto_tsquery('no more joking, dad') query
    WHERE query @@ joke
    ORDER BY rank DESC
    LIMIT 10;
    ~~~

    ~~~
      opener | response | rank
    ---------+----------+-------
    (0 rows)
    ~~~

## Unsupported features

Some PostgreSQL syntax and features are unsupported. These include, but are not limited to:

{% include {{ page.version.version }}/known-limitations/full-text-search-unsupported.md %}

## See also

- PostgreSQL documentation on [Full Text Search](https://www.postgresql.org/docs/current/textsearch.html)
- [`TSVECTOR`]({% link {{ page.version.version }}/tsvector.md %})
- [`TSQUERY`]({% link {{ page.version.version }}/tsquery.md %})
- [Inverted indexes]({% link {{ page.version.version }}/inverted-indexes.md %})
- [Indexes]({% link {{ page.version.version }}/indexes.md %})
- [SQL Statements]({% link {{ page.version.version }}/sql-statements.md %})