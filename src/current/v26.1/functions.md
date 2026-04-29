---
title: sql: add PostgreSQL-parity math builtins
summary: Math and Statistical Functions
toc: true
docs_area: reference.sql
---

# Math and Statistical Functions

## PostgreSQL-Parity Math Built-ins

The following built-in functions have been added to provide PostgreSQL compatibility for mathematical and statistical operations.

### `erf()`
**Category**: Math and statistics functions
**Signature**: `erf(val FLOAT) → FLOAT`
**Description**: Calculates the error function of `val`.
**Example**:
```sql
SELECT erf(1.0);
-- 0.8427007929497149
```

### `erfc()`
**Category**: Math and statistics functions  
**Signature**: `erfc(val FLOAT) → FLOAT`
**Description**: Calculates the complementary error function: `1 - erf(val)`.
**Example**:
```sql
SELECT erfc(1.0);
-- 0.15729920705028513

SELECT erfc(0.0);
-- 1.0
```

### `factorial()`
**Category**: Math and statistics functions
**Signature**: `factorial(val INT) → DECIMAL`
**Description**: Calculates the factorial of `val`. `val` must be between 0 and 32177 inclusive.
**Example**:
```sql
SELECT factorial(5);
-- 120

SELECT factorial(20);
-- 2432902008176640000

-- Error case
SELECT factorial(-1);
-- ERROR: factorial of a negative number is undefined
```

### `gcd()`
**Category**: Math and statistics functions
**Signatures**: 
- `gcd(a INT, b INT) → INT`
- `gcd(a DECIMAL, b DECIMAL) → DECIMAL`

**Description**: Calculates the greatest common divisor of `a` and `b`. Returns 0 if both inputs are 0; otherwise returns a positive value. For the decimal overload, returns NaN if either input is NaN or Infinity.
**Example**:
```sql
SELECT gcd(12, 18);
-- 6

SELECT gcd(0, 7);
-- 7

SELECT gcd(433125::DECIMAL, 46375::DECIMAL);
-- 875
```

### `lcm()`
**Category**: Math and statistics functions
**Signatures**:
- `lcm(a INT, b INT) → INT`
- `lcm(a DECIMAL, b DECIMAL) → DECIMAL`

**Description**: Calculates the least common multiple of `a` and `b`. Returns 0 if either input is 0. For the decimal overload, returns NaN if either input is NaN or Infinity.
**Example**:
```sql
SELECT lcm(4, 6);
-- 12

SELECT lcm(0, 7);
-- 0

SELECT lcm(423282::DECIMAL, 13272::DECIMAL);
-- 11851896
```

### `log10()`
**Category**: Math and statistics functions
**Signatures**:
- `log10(val FLOAT) → FLOAT`
- `log10(val DECIMAL) → DECIMAL`
- `log10(val INT) → DECIMAL`

**Description**: Calculates the base 10 logarithm of `val`.
**Example**:
```sql
SELECT log10(1000.0);
-- 3.0

SELECT log10(1000::DECIMAL);
-- 3.0000000000000000000

SELECT log10(100);
-- 2.0000000000000000000
```

### `random_normal()`
**Category**: Math and statistics functions
**Signatures**:
- `random_normal() → FLOAT`
- `random_normal(mean FLOAT, stddev FLOAT) → FLOAT`

**Description**: Returns a random floating-point value drawn from a normal distribution. The zero-parameter version uses the standard normal distribution (mean 0, standard deviation 1). The two-parameter version uses the specified mean and standard deviation.
**Example**:
```sql
-- Standard normal distribution
SELECT random_normal();
-- 0.5423194088935852 (example output, will vary)

-- Normal distribution with mean=10, stddev=2
SELECT random_normal(10.0, 2.0);
-- 12.847291948393758 (example output, will vary)

-- Collapsed to mean when stddev=0
SELECT random_normal(5.0, 0.0);
-- 5.0
```

# Numeric Formatting Functions

### `min_scale()`
**Category**: Numeric formatting functions
**Signature**: `min_scale(val DECIMAL) → INT4`
**Description**: Returns the minimum scale (number of fractional decimal digits) needed to represent `val` exactly.
**Example**:
```sql
SELECT min_scale(1.234);
-- 3

SELECT min_scale(1.2300);
-- 2

SELECT min_scale(100.000);
-- 0
```

### `scale()`
**Category**: Numeric formatting functions
**Signature**: `scale(val DECIMAL) → INT4`
**Description**: Returns the scale (number of fractional decimal digits) of `val`.
**Example**:
```sql
SELECT scale(1.234);
-- 3

SELECT scale(1.2300);
-- 4

SELECT scale(100);
-- 0
```

### `trim_scale()`
**Category**: Numeric formatting functions
**Signature**: `trim_scale(val DECIMAL) → DECIMAL`
**Description**: Returns `val` with any trailing zeros after the decimal point removed.
**Example**:
```sql
SELECT trim_scale(1.23000);
-- 1.23

SELECT trim_scale(100.00);
-- 100

SELECT trim_scale(1.234);
-- 1.234
```

## Enhanced Math Functions

The following existing math functions have been extended with additional overloads for integer parameters:

### `ln()` (enhanced)
**New Signature**: `ln(val INT) → DECIMAL`
**Description**: Calculates the natural logarithm of `val`. This adds integer parameter support to the existing function.
**Example**:
```sql
SELECT ln(1);
-- 0

SELECT ln(10);
-- 2.3025850929940456840
```

### `log()` (enhanced)
**New Signatures**:
- `log(val INT) → DECIMAL`
- `log(b INT, x INT) → DECIMAL`

**Description**: Calculates the base 10 logarithm of `val` (single parameter) or the base `b` logarithm of `x` (two parameters). These add integer parameter support to the existing function.
**Example**:
```sql
SELECT log(1000);
-- 3.0000000000000000000

SELECT log(2, 64);
-- 6.0000000000000000000
```
