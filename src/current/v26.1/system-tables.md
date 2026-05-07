---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: `pg_catalog.pg_timezone_abbrevs`
toc: true
docs_area: reference.sql
---

## `pg_catalog.pg_timezone_abbrevs`

**Description**: Lists the timezone abbreviations recognized by CockroachDB's date/time literal parsing. This table provides the standard PostgreSQL timezone abbreviations and their corresponding UTC offsets and daylight saving time flags.

**Columns**:

| Column | Type | Description |
| --- | --- | --- |
| `abbrev` | `STRING` | the timezone abbreviation (e.g., EST, PST, UTC) |
| `utc_offset` | `INTERVAL` | the UTC offset for this abbreviation as an interval |
| `is_dst` | `BOOLEAN` | whether this abbreviation represents daylight saving time |

**Example**:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT abbrev, utc_offset, is_dst 
FROM pg_catalog.pg_timezone_abbrevs 
WHERE abbrev IN ('EST', 'EDT', 'PST', 'PDT', 'UTC')
ORDER BY abbrev;
~~~

~~~
  abbrev | utc_offset | is_dst
---------+------------+--------
  EDT    | -04:00:00  |  true
  EST    | -05:00:00  | false
  PDT    | -07:00:00  |  true
  PST    | -08:00:00  | false
  UTC    | 00:00:00   | false
(5 rows)
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
-- Use timezone abbreviations in timestamp literals
SELECT '2014-07-15 08:15:23 EST'::timestamptz;
~~~

~~~
        timestamptz
---------------------------
  2014-07-15 08:15:23-05:00
(1 row)
~~~

**Details**:

- This table supports parsing timestamp literals with timezone abbreviations (e.g., `'2014-07-15 08:15:23 EST'::timestamptz`)
- Abbreviations resolve to fixed UTC offsets regardless of the host system's IANA tzdata
- Both uppercase and lowercase abbreviation input is accepted in timestamp parsing
- The table includes standard abbreviations like EST/EDT, PST/PDT, MST/MDT, CST/CDT, plus UTC and other international abbreviations
- This table was previously unimplemented and returned no rows; it now provides the full set of PostgreSQL-compatible timezone abbreviations

**See also**:

- [`pg_catalog.pg_timezone_names`]({% link {{ page.version.version }}/pg-catalog.md %}#pg_timezone_names) for named timezones
- [Timestamp and date/time functions]({% link {{ page.version.version }}/functions-and-operators.md %}#date-and-time-functions)
