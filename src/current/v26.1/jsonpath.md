---
title: JSONPath Queries
summary: Use JSONPath expressions, functions, operators, and methods to navigate, extract, and transform JSONB data.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include_cached feature-phases/preview.md %}
{{site.data.alerts.end}}

JSONPath expressions and functions are used to query and filter [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) data. A [JSONPath expression](#jsonpath-expression) is a string that identifies one or more elements in a JSON document, and is used as a [JSONPath function](#jsonpath-functions) argument.

[GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}) on `JSONB` columns automatically accelerate [`jsonb_path_exists`](#jsonpath-functions) queries in certain [filter patterns](#index-accelerated-patterns). This can significantly improve query performance when filtering large datasets.

## JSONPath expression

A JSONPath expression consists of an optional [mode](#structural-error-handling) (`lax` or `strict`), followed by a scalar expression (such as `1 + 2`), a predicate expression (such as `1 != 2` or `exists($)`), or a path-based expression rooted at `$`. A path-based expression is composed of one or more [accessor](#accessor-operators) operators that are optionally interleaved with one or more [filter expressions](#filter-expressions) introduced by `?`. Expressions can optionally include scalar expressions, [predicate operators](#predicate-operators) for conditional logic, and a [method](#methods) applied to the current value. The path is evaluated left to right, and each stage refines or filters the result.

### Variables

Use the following variables in path and [filter expressions](#filter-expressions) to reference parts of the JSON document or external values.

| Variable |                                 Description                                 |             Example usage              |
|----------|-----------------------------------------------------------------------------|----------------------------------------|
| `$`      | Root of the JSON document.                                                  | `$.players[0]`                         |
| `@`      | Current item being evaluated in a [filter expression](#filter-expressions). | `@.team == "Lakers"`                   |
| `$var`   | A named variable defined in the `var` argument.                             | `@.price > $min` (with `{"min": 100}`) |

### Operators

#### Accessor operators

Use the following operators in path expressions to navigate JSON objects and arrays.

|    Operator    |                       Description                        |                 Example usage                  |
|----------------|----------------------------------------------------------|------------------------------------------------|
| `.key`         | Access a named field `key` in a JSON object.             | `$.players`                                    |
| `.*`           | Access all fields in the current object.                 | `$.stats.*`                                    |
| `.key[a]`      | Access a specific `a` element in an array field.         | `$.players[0]`                                 |
| `.key[a to b]` | Access an index range from `a` to `b` in an array field. | `$.players[0 to 3]`                            |
| `.key[last]`   | Access the last index element in an array field.         | `$.players[last]`                              |
| `.key[*]`      | Access all elements in an array field.                   | `$.players[*]`                                 |
| `.$var`        | Access the field named by a variable `var`.              | `$.players[0].$field` (with `$field = "name"`) |

#### Predicate operators

Use the following operators in [predicate check expressions](#check-expressions) to compare values, evaluate conditions, and combine logical clauses.

<table>
  <thead>
    <tr>
      <th>Operator</th>
      <th>Description</th>
      <th>Example usage</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><code>==</code></td>
      <td>Equality</td>
      <td><code>@.team == "Lakers"</code></td>
    </tr>
    <tr>
      <td><code>!=</code></td>
      <td>Inequality</td>
      <td><code>@.name != "Luka"</code></td>
    </tr>
    <tr>
      <td><code>&gt;</code></td>
      <td>Greater than</td>
      <td><code>@.stats.ppg &gt; 25</code></td>
    </tr>
    <tr>
      <td><code>&lt;</code></td>
      <td>Less than</td>
      <td><code>@.stats.ppg &lt; 30</code></td>
    </tr>
    <tr>
      <td><code>&gt;=</code></td>
      <td>Greater than or equal to</td>
      <td><code>@.stats.rpg &gt;= 10</code></td>
    </tr>
    <tr>
      <td><code>&lt;=</code></td>
      <td>Less than or equal to</td>
      <td><code>@.stats.apg &lt;= 4</code></td>
    </tr>
    <tr>
      <td><code>starts with</code></td>
      <td>String prefix match</td>
      <td><code>@.name starts with "A"</code></td>
    </tr>
    <tr>
      <td><code>like_regex</code></td>
      <td>Regex string match</td>
      <td><code>@.name like_regex "^L.*"</code></td>
    </tr>
    <tr>
      <td><code>is unknown</code></td>
      <td>True if expression evaluates to <code>null</code></td>
      <td><code>(@.age &gt; 25) is unknown</code></td>
    </tr>
    <tr>
      <td><code>!</code></td>
      <td>Logical NOT</td>
      <td><code>!(@.team == "Mavericks")</code></td>
    </tr>
    <tr>
      <td><code>&amp;&amp;</code></td>
      <td>Logical AND</td>
      <td><code>@.ppg &gt; 20 &amp;&amp; @.team == "Lakers"</code></td>
    </tr>
    <tr>
      <td><code>||</code></td>
      <td>Logical OR</td>
      <td><code>@.ppg &gt; 20 || @.team == "Lakers"</code></td>
    </tr>
  </tbody>
</table>

### Methods

Append the following methods to a path (after `.`) to access or transform the value. For examples, refer to [Access using methods](#access-using-methods).

|    Method   |                               Description                               |           Example usage            |
|-------------|-------------------------------------------------------------------------|------------------------------------|
| `size()`    | Returns the size of an array, or `1` for a scalar.                      | `$.players.size()`                 |
| `type()`    | Returns the type of the current value as a string.                      | `$.players[0].stats.type()`        |
| `abs()`     | Returns the absolute value of a number.                                 | `$.players[0].stats.ppg.abs()`     |
| `floor()`   | Returns the nearest integer less than or equal to the current value.    | `$.players[1].stats.ppg.floor()`   |
| `ceiling()` | Returns the nearest integer greater than or equal to the current value. | `$.players[1].stats.ppg.ceiling()` |

## JSONPath functions

Use JSONPath functions to extract or evaluate target `JSONB` data according to a specified [path](#jsonpath-expression). For full details on JSONPath functions, refer to [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}#jsonpath-functions).

|                  Function                 |                                                                           Description                                                                            | If no match |
|-------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------|
| `jsonb_path_exists(jsonb, jsonpath)`      | Returns true if any match is found. Accelerated by GIN indexes for certain [filter patterns](#index-accelerated-patterns).                                       | `false`     |
| `jsonb_path_match(jsonb, jsonpath)`       | Returns true if the path expression evaluates to true. Only useful with [predicate check expressions](#check-expressions), as it expects a single Boolean value. | `false`     |
| `jsonb_path_query(jsonb, jsonpath)`       | Returns all matches as a set of `JSONB` values.                                                                                                                  | `NULL`      |
| `jsonb_path_query_array(jsonb, jsonpath)` | Returns all matches as a single `JSONB` array.                                                                                                                   | `[]`        |
| `jsonb_path_query_first(jsonb, jsonpath)` | Returns the first match only.                                                                                                                                    | `NULL`      |

Each function accepts two required and two optional arguments as follows:

- `target` (required): A [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) value to access.
- `path` (required): A [JSONPath expression](#jsonpath-expression).
- `vars` (optional): A [`JSONB`]({% link {{ page.version.version }}/jsonb.md %}) value referenced as a variable in the path.
- `silent` (optional): A Boolean value that specifies whether to throw errors during execution. If not specified, this is `false`.

## Example setup

To follow the examples on this page, create and populate the following table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE stats (data JSONB);

INSERT INTO stats VALUES (
    '{
      "season": "2023-24",
      "players": [
        {
          "name": "Anthony Davis",
          "team": "Lakers",
          "stats": {
            "ppg": 24.7,
            "apg": 3.5,
            "rpg": 12.6
          }
        },
        {
          "name": "Jayson Tatum",
          "team": "Celtics",
          "stats": {
            "ppg": 26.9,
            "apg": 4.9,
            "rpg": 8.1
          }
        },
        {
          "name": "Luka Doncic",
          "team": "Mavericks",
          "stats": {
            "ppg": 33.9,
            "apg": 9.8,
            "rpg": 9.2
          }
        }
      ]
    }'
);
~~~

The examples use JSONPath functions, operators, and methods to navigate the preceding `JSONB` structure.

## Access `JSONB` content

Access `JSONB` content by passing a [JSONPath expression](#jsonpath-expression) to a [JSONPath function](#jsonpath-functions).

### Access entire document

To return the entire `JSONB` value, query the root accessor (`$`):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$') FROM stats;
~~~

~~~
                                                                                                                                                       jsonb_path_query
-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  {"players": [{"name": "Anthony Davis", "stats": {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}, "team": "Lakers"}, {"name": "Jayson Tatum", "stats": {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}, "team": "Celtics"}, {"name": "Luka Doncic", "stats": {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}, "team": "Mavericks"}], "season": "2023-24"}
  ~~~

### Access `JSONB` fields

To return a specific field in the `JSONB` value, query its corresponding key accessor.

The following query returns the `season` value from the root object:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.season') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "2023-24"
~~~

To access nested keys, append key accessors to their parent keys. The following query returns the `stats` value for each element in the `players` array, using the [array accessor](#access-jsonb-array-elements):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*].stats') FROM stats;
~~~

~~~
             jsonb_path_query
------------------------------------------
  {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}
  {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}
  {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}
~~~

Descending one more level, the following query returns the `ppg` value within the `stats` array for each player:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*].stats.ppg') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
              24.7
              26.9
              33.9
~~~

### Access `JSONB` array elements

Access `JSONB` array elements through their index value (`JSONB` arrays are 0-indexed), the `*` (any element) keyword, or the `last` (last element) keyword.

The following query returns the `name` value of the first element in the `players` array (i.e., the first player's name):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[0].name') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "Anthony Davis"
~~~

The following query returns the last player's name, using the `last` keyword:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[last].name') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "Luka Doncic"
~~~

The following query returns the array elements in the range 0-1:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[0 to 1]') FROM stats;
~~~

~~~
                                        jsonb_path_query
------------------------------------------------------------------------------------------------
  {"name": "Anthony Davis", "stats": {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}, "team": "Lakers"}
  {"name": "Jayson Tatum", "stats": {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}, "team": "Celtics"}
~~~

Use a comma-separated list to return the union of mulitple array accessors:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[1 to 2, 0]') FROM stats;
~~~

~~~
                                        jsonb_path_query
------------------------------------------------------------------------------------------------
  {"name": "Jayson Tatum", "stats": {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}, "team": "Celtics"}
  {"name": "Luka Doncic", "stats": {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}, "team": "Mavericks"}
  {"name": "Anthony Davis", "stats": {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}, "team": "Lakers"}
~~~

### Access using methods

You can use [JSONPath methods](#methods) to access or transform data in the path.

The following query returns the type of each value in the `players` array, using the `type()` method:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*].type()') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "object"
  "object"
  "object"
~~~

The following query returns the number of objects in the `players` array, using the `size()` method:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players.size()') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
                 3
~~~

The following query rounds down the `ppg` statistic for each player, using the `floor()` method:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*].stats.ppg.floor()') FROM stats;
~~~

Returns the floor of the PPG value.

~~~
  jsonb_path_query
--------------------
                24
                26
                33
~~~

## Check expressions

A JSONPath expression can be a *predicate check expression* that returns a Boolean value. Use one or more [predicate operators](#predicate-operators) to specify conditions such as equality, logical expressions, and existence. 

Each of the following check expressions evaluates to true:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[2].name == "Luka Doncic"') FROM stats;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[2].name starts with "L"') FROM stats;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[2].stats.ppg > 30') FROM stats;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '(($.players[2].team != "Lakers") && ($.players[1].stats.ppg > 25))') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  true
~~~

{{site.data.alerts.callout_info}}
The preceding check expressions can be used with the `jsonb_path_match` [function](#jsonpath-functions) for a similar result.
{{site.data.alerts.end}}

## Filter expressions

A *filter expression* uses a [predicate check expression](#check-expressions) to return `JSONB` fields that match a condition.

To write a filter expression, insert `?` into a JSONPath expression, followed by a check expression that uses `@` to reference each item selected by the preceding path step. The filter expression only returns items that evaluate to true.

For example, the following JSONPath expression selects all elements in an `items` array (`$.items[*]`), filters all items whose `price` value is greater than 100 (`(@.price > 100)`), and returns the `name` value for each filtered item (`.name`):

~~~
$.items[*] ? (@.price > 100).name;
~~~

<a name="index-accelerated-patterns"></a>

[GIN indexes]({% link {{ page.version.version }}/inverted-indexes.md %}) on `JSONB` columns automatically accelerate [`jsonb_path_exists`](#jsonpath-functions) when used in `WHERE` clause filters with the following patterns:

- Keychain mode (accessing nested fields): `$.[key|wildcard].[key|wildcard]...`
  - For example, `WHERE jsonb_path_exists(data, '$.players[*].stats.ppg')`
- Filter with equality check: `$.[key|wildcard]? (@.[key|wildcard]... == value)` where `value` is a string, number, `null`, or boolean
  - For example, `WHERE jsonb_path_exists(data, '$.players[*] ? (@.stats.ppg == 25)')`

Index acceleration is **not** supported for:

- [`strict` mode](#structural-error-handling) queries
- Root-level paths (`$` or `$[*]`)
- Filters with inequality checks (for example, `@.price > 100`)
- Comparison expressions without filters (for example, `$.a.b.c == 12`)

### Filter with comparison operators

The following query returns all players who averaged more than 25 points per game:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.stats.ppg > 25)') FROM stats;
~~~

~~~
                                        jsonb_path_query
------------------------------------------------------------------------------------------------
  {"name": "Jayson Tatum", "stats": {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}, "team": "Celtics"}
  {"name": "Luka Doncic", "stats": {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}, "team": "Mavericks"}
~~~

The following modification to the query returns only the player names:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.stats.ppg > 25).name') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "Jayson Tatum"
  "Luka Doncic"
~~~

You can sequence multiple filters in a query. The following query adds a filter on the `rpg` statistic to the preceding filter:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.stats.ppg > 25) ? (@.stats.rpg >= 9).name') FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
  "Luka Doncic"
~~~

To have a filter return a Boolean value, use the `jsonb_path_exists` [function](#jsonpath-functions). The following query evaluates whether any player averaged more than 25 points per game:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_exists(data, '$.players[*] ? (@.stats.ppg > 25)') FROM stats;
~~~

~~~
  jsonb_path_exists
---------------------
          t
~~~

### Filter with string matching

The following two queries use the `starts with` and `like_regex` operators to return the same result:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.team starts with "L")') FROM stats;
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.team like_regex "^L.*")') FROM stats;
~~~

~~~
                                        jsonb_path_query
------------------------------------------------------------------------------------------------
  {"name": "Anthony Davis", "stats": {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}, "team": "Lakers"}
~~~

## Variables in JSONPath expressions

Define a variable in a JSONPath expression by prefixing it with `$`. Then specify a value in the `vars` argument of the [JSONPath function](#jsonpath-functions).

The following query filters players whose `ppg` is greater than the value of the `min` variable:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, '$.players[*] ? (@.stats.ppg > $min)', '{"min": 25}') FROM stats;
~~~

~~~
                                        jsonb_path_query
------------------------------------------------------------------------------------------------
  {"name": "Jayson Tatum", "stats": {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}, "team": "Celtics"}
  {"name": "Luka Doncic", "stats": {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}, "team": "Mavericks"}
~~~

## Arithmetic operations

JSONPath expressions can include arithmetic:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query('{}', '1+1');
~~~

~~~
  jsonb_path_query
--------------------
                 2
~~~

## Control function output

### Return first match

Use the `jsonb_path_query_first` [function](#jsonpath-functions) to return the first query result. 

The following query returns the first `name` in the `players` array:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query_first(data, '$.players[*].name') FROM stats;
~~~

~~~
 jsonb_path_query_first 
------------------------
 "Anthony Davis"
~~~

### Return all matches as array

Use the `jsonb_path_query_array` [function](#jsonpath-functions) to return all query results as a `JSONB` array.

The following query returns all `team` values in a single array.

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query_array(data, '$.players[*].team') FROM stats;
~~~

~~~
        jsonb_path_query_array
--------------------------------------
  ["Lakers", "Celtics", "Mavericks"]
~~~

### Structural error handling

By default, JSONPath expressions are evaluated in `lax` mode, which tolerates structural mismatches between the path and the `JSONB` data:

- When the path contains keys that are missing in the `JSONB` structure, `NULL` or `false` values are returned, [depending on the function](#jsonpath-functions), rather than an error.
- Values are automatically wrapped into arrays or unwrapped from arrays. For example, the following query works without an array accessor because it unwraps the `players` array:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    SELECT jsonb_path_query(data, '$.players.stats') FROM stats;
    ~~~

    ~~~
                 jsonb_path_query
    ------------------------------------------
      {"apg": 3.5, "ppg": 24.7, "rpg": 12.6}
      {"apg": 4.9, "ppg": 26.9, "rpg": 8.1}
      {"apg": 9.8, "ppg": 33.9, "rpg": 9.2}
    ~~~

To enforce strict access rules, specify `strict` at the start of the path expression. The following query throws an error because it requires an explicit [array accessor](#access-jsonb-array-elements) for `players` (e.g., `players[*]`):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, 'strict $.players.stats') FROM stats;
~~~

~~~
ERROR: jsonpath member accessor can only be applied to an object
SQLSTATE: 2203A
~~~

However, setting `silent` to `true` in a [JSONPath function](#jsonpath-functions) suppresses any errors:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query(data, 'strict $.players.stats', '{}', true) FROM stats;
~~~

~~~
  jsonb_path_query
--------------------
~~~

### Order of evaluation with parentheses

A JSONPath expression is normally evaluated left to right, while respecting operator precedence.

For example, multiplication takes precedence over addition:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query('{}', '1 + 2 * 3');
~~~

~~~
  jsonb_path_query
--------------------
                 7
~~~

Use parentheses to override the default order:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT jsonb_path_query('{}', '(1 + 2) * 3');
~~~

~~~
  jsonb_path_query
--------------------
                 9
~~~

## Known limitations

{% include {{ page.version.version }}/known-limitations/jsonpath-limitations.md %}

## See also

- [JSONB]({% link {{ page.version.version }}/jsonb.md %})
- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})