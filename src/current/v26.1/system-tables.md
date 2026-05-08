---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: New System Table Implementation
toc: true
docs_area: reference.sql
---

## New System Table Implementation

### `pg_catalog.pg_timezone_abbrevs`

**Description**: Lists timezone abbreviations recognized by date/time literal parsing. This table provides the mapping between common timezone abbreviations (like EST, PST, CET) and their corresponding UTC offsets and daylight saving time status, enabling PostgreSQL-compatible timestamp parsing with abbreviated timezone names.

**Columns**:

| Column | Type | Description |
| --- | --- | --- |
| `abbrev` | STRING | timezone abbreviation (e.g., EST, PST, CET) |
| `utc_offset` | INTERVAL | offset from UTC as an interval (e.g., -05:00:00 for EST) |
| `is_dst` | BOOL | whether this abbreviation represents daylight saving time |

**Example**:
{% include_cached copy-clipboard.html %}
~~~ sql
SELECT abbrev, utc_offset, is_dst 
FROM pg_catalog.pg_timezone_abbrevs 
WHERE abbrev IN ('EST', 'PST', 'UTC');
~~~

~~~
  abbrev | utc_offset | is_dst
---------+------------+--------
  EST    | -05:00:00  | false
  PST    | -08:00:00  | false
  UTC    | 00:00:00   | false
~~~

**Status Change**: This table was previously marked as unimplemented and has now been fully implemented. It enables parsing of timestamp literals with timezone abbreviations, resolving issue #31710.

**See also**:
- [`pg_timezone_names`]({% link {{ page.version.version }}/pg-catalog.md %}#pg_timezone_names) for full timezone names
- [Date and time data types]({% link {{ page.version.version }}/date.md %}) for timestamp handling
- [`make_timestamptz()`]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions) function that can now accept timezone abbreviations
