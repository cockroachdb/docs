---
title: sql: fix BCE timestamptz wire format for LMT-affected zones
summary: Enhanced Functionality
toc: true
docs_area: reference.sql
---

## Enhanced Functionality

### Timezone Abbreviation Parsing Support

CockroachDB now supports timezone abbreviations in timestamp literals, which previously returned "unimplemented" errors.

**Examples**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Timezone abbreviations now work in timestamptz literals
SELECT '2014-07-15 08:15:23 EST'::timestamptz;
----
2014-07-15 08:15:23-05

SELECT '2014-07-15 08:15:23 PST'::timestamptz;
----
2014-07-15 08:15:23-08

-- Case-insensitive parsing
SELECT '2014-07-15 08:15:23 est'::timestamptz;
----
2014-07-15 08:15:23-05
~~~

### pg_timezone_abbrevs System Table

The `pg_catalog.pg_timezone_abbrevs` system table is now fully implemented and lists timezone abbreviations recognized by date/time literal parsing.

**Example**:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT abbrev, utc_offset, is_dst
FROM pg_catalog.pg_timezone_abbrevs
WHERE abbrev IN ('EST', 'EDT', 'PST', 'PDT')
ORDER BY abbrev;
----
abbrev | utc_offset | is_dst
-------+------------+-------
EDT    | -04:00:00  | true
EST    | -05:00:00  | false
PDT    | -07:00:00  | true
PST    | -08:00:00  | false
~~~

### Improved BCE (Before Common Era) Date Handling

The `make_date`, `make_timestamp`, and `make_timestamptz` functions now handle BCE dates more consistently with PostgreSQL standards.

**Examples**:

{% include_cached copy-clipboard.html %}
~~~ sql
-- Negative years represent BCE dates
SELECT make_date(-2013, 7, 15);
----
2013-07-15 BC

-- Year -1 maps to 1 BC (no year zero in SQL semantics)
SELECT make_date(-1, 1, 1);
----
0001-01-01 BC

SELECT make_timestamp(-2013, 7, 15, 8, 15, 23.5);
----
2013-07-15 08:15:23.5 BC

SELECT make_timestamptz(-2013, 7, 15, 8, 15, 23.5);
----
2013-07-15 08:15:23.5-05 BC
~~~

### Updated Function Descriptions

The function descriptions for date/time creation functions have been simplified to remove references to ISO 8601 formatting, focusing on their core functionality:

- `make_date()`: Create date from year, month, and day fields (negative years signify BC)
- `make_timestamp()`: Create timestamp from year, month, day, hour, minute, and seconds fields (negative years signify BC)  
- `make_timestamptz()`: Create timestamp with time zone from year, month, day, hour, minute and seconds fields (negative years signify BC)

These improvements enhance CockroachDB's PostgreSQL compatibility, particularly for applications that rely on timezone abbreviations or work with historical dates.
