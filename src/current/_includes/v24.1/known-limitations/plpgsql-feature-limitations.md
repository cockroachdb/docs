- PL/pgSQL blocks cannot be nested. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/114775)
- PL/pgSQL arguments cannot be referenced with ordinals (e.g., `$1`, `$2`). [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/114701)
- `FOR` loops, including `FOR` cursor loops, `FOR` query loops, and `FOREACH` loops, are not supported. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/105246)
- `RETURN NEXT` and `RETURN QUERY` statements are not supported. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/117744)
- `EXIT` and `CONTINUE` labels and conditions are not supported. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/115271)
- `CASE` statements are not supported. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/117744)
- `PERFORM`, `EXECUTE`, `GET DIAGNOSTICS`, and `NULL` statements are not supported for PL/pgSQL. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/117744)
- PL/pgSQL exception blocks cannot catch [transaction retry errors]({% link {{ page.version.version }}/transaction-retry-error-reference.md %}). [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/111446)
- `RAISE` statements cannot be annotated with names of schema objects related to the error (i.e., using `COLUMN`, `CONSTRAINT`, `DATATYPE`, `TABLE`, or `SCHEMA`). [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/106237)
- `RAISE` statements message the client directly, and do not produce log output. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/117750)
- `ASSERT` debugging checks are not supported. [Tracking GitHub issue](https://github.com/cockroachdb/cockroach/issues/117744)