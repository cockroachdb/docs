### Backwards-Incompatible Changes

- Timestamp values are now stored with microsecond precision instead of nanoseconds. Nanosecond-related functions have been removed. #8864
- The format of zone configuration files has been changed. #8627
- Values of type `TIMESTAMP` (without `TIME ZONE`) are now parsed in UTC, not the session time zone. #9444

### SQL Language Changes

- Tables can now be interleaved into other tables. #7985
- The `CREATE TABLE` statement now supports the `AS` clause to create a table based on the results of a `SELECT` statement. #8802
- The `SPLIT AT` command can now be used to manually split tables into ranges. #8938
- The window functions `row_number()`, `rank()`, `dense_rank()`, `percent_rank()`, `cume_dist()`, `ntile()`, `lead()`, `lag()`, `first_value()`, `last_value()`, `nth_value()` are now supported. #8928 #9321 #9335
- `CHECK` constraints can now be added with the `ALTER TABLE ADD CHECK` and `ALTER TABLE VALIDATE` commands. #9127 #9152
- The `ALTER TABLE DROP CONSTRAINT` command can now drop `CHECK` and `FOREIGN KEY` constraints. #8747
- `INTERVAL` values may now be input in a colon-delimited format (H:M or H:M_S), for compatibility with PostgreSQL. #8603
- The `SHOW CONSTRAINTS` command now requires the user to have privileges for the requested table. #8658
- `TIMESTAMP` values that include a time zone may now omit the minutes field of the time zone offset, for compatibility with PostgreSQL. #8666
- The type `INT8` is now supported as an alias for `INTEGER`. #8858
- The `EXP()` function returns an error if its argument is greater than 1024 rather than performing excessively expensive computation. #8822
- The `ROUND()` function now breaks ties by rounding to the nearest even value (also known as bankers' rounding). It is now faster, and returns an error when given an excessively large number of digits. #8822
- The `EXPLAIN` statement now works correctly for `VALUES` statements containing subqueries. #8970
- The `TRUNCATE` command now implements the `CASCADE` modifier. #9240
- Non-materialized views are now (partially?) supported. #9212 #9355
- information_schema?

### UI Changes

- The time scale selector in the UI now works more reliably. #8573
- Displaying graphs for a longer timescales is now much faster. #8805
- The default graph time scale is chosen based on the age of the cluster. #9340
- Node logs are now accessible in the UI. #8572
- The UI can now be built with live reload support. #8679

### Command-line Interface Changes

- The command-line interface now reports unterminated final statements as errors instead of ignoring them. #8838
- The command-line interface now works correctly under `kubectl` and other environments that hide the size of the terminal. #9097
- The message printed to `stdout` at startup has been improved. #9066

### Protocol Changes

- The `COPY` protocol is now supported on the server side. The `cockroach sql` command-line tool does not yet recognize this command but it can be used with other client interfaces. #8756
- `DECIMAL` values are now encoded correctly for drivers that use the binary format. #8319
- `TIMESTAMP`, `TIMESTAMPTZ` and `DATE` values can now use the binary protocol format for clients that support it. #8590 #8762
- `NULL` values are now sent with the correct type OID. #9331
- The `CREATE TABLE` and `CREATE DATABASE` commands now return the standard PostgreSQL error code when the table or database already exists. #9235

### Bug Fixes

- Fixed some panics in handling invalid SQL statements. #9049 #9050
- String literals containing non-UTF-8 data are now rejected. #9094

### Performance Improvements

- Dropping an index or table is now performed in chunks instead of one big transaction. #8870 #8885
- The SQL query processor now tracks its memory usage and returns errors for queries that use too much memory. #8691
- Aggregate functions like `sum()` are now faster. #8680
- A bug that sometimes caused transactions to restart twice in a row has been fixed. #8596


last commit: 00610c6
