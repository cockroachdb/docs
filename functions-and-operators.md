---
title: Functions and Operators
summary: CockroachDB supports many built-in functions, aggregate functions, and operators.
toc: true
---

## Built-in Functions

{% include sql/functions.md %}

## Aggregate Functions

{% include sql/aggregates.md %}

## Operators

{% include sql/operators.md %}

<!--
## `CAST()`

there are three syntaxes for dates: `'2016-01-01'::date`, `CAST('2016-01-01' AS DATE)`, and `DATE '2016-01-01'`. the docs should probably prefer the latter form

the `CAST()` function should get its own documentation somewhere; I’m not sure if it needs to be mentioned again in the date section. The `::` form should probably only be mentioned as an alternative to `CAST()`
-->
