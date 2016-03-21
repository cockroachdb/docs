---
title: Data Types
toc: false
---

CockroachDB provides the following data types for use in SQL statements. 

<div id="toc"></div>

## Overview 

Type | Storage (Bytes) | Description
-----|-----------------|------------
[`INTEGER`](#integer) | 8 | A 64-bit signed integer. 
[`DECIMAL`](#decimal) | 8 | An exact, fixed-point number.  
[`FLOAT`](#float) | 8 | An inexact, floating-point number.
[`DATE`](#date) |  |  
[`TIMESTAMP`](#timestamp) | |  
[`INTERVAL`](#interval) | |

## Numeric Data Types

### `INTEGER`

The `INTEGER` type stores 64-bit signed integers, that is, whole numbers ranging from -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807. 

In CockroachDB, the following types are synonyms of `INTEGER` and are implemented identically: 

- `SMALLINT` 
- `INT` 
- `INT64` 
- `BIGINT`

#### Examples

~~~ sql
CREATE TABLE ints (a INTEGER PRIMARY KEY, b INT, c BIGINT);
~~~

### `DECIMAL`

The `DECIMAL` type stores exact numeric values, up to 131072 digits before and 16383 digits after the decimal point. This type is used when it is important to preserve exact precision, for example, with monetary data. 

In CockroachDB, `DEC` and `NUMERIC` are synonyms of `DECIMAL` and are implemented identically.

#### Precision and Scale

When declaring a `DECIMAL` column in a table, you can specify precision and scale. 

- **Precision** is the maximum count of digits in a whole number, both to the left and right of the decimal point. This must be positive.
- **Scale** is the maximum count of digits to the right of the decimal point. This must be zero or positive.

The syntax is `DECIMAL(precision, scale)`, where precision defaults to 10 when not specified, and scale defaults to 0.

#### Examples

~~~ sql
xxx
~~~

### `FLOAT`

The `FLOAT` type stores an inexact, floating-point numeric value. A `FLOAT` is accurate to 15 decimal places. Beyond that, some values may be stored as approximations.

In CockroachDB, `REAL` and `DOUBLE PRECISION` are synonyms of `FLOAT` and are implemented identically. 

## Data and Time Types

### `DATE`

### `TIMESTAMP`

### `INTERVAL`


## String Types

## Boolean Type

CockroachDB provides the standard SQL type boolean; see Table 8-19. The boolean type can have several states: "true", "false", and a third state, "unknown", which is represented by the SQL null value.

Table 8-19. Boolean Data Type

Name    Storage Size    Description
boolean 1 byte  state of true or false
Valid literal values for the "true" state are:

TRUE
't'
'true'
'y'
'yes'
'on'
'1'For the "false" state, the following values can be used:
FALSE
'f'
'false'
'n'
'no'
'off'
'0'Leading or trailing whitespace is ignored, and case does not matter. The key words TRUE and FALSE are the preferred (SQL-compliant) usage.
Example 8-2 shows that boolean values are output using the letters t and f.