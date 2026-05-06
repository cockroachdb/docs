---
title: LTREE
summary: The LTREE data type stores hierarchical tree-like structures as label paths.
toc: true
docs_area: reference.sql
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

The `LTREE` [data type]({% link {{ page.version.version }}/data-types.md %}) stores hierarchical tree-like structures as a *label path*, which is a sequence of dot-separated *labels*. Labels represent positions in a tree hierarchy. `LTREE` is useful for efficiently querying and managing hierarchical data without using recursive joins.

## Syntax

Each label in an `LTREE` label path represents a level in the hierarchy, beginning from the root (`Animals` in the following example):

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 'Animals.Mammals.Carnivora'::LTREE;
~~~

~~~
            ltree
-----------------------------
  Animals.Mammals.Carnivora
~~~

Each label in the path must contain only alphanumeric characters (`A`-`Z`, `a`-`z`, `0`-`9`), underscores (`_`), and hyphens (`-`). The maximum label length is 1,000 characters, and the maximum number of labels in a path is 65,535.

The following are valid `LTREE` values:

- `'Animals'`
- `'Products.Electronics.Laptops.Gaming'`
- `'project_a.phase-1.task_001'`
- `''` (empty path)

## Size

The size of an `LTREE` value is variable and equals the total number of characters in all labels plus the total number of dot separators. Cockroach Labs recommends keeping values below 64 kilobytes. Above that threshold, [write amplification]({% link {{ page.version.version }}/architecture/storage-layer.md %}#write-amplification) and other considerations may cause significant performance degradation.

## Operators

The following `LTREE` comparison and containment operators are valid:

- `=` (equals). Compare paths for equality.
- `<>`, `!=` (not equal to). Compare paths for inequality.
- `<`, `<=`, `>`, `>=` (ordering). Compare paths lexicographically.
- `@>` (is ancestor of). Returns `true` if the left operand is an ancestor of (or equal to) the right operand.
- `<@` (is descendant of). Returns `true` if the left operand is a descendant of (or equal to) the right operand.
- `||` (concatenate). Concatenate two `LTREE` paths.

For `LTREE` arrays, the following operators return the first matching element:

- `?@>` (array contains ancestor). Returns the first array element that is an ancestor of the operand.
- `?<@` (array contains descendant). Returns the first array element that is a descendant of the operand.

### Index acceleration

CockroachDB supports indexing `LTREE` columns. [Indexes]({% link {{ page.version.version }}/indexes.md %}) on `LTREE` columns accelerate the following operations:

- Comparison operators: `=`, `<>`, `!=`, `<`, `<=`, `>`, `>=`
- Containment operators: `@>`, `<@`

## Functions

The following [built-in functions]({% link {{ page.version.version }}/functions-and-operators.md %}#ltree-functions) are supported for `LTREE`:

| Function | Description |
|----------|-------------|
| `index(a ltree, b ltree [, offset])` | Returns the position of the first occurrence of `b` in `a`, optionally starting at `offset`. Returns `-1` if not found. |
| `lca(ltree, ltree, ...)` | Returns the longest common ancestor (longest common prefix) of the paths. Accepts unlimited arguments or an array. |
| `ltree2text(ltree)` | Converts an `LTREE` value to `STRING`. |
| `nlevel(ltree)` | Returns the number of labels in the path. |
| `subltree(ltree, start, end)` | Extracts a subpath from position `start` to position `end-1` (zero-indexed). |
| `subpath(ltree, offset [, length])` | Extracts a subpath starting at `offset`. If `offset` is negative, starts that far from the end. Optional `length` specifies how many labels to include. |
| `text2ltree(text)` | Converts a `STRING` value to `LTREE`. |

For more details, refer to [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %}).

## Supported casting and conversion

You can [cast]({% link {{ page.version.version }}/data-types.md %}#data-type-conversions-and-casts) `LTREE` values to the following data type:

- [`STRING`]({% link {{ page.version.version }}/string.md %})

For example:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 'Animals.Mammals.Carnivora'::LTREE::STRING;
~~~

~~~
            text
-----------------------------
  Animals.Mammals.Carnivora
~~~

## Examples

### Create a table with hierarchical data

Create a table to store an organizational hierarchy:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE org_structure (
    id INT PRIMARY KEY,
    path LTREE NOT NULL,
    name STRING,
    INDEX path_idx (path)
);
~~~

Insert some hierarchical data (labels that represent a media production company):

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO org_structure (id, path, name) VALUES
    (1, 'Studio', 'Production Studio'),
    (2, 'Studio.ShowA', 'Show A'),
    (3, 'Studio.ShowA.Season1', 'Season 1'),
    (4, 'Studio.ShowA.Season1.Episode1', 'Episode 1'),
    (5, 'Studio.ShowA.Season1.Episode2', 'Episode 2'),
    (6, 'Studio.ShowB', 'Show B'),
    (7, 'Studio.ShowB.Season1', 'Season 1'),
    (8, 'Studio.ShowB.Season1.Episode1', 'Episode 1');
~~~

### Query `LTREE` with comparison operator

Find all entries that come before `Studio.ShowB` using lexicographic ordering. The `<` operator returns entries where the path is lexicographically less than `Studio.ShowB`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT name, path FROM org_structure
WHERE path < 'Studio.ShowB'
ORDER BY path;
~~~

~~~
        name        |             path
--------------------+--------------------------------
  Production Studio | Studio
  Show A            | Studio.ShowA
  Season 1          | Studio.ShowA.Season1
  Episode 1         | Studio.ShowA.Season1.Episode1
  Episode 2         | Studio.ShowA.Season1.Episode2
(5 rows)
~~~

### Query `LTREE` with containment operator

Find all entries under `Show A` using the `<@` (is descendant of) operator:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT name, path FROM org_structure
WHERE path <@ 'Studio.ShowA'
ORDER BY path;
~~~

~~~
    name    |             path
------------+--------------------------------
  Show A    | Studio.ShowA
  Season 1  | Studio.ShowA.Season1
  Episode 1 | Studio.ShowA.Season1.Episode1
  Episode 2 | Studio.ShowA.Season1.Episode2
(4 rows)
~~~

Find all ancestors of `Episode 1` in `Show A` using the `@>` (is ancestor of) operator:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT name, path FROM org_structure
WHERE path @> 'Studio.ShowA.Season1.Episode1'
ORDER BY path;
~~~

~~~
        name        |             path
--------------------+--------------------------------
  Production Studio | Studio
  Show A            | Studio.ShowA
  Season 1          | Studio.ShowA.Season1
  Episode 1         | Studio.ShowA.Season1.Episode1
(4 rows)
~~~

### Use `LTREE` functions

Count the depth level of each entry using `nlevel()`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT name, path, nlevel(path) AS depth
FROM org_structure
ORDER BY path;
~~~

~~~
        name        |             path              | depth
--------------------+-------------------------------+--------
  Production Studio | Studio                        |     1
  Show A            | Studio.ShowA                  |     2
  Season 1          | Studio.ShowA.Season1          |     3
  Episode 1         | Studio.ShowA.Season1.Episode1 |     4
  Episode 2         | Studio.ShowA.Season1.Episode2 |     4
  Show B            | Studio.ShowB                  |     2
  Season 1          | Studio.ShowB.Season1          |     3
  Episode 1         | Studio.ShowB.Season1.Episode1 |     4
(8 rows)
~~~

Extract a subpath using `subpath()`, with an offset of 1:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT subpath('Studio.ShowA.Season1.Episode1'::LTREE, 1) AS subpath;
~~~

~~~
         subpath
--------------------------
  ShowA.Season1.Episode1
~~~

Extract the same subpath, but only show 2 labels:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT subpath('Studio.ShowA.Season1.Episode1'::LTREE, 1, 2) AS subpath;
~~~

~~~
     subpath
-----------------
  ShowA.Season1
~~~

Find the longest common ancestor of several `LTREE` values using `lca()`:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT lca(
    'Studio.ShowA.Season1.Episode1'::LTREE,
    'Studio.ShowA.Season1.Episode2'::LTREE,
    'Studio.ShowA.Season2.Episode1'::LTREE
) AS common_ancestor;
~~~

~~~
  common_ancestor
-------------------
  Studio.ShowA
~~~

### Concatenate two `LTREE` values

Build paths dynamically by concatenating two `LTREE` values using the `||` operator:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT 'Animals.Mammals'::LTREE || 'Carnivora.Felidae'::LTREE AS full_path;
~~~

~~~
              full_path
-------------------------------------
  Animals.Mammals.Carnivora.Felidae
~~~

## See also

- [Data Types]({% link {{ page.version.version }}/data-types.md %})
- [Functions and Operators]({% link {{ page.version.version }}/functions-and-operators.md %})
- [`STRING`]({% link {{ page.version.version }}/string.md %})
