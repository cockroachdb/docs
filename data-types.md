---
title: Data Types
toc: false
---

This page explains the data types supported by CockroachDB.

<div id="toc"></div>

## `INT`

The `INT` type stores 64-bit signed integers, that is, whole numbers from 9,223,372,036,854,775,808 to 9,223,372,036,854,775,807. 

#### Synonyms 

In CockroachDB, the following are synonyms of `INT` and are implemented identically: 

- `SMALLINT` 
- `INTEGER` 
- `INT64` 
- `BIGINT`
- `BITS`

#### Examples

~~~
CREATE TABLE ints (a INT PRIMARY KEY, b SMALLINT, c INTEGER);

SHOW COLUMNS FROM ints;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | INT  | true  | NULL    |
| c     | INT  | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO ints VALUES (11111, 22222, 33333);

SELECT * FROM ints;
+-------+-------+-------+
|   a   |   b   |   c   |
+-------+-------+-------+
| 11111 | 22222 | 33333 |
+-------+-------+-------+
~~~

## `DECIMAL`

The `DECIMAL` type exact, fixed-point numbers with no limit on digits to the left and right of the decimal point. This type is used when it is important to preserve exact precision, for example, with monetary data. 

#### Synonyms

In CockroachDB, the following are synonyms of `DECIMAL` and are implemented identically:

- `DEC` 
- `NUMERIC` 

#### Precision and Scale

Precision (the maximum count of digits in a whole number, both to the left and right of the decimal point) and scale (the maximum count of digits to the right of the decimal point) are always unlimited for a `DECIMAL` value. If you specify these limits by declaring `DECIMAL(precision, scale)` on a column, they will not be enforced. 

#### Format

When declaring a decimal, format it as `DECIMAL '1.2345'`. This casts the value as a string, which preserves the number's exact precision.

Alternately, you can cast a `FLOAT` as a `DECIMAL`, but note that precision will be limited to 17 digits in total (both to the left and right of the decimal point):

- `1.2345::DECIMAL`
- `CAST (1.2345 AS DECIMAL)`

#### Examples

~~~
CREATE TABLE decimals (a DECIMAL PRIMARY KEY, b NUMERIC);

SHOW COLUMNS FROM decimals;
+-------+---------+-------+---------+
| Field |  Type   | Null  | Default |
+-------+---------+-------+---------+
| a     | DECIMAL | false | NULL    |
| b     | DECIMAL | true  | NULL    |
+-------+---------+-------+---------+

INSERT INTO decimals VALUES (DECIMAL '1.01234567890123456789', 2.01234567890123456789::DECIMAL);

SELECT * FROM decimals;
+------------------------+--------------------+
|           a            |         b          |
+------------------------+--------------------+
| 1.01234567890123456789 | 2.0123456789012346 |
+------------------------+--------------------+
# The value in "a" is precise, while the value in "b" has been limited to 17 digits.
~~~

## `FLOAT`

The `FLOAT` type stores inexact, floating-point numbers with up to 17 digits in total and at least one digit to the right of the decimal point. 

#### Synonyms

In CockroachDB, the following are synonyms of `FLOAT` and are implemented identically:

- `REAL` 
- `DOUBLE PRECISION` 

#### Format

When declaring a float, format it as `1.2345`. 

Alternately, you can declare a float as `+Inf` (positive infinity), `-Inf` (negative infinity), or `NaN` (not a number) as follows:

- `CAST('+Inf' AS FLOAT)`
- `CAST('-Inf' AS FLOAT)`
- `CAST('NaN' AS FLOAT)`

#### Examples

~~~
CREATE TABLE floats (a FLOAT PRIMARY KEY, b REAL, c DOUBLE PRECISION);

SHOW COLUMNS FROM floats;
+-------+-------+-------+---------+
| Field | Type  | Null  | Default |
+-------+-------+-------+---------+
| a     | FLOAT | false | NULL    |
| b     | FLOAT | true  | NULL    |
| C     | FLOAT | true  | NULL    |
+-------+-------+-------+---------+

INSERT INTO floats VALUES (1.012345678901, 2.01234567890123456789, CAST('+Inf' AS FLOAT));

SELECT * FROM floats;
+----------------+--------------------+------+
|       a        |         b          |  c   |
+----------------+--------------------+------+
| 1.012345678901 | 2.0123456789012346 | +Inf |
+----------------+--------------------+------+
# Note that the value in "a" has been limited to 17 digits.
~~~

## `BOOL`

The `BOOL` type stores a Boolean value of `false` or `true`. 

#### Synonyms

In CockroachDB, `BOOLEAN` is a synonym of `BOOL` and is implemented identically. 

#### Format

When declaring a `BOOL`, format it as `false` or `true`. 

Alternately, you can cast `0` or `1` as a `BOOL`:

- `0::bool` (false) 
- `1::bool` (true)

#### Examples

~~~
CREATE TABLE bool (a INT PRIMARY KEY, b BOOL, c BOOLEAN);

SHOW COLUMNS FROM bool;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | INT  | false | NULL    |
| b     | BOOL | true  | NULL    |
| c     | BOOL | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO bool VALUES (12345, true, 0::bool);

