---
title: Data Types
toc: false
---

CockroachDB provides the following datatypes for use in SQL statements.

<div class="toc"></div>

## Numeric Types

Type | Storage (Bytes) | Description
-----|-----------------|------------
[`INTEGER`](#integer) | 8 | A 64-bit signed integer.<br><br>**Range:** -9,223,372,036,854,775,808 to 9,223,372,036,854,775,807<br><br>**Synonyms:** `SMALLINT`, `INT`, `INT64`, `BIGINT` 
[`DECIMAL`](#decimal) | 8 | An exact fixed-point number.<br><br>**Range:** Up to 131072 digits before the decimal point; up to 16383 digits after the decimal point<br><br>**Synonyms:** `DEC`, `NUMERIC`  
[`FLOAT`](#float) | 8 | `REAL`<br>`DOUBLE PRECISION` 



### `INTEGER`

The `INTEGER` type 

### `DECIMAL`

The `DECIMAL` and `NUMERIC` types store exact numeric data values. These types are used when it is important to preserve exact precision, for example, with monetary data. 

### `FLOAT`

The `FLOAT`, `REAL` and `DOUBLE PRECISION` types are inexact, variable-precision numeric types. This means that some values cannot be converted exactly to the internal format and are stored as approximations, so that storing and retrieving a value might show slight discrepancies. 

### `FLOAT`

### `REAL`

### `DOUBLE PRECISION`

all synonyms


## Data and Time Types

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