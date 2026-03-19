| Special form                                              | Equivalent to                               |
|-----------------------------------------------------------|---------------------------------------------|
| `AT TIME ZONE`                                            | `timezone()`                                |
| `CURRENT_CATALOG`                                         | `current_catalog()`                         |
| `COLLATION FOR`                                           | `pg_collation_for()`                        |
| `CURRENT_DATE`                                            | `current_date()`                            |
| `CURRENT_ROLE`                                            | `current_user()`                            |
| `CURRENT_SCHEMA`                                          | `current_schema()`                          |
| `CURRENT_TIMESTAMP`                                       | `current_timestamp()`                       |
| `CURRENT_TIME`                                            | `current_time()`                            |
| `CURRENT_USER`                                            | `current_user()`                            |
| `EXTRACT(<part> FROM <value>)`                            | `extract("<part>", <value>)`                |
| `EXTRACT_DURATION(<part> FROM <value>)`                   | `extract_duration("<part>", <value>)`       |
| `OVERLAY(<text1> PLACING <text2> FROM <int1> FOR <int2>)` | `overlay(<text1>, <text2>, <int1>, <int2>)` |
| `OVERLAY(<text1> PLACING <text2> FROM <int>)`             | `overlay(<text1>, <text2>, <int>)`          |
| `POSITION(<text1> IN <text2>)`                            | `strpos(<text2>, <text1>)`                  |
| `SESSION_USER`                                            | `current_user()`                            |
| `SUBSTRING(<text> FOR <int1> FROM <int2>)`                | `substring(<text>, <int2>, <int1>)`         |
| `SUBSTRING(<text> FOR <int>)`                             | `substring(<text>, 1, <int>)`               |
| `SUBSTRING(<text> FROM <int1> FOR <int2>)`                | `substring(<text>, <int1>, <int2>)`         |
| `SUBSTRING(<text> FROM <int>)`                            | `substring(<text>, <int>)`                  |
| `TRIM(<text1> FROM <text2>)`                              | `btrim(<text2>, <text1>)`                   |
| `TRIM(<text1>, <text2>)`                                  | `btrim(<text1>, <text2>)`                   |
| `TRIM(FROM <text>)`                                       | `btrim(<text>)`                             |
| `TRIM(LEADING <text1> FROM <text2>)`                      | `ltrim(<text2>, <text1>)`                   |
| `TRIM(LEADING FROM <text>)`                               | `ltrim(<text>)`                             |
| `TRIM(TRAILING <text1> FROM <text2>)`                     | `rtrim(<text2>, <text1>)`                   |
| `TRIM(TRAILING FROM <text>)`                              | `rtrim(<text>)`                             |
| `USER`                                                    | `current_user()`                            |