SELECT * FROM bool;
+-------+------+-------+
|   a   |  b   |   c   |
+-------+------+-------+
| 12345 | true | false |
+-------+------+-------+
~~~

## `DATE`

The `DATE` type stores a date.

#### Format

When declaring a `DATE`, format it as `DATE 'YYYY-MM-DD'`. Note that the date is stored with hour, minute, and second set to 0.

#### Examples

~~~
CREATE TABLE date (a DATE PRIMARY KEY, b INT);

SHOW COLUMNS FROM date;
+-------+------+-------+---------+
| Field | Type | Null  | Default |
+-------+------+-------+---------+
| a     | DATE | false | NULL    |
| b     | INT  | true  | NULL    |
+-------+------+-------+---------+

INSERT INTO date VALUES (DATE '2016-03-26', 12345);

SELECT * FROM date;
+---------------------------------+-------+
|                a                |   b   |
+---------------------------------+-------+
| 2016-03-26 00:00:00 +0000 +0000 | 12345 |
+---------------------------------+-------+
~~~


## `TIMESTAMP`

The `TIMESTAMP` type stores a date and time pair in UTC. 

#### Format

When declaring a `TIMESTAMP`, use one of the following formats:

- Date only: `TIMESTAMP '2016-01-25'`
- Date and Time: `TIMESTAMP '2016-01-25 10:10:10.999999999'`
- With Timezone Offset from UTC: `TIMESTAMP '2016-01-25 10:10:10.999999999-5:00'`
- ISO 8601: `TIMESTAMP '2016-01-25T10:10:10.999999999`

At least the year, month, and day must be provided. 

#### Examples

~~~
CREATE TABLE timestamp (a INT PRIMARY KEY, b TIMESTAMP);

SHOW COLUMNS FROM date;
+-------+-----------+-------+---------+
| Field |   Type    | Null  | Default |
+-------+-----------+-------+---------+
| a     | INT       | false | NULL    |
| b     | TIMESTAMP | true  | NULL    |
+-------+-----------+-------+---------+

INSERT INTO timestamp VALUES (1111, TIMESTAMP '2016-03-26 10:10:10-05:00'), (2222, TIMESTAMP '2016-03-26');

SELECT * FROM timestamp;
+------+---------------------------------+
|  a   |                b                |
+------+---------------------------------+
| 1111 | 2016-03-26 15:10:10 +0000 +0000 |
| 2222 | 2016-03-26 00:00:00 +0000 +0000 |
+------+---------------------------------+
# Note that the first timestamp is UTC-05:00, which is the equivalent of EST.
~~~

## `INTERVAL`

The `INTERVAL` type stores a value that represents a span of time. 

#### Format

When declaring an `INTERVAL`, format it as `INTERVAL '2h30m30s'`, where the following units can be specified either as positive or negative decimal numbers:

- `h` (hour)
- `m` (minute)
- `s` (second)
- `ms` (millisecond)
- `us` (microsecond)
- `ns` (nanosecond)

Regardless of the units used, the interval is stored as hour, minute, and second. 

#### Examples

~~~
CREATE TABLE intervals (a INT PRIMARY KEY, b INTERVAL);

SHOW COLUMNS FROM intervals;
+-------+----------+-------+---------+
| Field |   Type   | Null  | Default |
+-------+----------+-------+---------+
| a     | INT      | false | NULL    |
| b     | INTERVAL | true  | NULL    |
+-------+----------+-------+---------+

INSERT INTO intervals VALUES (1111, INTERVAL '2h30m50ns'), (2222, INTERVAL '-2h30m50ns');

SELECT * FROM intervals;
+------+-------------------+
|  a   |         b         |
+------+-------------------+
| 1111 | 2h30m0.00000005s  |
| 2222 | -2h30m0.00000005s |
+------+-------------------+
~~~

## `STRING`

The `STRING` type stores strings of variable, unlimited length. 

#### Synonyms 

In CockroachDB, the following are synonyms of `STRING` and are implemented identically: 

- `CHAR` 
- `CHAR(n)` 
- `VARCHAR`
- `VARCHAR(n)` 
- `TEXT`

#### Length

Length is always variable and unlimited for a `STRING` value. If you specify a fixed-length by declaring `CHAR(n)` or `VARCHAR(n)` on a column, it will not be enforced.

#### Examples

~~~
CREATE TABLE strings (a STRING PRIMARY KEY, b CHAR, c TEXT);

SHOW COLUMNS FROM strings;
+-------+--------+-------+---------+
| Field |  Type  | Null  | Default |
+-------+--------+-------+---------+
| a     | STRING | false | NULL    |
| b     | STRING | true  | NULL    |
| c     | STRING | true  | NULL    |
+-------+--------+-------+---------+

INSERT INTO strings VALUES ('a1b2c3', 'd4e5f6', 'g7h8i9');

SELECT * FROM strings;
+--------+--------+--------+
|   a    |   b    |   c    |
+--------+--------+--------+
| a1b2c3 | d4e5f6 | g7h8i9 |
+--------+--------+--------+
~~~

## `BYTES`


escape text as bytes: b'text' 