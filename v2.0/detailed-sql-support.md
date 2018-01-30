---
title: Detailed SQL Standard Comparison
summary: Details of CockroachDB's conformance to the SQL standard and which common extensions it supports.
---

This page lists which SQL standard features are supported, partially-supported, and unsupported by CockroachDB.

To understand the extent to which we support the standard SQL features, use the table below.

- **Feature ID** is the SQL Standard feature identification number.
- **Description** provides details about the feature.
- **CockroachDB Support** indicates whether the feature is supported, unsupported, or partially-supported by CockroachDB.

## Features

|  **Feature ID** | **Description** | **CockroachDB Support** |
|  ------ | ------ | ------ |
|  B011 | Embedded Ada | No |
|  B012 | Embedded C | No |
|  B013 | Embedded COBOL | No |
|  B014 | Embedded Fortran | No |
|  B015 | Embedded MUMPS | No |
|  B016 | Embedded Pascal | No |
|  B017 | Embedded PL/I | No |
|  B021 | Direct SQL | No |
|  B031 | Basic dynamic SQL | No |
|  B032 | Extended dynamic SQL | No |
|  B032-01 | <describe input statement> | No |
|  B033 | Untyped SQL-invoked function arguments | No |
|  B034 | Dynamic specification of cursor attributes | No |
|  B035 | Non-extended descriptor names | No |
|  B041 | Extensions to embedded SQL exception declarations | No |
|  B051 | Enhanced execution rights | No |
|  B111 | Module language Ada | No |
|  B112 | Module language C | No |
|  B113 | Module language COBOL | No |
|  B114 | Module language Fortran | No |
|  B115 | Module language MUMPS | No |
|  B116 | Module language Pascal | No |
|  B117 | Module language PL/I | No |
|  B121 | Routine language Ada | No |
|  B122 | Routine language C | No |
|  B123 | Routine language COBOL | No |
|  B124 | Routine language Fortran | No |
|  B125 | Routine language MUMPS | No |
|  B126 | Routine language Pascal | No |
|  B127 | Routine language PL/I | No |
|  B128 | Routine language SQL | No |
|  B211 | Module language Ada: VARCHAR and NUMERIC support | No |
|  B221 | Routine language Ada: VARCHAR and NUMERIC support | No |
|  **E011** | **Numeric data types** | **Yes** |
|  E011-01 | INTEGER and SMALLINT data types | Yes |
|  E011-02 | REAL, DOUBLE PRECISION, and FLOAT data types | Yes |
|  E011-03 | DECIMAL and NUMERIC data types | Yes |
|  E011-04 | Arithmetic operators | Yes |
|  E011-05 | Numeric comparison | Yes |
|  E011-06 | Implicit casting among the numeric data types | Yes |
|  **E021** | **Character data types** | **Partial** |
|  E021-01 | CHARACTER data type | Yes |
|  E021-02 | CHARACTER VARYING data type | Partial |
|  E021-03 | Character literals | Yes |
|  E021-04 | CHARACTER_LENGTH function | No |
|  E021-05 | OCTET_LENGTH function | Yes |
|  E021-06 | SUBSTRING function | Yes |
|  E021-07 | Character concatenation | Yes |
|  E021-08 | UPPER and LOWER functions | Yes |
|  E021-09 | TRIM function | Yes |
|  E021-10 | Implicit casting among the character string types | Yes |
|  E021-11 | POSITION function | Yes |
|  E021-12 | Character comparison | Yes |
|  **E031** | **Identifiers** | **Yes** |
|  E031-01 | Delimited identifiers | Yes |
|  E031-02 | Lower case identifiers | Yes |
|  E031-03 | Trailing underscore | Yes |
|  **E051** | **Basic query specification** | **Yes** |
|  E051-01 | SELECT DISTINCT | Yes |
|  E051-02 | GROUP BY clause | Yes |
|  E051-04 | GROUP BY can contain columns not in <select list> | Yes |
|  E051-05 | Select list items can be renamed | Yes |
|  E051-06 | HAVING clause | Yes |
|  E051-07 | Qualified * in select list | Yes |
|  E051-08 | Correlation names in the FROM clause | Yes |
|  E051-09 | Rename columns in the FROM clause | Yes |
|  **E061** | **Basic predicates and search conditions** | **Partial** |
|  E061-01 | Comparison predicate | Yes |
|  E061-02 | BETWEEN predicate | Yes |
|  E061-03 | IN predicate with list of values | Yes |
|  E061-04 | LIKE predicate | Yes |
|  E061-05 | LIKE predicate ESCAPE clause | No |
|  E061-06 | NULL predicate | Yes |
|  E061-07 | Quantified comparison predicate | Yes |
|  E061-08 | EXISTS predicate | Yes |
|  E061-09 | Subqueries in comparison predicate | Yes |
|  E061-11 | Subqueries in IN predicate | Yes |
|  E061-12 | Subqueries in quantified comparison predicate | Yes |
|  E061-13 | Correlated subqueries | No |
|  E061-14 | Search condition | Yes |
|  **E071** | **Basic query expressions** | **Partial** |
|  E071-01 | UNION DISTINCT table operator | Yes |
|  E071-02 | UNION ALL table operator | Yes |
|  E071-03 | EXCEPT DISTINCT table operator | Yes |
|  E071-05 | Columns combined via table operators need not have exactly the same data type | No |
|  E071-06 | Table operators in subqueries | Yes |
|  **E081** | **Basic Privileges** | **Partial** |
|  E081-01 | SELECT privilege | Yes |
|  E081-02 | DELETE privilege | Yes |
|  E081-03 | INSERT privilege at the table level | Yes |
|  E081-04 | UPDATE privilege at the table level | Yes |
|  E081-05 | UPDATE privilege at the column level | No |
|  E081-06 | REFERENCES privilege at the table level | No |
|  E081-07 | REFERENCES privilege at the column level | No |
|  E081-08 | WITH GRANT OPTION | No |
|  E081-09 | USAGE privilege | Yes |
|  E081-10 | EXECUTE privilege | No |
|  **E091** | **Set functions** | **Yes** |
|  E091-01 | AVG | Yes |
|  E091-02 | COUNT | Yes |
|  E091-03 | MAX | Yes |
|  E091-04 | MIN | Yes |
|  E091-05 | SUM | Yes |
|  E091-06 | ALL quantifier | Yes |
|  E091-07 | DISTINCT quantifier | Yes |
|  **E101** | **Basic data manipulation** | **Yes** |
|  E101-01 | INSERT statement | Yes |
|  E101-03 | Searched UPDATE statement | Yes |
|  E101-04 | Searched DELETE statement | Yes |
|  **E111** | **Single row SELECT statement** | **Yes** |
|  **E121** | **Basic cursor support** | **No** |
|  E121-01 | DECLARE CURSOR | No |
|  E121-02 | ORDER BY columns need not be in select list | No |
|  E121-03 | Value expressions in ORDER BY clause | No |
|  E121-04 | OPEN statement | No |
|  E121-06 | Positioned UPDATE statement | No |
|  E121-07 | Positioned DELETE statement | No |
|  E121-08 | CLOSE statement | No |
|  E121-10 | FETCH statement implicit NEXT | No |
|  E121-17 | WITH HOLD cursors | No |
|  **E131** | **Null value support (nulls in lieu of values)** | **Yes** |
|  **E141** | **Basic integrity constraints** | **Yes** |
|  E141-01 | NOT NULL constraints | Yes |
|  E141-02 | UNIQUE constraints of NOT NULL columns | Yes |
|  E141-03 | PRIMARY KEY constraints | Yes |
|  E141-04 | Basic FOREIGN KEY constraint with the NO ACTION default for both referential delete action and referential update action | Yes |
|  E141-06 | CHECK constraints | Yes |
|  E141-07 | Column defaults | Yes |
|  E141-08 | NOT NULL inferred on PRIMARY KEY | Yes |
|  E141-10 | Names in a foreign key can be specified in any order | Yes |
|  **E151** | **Transaction support** | **Yes** |
|  E151-01 | COMMIT statement | Yes |
|  E151-02 | ROLLBACK statement | Yes |
|  **E152** | **Basic SET TRANSACTION statement** | **Partial** |
|  E152-01 | SET TRANSACTION statement: ISOLATION LEVEL SERIALIZABLE clause | Yes |
|  E152-02 | SET TRANSACTION statement: READ ONLY and READ WRITE clauses | No |
|  E153 | Updatable queries with subqueries | No |
|  **E161** | **SQL comments using leading double minus** | **Yes** |
|  **E171** | **SQLSTATE support** | **Partial** |
|  E182 | Module language | No |
|  **F021** | **Basic information schema** | **Yes** |
|  F021-01 | COLUMNS view | Yes |
|  F021-02 | TABLES view | Yes |
|  F021-03 | VIEWS view | Yes |
|  F021-04 | TABLE_CONSTRAINTS view | Yes |
|  F021-05 | REFERENTIAL_CONSTRAINTS view | Yes |
|  F021-06 | CHECK_CONSTRAINTS view | Yes |
|  **F031** | **Basic schema manipulation** | **Yes** |
|  F031-01 | CREATE TABLE statement to create persistent base tables | Yes |
|  F031-02 | CREATE VIEW statement | Yes |
|  F031-03 | GRANT statement | Yes |
|  F031-04 | ALTER TABLE statement: ADD COLUMN clause | Yes |
|  F031-13 | DROP TABLE statement: RESTRICT clause | Yes |
|  F031-16 | DROP VIEW statement: RESTRICT clause | Yes |
|  F031-19 | REVOKE statement: RESTRICT clause | Yes |
|  **F032** | **CASCADE drop behavior** | **Yes** |
|  **F033** | **ALTER TABLE statement: DROP COLUMN clause** | **Yes** |
|  **F034** | **Extended REVOKE statement** | **Partial** |
|  F034-01 | REVOKE statement performed by other than the owner of a schema object | Yes |
|  F034-02 | REVOKE statement: GRANT OPTION FOR clause | No |
|  F034-03 | REVOKE statement to revoke a privilege that the grantee has WITH GRANT OPTION | No |
|  **F041** | **Basic joined table** | **Yes** |
|  F041-01 | Inner join (but not necessarily the INNER keyword) | Yes |
|  F041-02 | INNER keyword | Yes |
|  F041-03 | LEFT OUTER JOIN | Yes |
|  F041-04 | RIGHT OUTER JOIN | Yes |
|  F041-05 | Outer joins can be nested | Yes |
|  F041-07 | The inner table in a left or right outer join can also be used in an inner join | Yes |
|  F041-08 | All comparison operators are supported (rather than just =) | Yes |
|  **F051** | **Basic date and time** | **Partial** |
|  F051-01 | DATE data type (including support of DATE literal) | Yes |
|  F051-02 | TIME data type (including support of TIME literal) with fractional seconds precision of at least 0 | Yes |
|  F051-03 | TIMESTAMP data type (including support of TIMESTAMP literal) with fractional seconds precision of at least 0 and 6 | Yes |
|  F051-04 | Comparison predicate on DATE, TIME, and TIMESTAMP data types | Yes |
|  F051-05 | Explicit CAST between datetime types and character string types | Yes |
|  F051-06 | CURRENT_DATE | Yes |
|  F051-07 | LOCALTIME | No |
|  F051-08 | LOCALTIMESTAMP | No |
|  **F052** | **Intervals and datetime arithmetic** | **Yes** |
|  **F053** | **OVERLAPS predicate** | **No** |
|  F054 | TIMESTAMP in DATE type precedence list | No |
|  **F081** | **UNION and EXCEPT in views** | **Yes** |
|  **F111** | **Isolation levels other than SERIALIZABLE** | **No** |
|  F111-01 | READ UNCOMMITTED isolation level | No |
|  F111-02 | READ COMMITTED isolation level | No |
|  F111-03 | REPEATABLE READ isolation level | No |
|  F121 | Basic diagnostics management | No |
|  F121-01 | GET DIAGNOSTICS statement | No |
|  F121-02 | SET TRANSACTION statement: DIAGNOSTICS SIZE clause | No |
|  F122 | Enhanced diagnostics management | No |
|  F123 | All diagnostics | No |
|  **F131** | **Grouped operations** | **Yes** |
|  F131-01 | WHERE, GROUP BY, and HAVING clauses supported in queries with grouped views | Yes |
|  F131-02 | Multiple tables supported in queries with grouped views | Yes |
|  F131-03 | Set functions supported in queries with grouped views | Yes |
|  F131-04 | Subqueries with GROUP BY and HAVING clauses and grouped views | Yes |
|  F131-05 | Single row SELECT with GROUP BY and HAVING clauses and grouped views | Yes |
|  **F171** | **Multiple schemas per user** | **No** |
|  F181 | Multiple module support | No |
|  **F191** | **Referential delete actions** | **No** |
|  **F200** | **TRUNCATE TABLE statement** | **Yes** |
|  **F201** | **CAST function** | **Yes** |
|  F202 | TRUNCATE TABLE: identity column restart option | No |
|  **F221** | **Explicit defaults** | **Yes** |
|  **F222** | **INSERT statement: DEFAULT VALUES clause** | **Yes** |
|  **F231** | **Privilege tables** | **Yes** |
|  F231-01 | TABLE_PRIVILEGES view | Yes |
|  F231-02 | COLUMN_PRIVILEGES view | No |
|  F231-03 | USAGE_PRIVILEGES view | No |
|  **F251** | **Domain support** | **No** |
|  **F261** | **CASE expression** | **Yes** |
|  F261-01 | Simple CASE | Yes |
|  F261-02 | Searched CASE | Yes |
|  F261-03 | NULLIF | Yes |
|  F261-04 | COALESCE | Yes |
|  **F262** | **Extended CASE expression** | No |
|  F263 | Comma-separated predicates in simple CASE expression | No |
|  **F271** | **Compound character literals** | **No** |
|  **F281** | **LIKE enhancements** | **Yes** |
|  F291 | UNIQUE predicate | Yes |
|  F301 | CORRESPONDING in query expressions | No |
|  **F302** | **INTERSECT table operator** | **Yes** |
|  F302-01 | INTERSECT DISTINCT table operator | Yes |
|  F302-02 | INTERSECT ALL table operator | Yes |
|  **F304** | **EXCEPT ALL table operator** | **Yes** |
|  F311 | Schema definition statement | No |
|  F311-01 | CREATE SCHEMA | No |
|  F311-02 | CREATE TABLE for persistent base tables | Yes |
|  F311-03 | CREATE VIEW | Yes |
|  F311-04 | CREATE VIEW: WITH CHECK OPTION | No |
|  F311-05 | GRANT statement | Yes |
|  F312 | MERGE statement | No |
|  F313 | Enhanced MERGE statement | No |
|  F314 | MERGE statement with DELETE branch | No |
|  **F321** | **User authorization** | **Partial** |
|  F341 | Usage tables | No |
|  **F361** | **Subprogram support** | **No** |
|  **F381** | **Extended schema manipulation** | **Partial** |
|  F381-01 | ALTER TABLE statement: ALTER COLUMN clause | Partial |
|  F381-02 | ALTER TABLE statement: ADD CONSTRAINT clause | Yes |
|  F381-03 | ALTER TABLE statement: DROP CONSTRAINT clause | Yes |
|  **F382** | **Alter column data type** | **No** |
|  **F383** | **Set column not null clause** | **No** |
|  F384 | Drop identity property clause | No |
|  F385 | Drop column generation expression clause | No |
|  F386 | Set identity column generation clause | No |
|  **F391** | **Long identifiers** | **Yes** |
|  **F392** | **Unicode escapes in identifiers** | **Yes** |
|  **F393** | **Unicode escapes in literals** | **Yes** |
|  F394 | Optional normal form specification | No |
|  **F401** | **Extended joined table** | **Yes** |
|  F401-01 | NATURAL JOIN | Yes |
|  F401-02 | FULL OUTER JOIN | Yes |
|  F401-04 | CROSS JOIN | Yes |
|  **F402** | **Named column joins for LOBs, arrays, and multisets** | **Partial** |
|  F403 | Partitioned joined tables | No |
|  **F411** | **Time zone specification** | **Yes** |
|  **F421** | **National character** | **No** |
|  **F431** | **Read-only scrollable cursors** | **No** |
|  F431-01 | FETCH with explicit NEXT | No |
|  F431-02 | FETCH FIRST | No |
|  F431-03 | FETCH LAST | No |
|  F431-04 | FETCH PRIOR | No |
|  F431-05 | FETCH ABSOLUTE | No |
|  F431-06 | FETCH RELATIVE | No |
|  **F441** | **Extended set function support** | **Yes** |
|  **F442** | **Mixed column references in set functions** | **Yes** |
|  F451 | Character set definition | No |
|  F461 | Named character sets | No |
|  **F471** | **Scalar subquery values** | **Yes** |
|  **F481** | **Expanded NULL predicate** | **Yes** |
|  **F491** | **Constraint management** | **Yes** |
|  F492 | Optional table constraint enforcement | Partial |
|  **F501** | **Features and conformance views** | **No** |
|  F501-01 | SQL_FEATURES view | No |
|  F501-02 | SQL_SIZING view | No |
|  F501-03 | SQL_LANGUAGES view | No |
|  **F502** | **Enhanced documentation tables** | **No** |
|  F502-01 | SQL_SIZING_PROFILES view | No |
|  F502-02 | SQL_IMPLEMENTATION_INFO view | No |
|  F502-03 | SQL_PACKAGES view | No |
|  F521 | Assertions | No |
|  **F531** | **Temporary tables** | **No** |
|  **F555** | **Enhanced seconds precision** | No |
|  **F561** | **Full value expressions** | **Yes** |
|  **F571** | **Truth value tests** | **Yes** |
|  **F591** | **Derived tables** | **Yes** |
|  **F611** | **Indicator data types** | **No** |
|  **F641** | **Row and table constructors** | **Yes** |
|  **F651** | **Catalog name qualifiers** | **Partial** |
|  **F661** | **Simple tables** | **Yes** |
|  F671 | Subqueries in CHECK | No |
|  **F672** | **Retrospective check constraints** | **Yes** |
|  **F690** | **Collation support** | **Yes** |
|  **F692** | **Extended collation support** | **Yes** |
|  F693 | SQL-session and client module collations | Yes |
|  F695 | Translation support | No |
|  F696 | Additional translation documentation | No |
|  **F701** | **Referential update actions** | **No** |
|  **F711** | **ALTER domain** | **No** |
|  F721 | Deferrable constraints | No |
|  **F731** | **INSERT column privileges** | **No** |
|  F741 | Referential MATCH types | No |
|  **F751** | **View CHECK enhancements** | **No** |
|  **F761** | **Session management** | **No** |
|  **F762** | **CURRENT_CATALOG** | **No** |
|  **F763** | **CURRENT_SCHEMA** | **Partial** |
|  **F771** | **Connection management** | **No** |
|  **F781** | **Self-referencing operations** | No |
|  **F791** | **Insensitive cursors** | **No** |
|  **F801** | **Full set function** | No |
|  F812 | Basic flagging | No |
|  F813 | Extended flagging | No |
|  F821 | Local table references | No |
|  F831 | Full cursor update | No |
|  F831-01 | Updatable scrollable cursors | No |
|  F831-02 | Updatable ordered cursors | No |
|  F841 | LIKE_REGEX predicate | Partial |
|  F842 | OCCURRENCES_REGEX function | No |
|  F843 | POSITION_REGEX function | No |
|  F844 | SUBSTRING_REGEX function | Partial |
|  F845 | TRANSLATE_REGEX function | Partial |
|  F846 | Octet support in regular expression operators | No |
|  F847 | Nonconstant regular expressions | Yes |
|  **F850** | **Top-level <order by clause> in <query expression>** | **Yes** |
|  **F851** | **<order by clause> in subqueries** | **Yes** |
|  **F852** | **Top-level <order by clause> in views** | **Yes** |
|  **F855** | **Nested <order by clause> in <query expression>** | **Yes** |
|  **F856** | **Nested <fetch first clause> in <query expression>** | **Yes** |
|  **F857** | **Top-level <fetch first clause> in <query expression>** | **Yes** |
|  **F858** | **<fetch first clause> in subqueries** | **Yes** |
|  **F859** | **Top-level <fetch first clause> in views** | **Yes** |
|  **F860** | **<fetch first row count> in <fetch first clause>** | **Yes** |
|  **F861** | **Top-level <result offset clause> in <query expression>** | **Yes** |
|  **F862** | **<result offset clause> in subqueries** | **Yes** |
|  **F863** | **Nested <result offset clause> in <query expression>** | **Yes** |
|  **F864** | **Top-level <result offset clause> in views** | **Yes** |
|  **F865** | **<offset row count> in <result offset clause>** | **Yes** |
|  F866 | FETCH FIRST clause: PERCENT option | No |
|  F867 | FETCH FIRST clause: WITH TIES option | No |
|  M001 | Datalinks | No |
|  M002 | Datalinks via SQL/CLI | No |
|  M003 | Datalinks via Embedded SQL | No |
|  M004 | Foreign data support | No |
|  M005 | Foreign schema support | No |
|  M006 | GetSQLString routine | No |
|  M007 | TransmitRequest | No |
|  M009 | GetOpts and GetStatistics routines | No |
|  M010 | Foreign data wrapper support | No |
|  M011 | Datalinks via Ada | No |
|  M012 | Datalinks via C | No |
|  M013 | Datalinks via COBOL | No |
|  M014 | Datalinks via Fortran | No |
|  M015 | Datalinks via M | No |
|  M016 | Datalinks via Pascal | No |
|  M017 | Datalinks via PL/I | No |
|  M018 | Foreign data wrapper interface routines in Ada | No |
|  M019 | Foreign data wrapper interface routines in C | No |
|  M020 | Foreign data wrapper interface routines in COBOL | No |
|  M021 | Foreign data wrapper interface routines in Fortran | No |
|  M022 | Foreign data wrapper interface routines in MUMPS | No |
|  M023 | Foreign data wrapper interface routines in Pascal | No |
|  M024 | Foreign data wrapper interface routines in PL/I | No |
|  M030 | SQL-server foreign data support | No |
|  M031 | Foreign data wrapper general routines | No |
|  S011 | Distinct data types | No |
|  S011-01 | USER_DEFINED_TYPES view | No |
|  S023 | Basic structured types | No |
|  S024 | Enhanced structured types | No |
|  S025 | Final structured types | No |
|  S026 | Self-referencing structured types | No |
|  S027 | Create method by specific method name | No |
|  S028 | Permutable UDT options list | No |
|  S041 | Basic reference types | No |
|  S043 | Enhanced reference types | No |
|  S051 | Create table of type | No |
|  **S071** | **SQL paths in function and type name resolution** | **No** |
|  S081 | Subtables | No |
|  S091 | Basic array support | Yes |
|  S091-01 | Arrays of built-in data types | Yes |
|  S091-02 | Arrays of distinct types | No |
|  S091-03 | Array expressions | Yes |
|  **S092** | **Arrays of user-defined types** | **No** |
|  S094 | Arrays of reference types | No |
|  **S095** | **Array constructors by query** | **Yes** |
|  **S096** | **Optional array bounds** | **Yes** |
|  S097 | Array element assignment | No |
|  **S098** | **ARRAY_AGG** | **Yes** |
|  **S111** | **ONLY in query expressions** | **Yes** |
|  S151 | Type predicate | Yes |
|  S161 | Subtype treatment | No |
|  S162 | Subtype treatment for references | No |
|  **S201** | **SQL-invoked routines on arrays** | **Yes** |
|  S201-01 | Array parameters | Yes |
|  S201-02 | Array as result type of functions | Yes |
|  S202 | SQL-invoked routines on multisets | No |
|  **S211** | **User-defined cast functions** | **No** |
|  S231 | Structured type locators | No |
|  S232 | Array locators | No |
|  S233 | Multiset locators | No |
|  S241 | Transform functions | No |
|  S242 | Alter transform statement | No |
|  S251 | User-defined orderings | No |
|  S261 | Specific type method | No |
|  S271 | Basic multiset support | No |
|  S272 | Multisets of user-defined types | No |
|  S274 | Multisets of reference types | No |
|  S275 | Advanced multiset support | No |
|  S281 | Nested collection types | No |
|  S291 | Unique constraint on entire row | No |
|  **S301** | **Enhanced UNNEST** | No |
|  S401 | Distinct types based on array types | No |
|  S402 | Distinct types based on distinct types | No |
|  S403 | ARRAY_MAX_CARDINALITY | No |
|  S404 | TRIM_ARRAY | No |
|  T011 | Timestamp in Information Schema | No |
|  T021 | BINARY and VARBINARY data types | No |
|  T022 | Advanced support for BINARY and VARBINARY data types | No |
|  T023 | Compound binary literal | No |
|  T024 | Spaces in binary literals | No |
|  **T031** | **BOOLEAN data type** | **Yes** |
|  T041 | Basic LOB data type support | No |
|  T041-01 | BLOB data type | No |
|  T041-02 | CLOB data type | No |
|  T041-03 | POSITION, LENGTH, LOWER, TRIM, UPPER, and SUBSTRING functions for LOB data types | No |
|  T041-04 | Concatenation of LOB data types | No |
|  T041-05 | LOB locator: non-holdable | No |
|  T042 | Extended LOB data type support | No |
|  T043 | Multiplier T | No |
|  T044 | Multiplier P | No |
|  T051 | Row types | Yes |
|  T052 | MAX and MIN for row types | Yes |
|  T053 | Explicit aliases for all-fields reference | No |
|  T061 | UCS support | No |
|  **T071** | **BIGINT data type** | **Yes** |
|  T101 | Enhanced nullability determination | No |
|  T111 | Updatable joins, unions, and columns | No |
|  **T121** | **WITH (excluding RECURSIVE) in query expression** | **Partial** |
|  **T122** | **WITH (excluding RECURSIVE) in subquery** | **Partial** |
|  **T131** | **Recursive query** | **No** |
|  **T132** | **Recursive query in subquery** | **No** |
|  **T141** | **SIMILAR predicate** | **Yes** |
|  **T151** | **DISTINCT predicate** | **Yes** |
|  **T152** | **DISTINCT predicate with negation** | **Yes** |
|  **T171** | **LIKE clause in table definition** | **No** |
|  **T172** | **AS subquery clause in table definition** | **Yes** |
|  **T173** | **Extended LIKE clause in table definition** | **No** |
|  T174 | Identity columns | No |
|  T175 | Generated columns | No |
|  T176 | Sequence generator support | Yes |
|  T177 | Sequence generator support: simple restart option | No |
|  T178 | Identity columns: simple restart option | No |
|  T180 | System-versioned tables | No |
|  T181 | Application-time period tables | No |
|  **T191** | **Referential action RESTRICT** | **Yes** |
|  **T201** | **Comparable data types for referential constraints** | **No** |
|  T211 | Basic trigger capability | No |
|  T211-01 | Triggers activated on UPDATE, INSERT, or DELETE of one base table | No |
|  T211-02 | BEFORE triggers | No |
|  T211-03 | AFTER triggers | No |
|  T211-04 | FOR EACH ROW triggers | No |
|  T211-05 | Ability to specify a search condition that must be true before the trigger is invoked | No |
|  T211-06 | Support for run-time rules for the interaction of triggers and constraints | No |
|  T211-07 | TRIGGER privilege | No |
|  T211-08 | Multiple triggers for the same event are executed in the order in which they were created in the catalog | No |
|  **T212** | **Enhanced trigger capability** | **No** |
|  **T213** | **INSTEAD OF triggers** | **No** |
|  **T231** | **Sensitive cursors** | **No** |
|  **T241** | **START TRANSACTION statement** | **Yes** |
|  T251 | SET TRANSACTION statement: LOCAL option | No |
|  T261 | Chained transactions | No |
|  **T271** | **Savepoints** | **No** |
|  T272 | Enhanced savepoint management | No |
|  **T281** | **SELECT privilege with column granularity** | **No** |
|  T285 | Enhanced derived column names | No |
|  T301 | Functional dependencies | No |
|  **T312** | **OVERLAY function** | **Yes** |
|  T321 | Basic SQL-invoked routines | No |
|  T321-01 | User-defined functions with no overloading | No |
|  T321-02 | User-defined stored procedures with no overloading | No |
|  T321-03 | Function invocation | No |
|  T321-04 | CALL statement | No |
|  T321-05 | RETURN statement | No |
|  T321-06 | ROUTINES view | No |
|  T321-07 | PARAMETERS view | No |
|  T322 | Declared data type attributes | No |
|  **T323** | **Explicit security for external routines** | **No** |
|  T324 | Explicit security for SQL routines | No |
|  **T325** | **Qualified SQL parameter references** | **No** |
|  T326 | Table functions | Partial |
|  **T331** | **Basic roles** | **Partial** |
|  T332 | Extended roles | No |
|  **T341** | **Overloading of SQL-invoked functions and procedures** | **Yes** |
|  **T351** | **Bracketed SQL comments (/*...*/ comments)** | **Yes** |
|  **T431** | **Extended grouping capabilities** | No |
|  **T432** | **Nested and concatenated GROUPING SETS** | No |
|  **T433** | **Multiargument GROUPING function** | No |
|  T434 | GROUP BY DISTINCT | Yes |
|  **T441** | **ABS and MOD functions** | **Yes** |
|  **T461** | **Symmetric BETWEEN predicate** | **Yes** |
|  T471 | Result sets return value | No |
|  T472 | DESCRIBE CURSOR | No |
|  **T491** | **LATERAL derived table** | **No** |
|  T495 | Combined data change and retrieval | Partial |
|  **T501** | **Enhanced EXISTS predicate** | **Yes** |
|  T502 | Period predicates | No |
|  T511 | Transaction counts | No |
|  T521 | Named arguments in CALL statement | No |
|  T522 | Default values for IN parameters of SQL-invoked procedures | No |
|  **T551** | **Optional key words for default syntax** | **Yes** |
|  T561 | Holdable locators | No |
|  T571 | Array-returning external SQL-invoked functions | No |
|  T572 | Multiset-returning external SQL-invoked functions | No |
|  **T581** | **Regular expression substring function** | **Yes** |
|  **T591** | **UNIQUE constraints of possibly null columns** | **Yes** |
|  T601 | Local cursor references | No |
|  **T611** | **Elementary OLAP operations** | **No** |
|  T612 | Advanced OLAP operations | No |
|  **T613** | **Sampling** | **No** |
|  **T614** | **NTILE function** | **Yes** |
|  **T615** | **LEAD and LAG functions** | **Yes** |
|  T616 | Null treatment option for LEAD and LAG functions | No |
|  **T617** | **FIRST_VALUE and LAST_VALUE function** | **Yes** |
|  T618 | NTH_VALUE function | Partial |
|  T619 | Nested window functions | No |
|  T620 | WINDOW clause: GROUPS option | No |
|  **T621** | **Enhanced numeric functions** | No |
|  **T631** | **IN predicate with one list element** | **Yes** |
|  T641 | Multiple column assignment | Partial |
|  **T651** | **SQL-schema statements in SQL routines** | **No** |
|  T652 | SQL-dynamic statements in SQL routines | No |
|  T653 | SQL-schema statements in external routines | No |
|  T654 | SQL-dynamic statements in external routines | No |
|  **T655** | **Cyclically dependent routines** | **No** |
|  X010 | XML type | No |
|  X011 | Arrays of XML type | No |
|  X012 | Multisets of XML type | No |
|  X013 | Distinct types of XML type | No |
|  X014 | Attributes of XML type | No |
|  X015 | Fields of XML type | No |
|  X016 | Persistent XML values | No |
|  X020 | XMLConcat | No |
|  X025 | XMLCast | No |
|  X030 | XMLDocument | No |
|  X031 | XMLElement | No |
|  X032 | XMLForest | No |
|  X034 | XMLAgg | No |
|  X035 | XMLAgg: ORDER BY option | No |
|  X036 | XMLComment | No |
|  X037 | XMLPI | No |
|  X038 | XMLText | No |
|  X040 | Basic table mapping | No |
|  X041 | Basic table mapping: nulls absent | No |
|  X042 | Basic table mapping: null as nil | No |
|  X043 | Basic table mapping: table as forest | No |
|  X044 | Basic table mapping: table as element | No |
|  X045 | Basic table mapping: with target namespace | No |
|  X046 | Basic table mapping: data mapping | No |
|  X047 | Basic table mapping: metadata mapping | No |
|  X048 | Basic table mapping: base64 encoding of binary strings | No |
|  X049 | Basic table mapping: hex encoding of binary strings | No |
|  X050 | Advanced table mapping | No |
|  X051 | Advanced table mapping: nulls absent | No |
|  X052 | Advanced table mapping: null as nil | No |
|  X053 | Advanced table mapping: table as forest | No |
|  X054 | Advanced table mapping: table as element | No |
|  X055 | Advanced table mapping: with target namespace | No |
|  X056 | Advanced table mapping: data mapping | No |
|  X057 | Advanced table mapping: metadata mapping | No |
|  X058 | Advanced table mapping: base64 encoding of binary strings | No |
|  X059 | Advanced table mapping: hex encoding of binary strings | No |
|  X060 | XMLParse: character string input and CONTENT option | No |
|  X061 | XMLParse: character string input and DOCUMENT option | No |
|  X065 | XMLParse: BLOB input and CONTENT option | No |
|  X066 | XMLParse: BLOB input and DOCUMENT option | No |
|  X068 | XMLSerialize: BOM | No |
|  X069 | XMLSerialize: INDENT | No |
|  X070 | XMLSerialize: character string serialization and CONTENT option | No |
|  X071 | XMLSerialize: character string serialization and DOCUMENT option | No |
|  X072 | XMLSerialize: character string serialization | No |
|  X073 | XMLSerialize: BLOB serialization and CONTENT option | No |
|  X074 | XMLSerialize: BLOB serialization and DOCUMENT option | No |
|  X075 | XMLSerialize: BLOB serialization | No |
|  X076 | XMLSerialize: VERSION | No |
|  X077 | XMLSerialize: explicit ENCODING option | No |
|  X078 | XMLSerialize: explicit XML declaration | No |
|  X080 | Namespaces in XML publishing | No |
|  X081 | Query-level XML namespace declarations | No |
|  X082 | XML namespace declarations in DML | No |
|  X083 | XML namespace declarations in DDL | No |
|  X084 | XML namespace declarations in compound statements | No |
|  X085 | Predefined namespace prefixes | No |
|  X086 | XML namespace declarations in XMLTable | No |
|  X090 | XML document predicate | No |
|  X091 | XML content predicate | No |
|  X096 | XMLExists | No |
|  X100 | Host language support for XML: CONTENT option | No |
|  X101 | Host language support for XML: DOCUMENT option | No |
|  X110 | Host language support for XML: VARCHAR mapping | No |
|  X111 | Host language support for XML: CLOB mapping | No |
|  X112 | Host language support for XML: BLOB mapping | No |
|  X113 | Host language support for XML: STRIP WHITESPACE option | No |
|  X114 | Host language support for XML: PRESERVE WHITESPACE option | No |
|  X120 | XML parameters in SQL routines | No |
|  X121 | XML parameters in external routines | No |
|  X131 | Query-level XMLBINARY clause | No |
|  X132 | XMLBINARY clause in DML | No |
|  X133 | XMLBINARY clause in DDL | No |
|  X134 | XMLBINARY clause in compound statements | No |
|  X135 | XMLBINARY clause in subqueries | No |
|  X141 | IS VALID predicate: data-driven case | No |
|  X142 | IS VALID predicate: ACCORDING TO clause | No |
|  X143 | IS VALID predicate: ELEMENT clause | No |
|  X144 | IS VALID predicate: schema location | No |
|  X145 | IS VALID predicate outside check constraints | No |
|  X151 | IS VALID predicate with DOCUMENT option | No |
|  X152 | IS VALID predicate with CONTENT option | No |
|  X153 | IS VALID predicate with SEQUENCE option | No |
|  X155 | IS VALID predicate: NAMESPACE without ELEMENT clause | No |
|  X157 | IS VALID predicate: NO NAMESPACE with ELEMENT clause | No |
|  X160 | Basic Information Schema for registered XML Schemas | No |
|  X161 | Advanced Information Schema for registered XML Schemas | No |
|  X170 | XML null handling options | No |
|  X171 | NIL ON NO CONTENT option | No |
|  X181 | XML(DOCUMENT(UNTYPED)) type | No |
|  X182 | XML(DOCUMENT(ANY)) type | No |
|  X190 | XML(SEQUENCE) type | No |
|  X191 | XML(DOCUMENT(XMLSCHEMA)) type | No |
|  X192 | XML(CONTENT(XMLSCHEMA)) type | No |
|  X200 | XMLQuery | No |
|  X201 | XMLQuery: RETURNING CONTENT | No |
|  X202 | XMLQuery: RETURNING SEQUENCE | No |
|  X203 | XMLQuery: passing a context item | No |
|  X204 | XMLQuery: initializing an XQuery variable | No |
|  X205 | XMLQuery: EMPTY ON EMPTY option | No |
|  X206 | XMLQuery: NULL ON EMPTY option | No |
|  X211 | XML 1.1 support | No |
|  X221 | XML passing mechanism BY VALUE | No |
|  X222 | XML passing mechanism BY REF | No |
|  X231 | XML(CONTENT(UNTYPED)) type | No |
|  X232 | XML(CONTENT(ANY)) type | No |
|  X241 | RETURNING CONTENT in XML publishing | No |
|  X242 | RETURNING SEQUENCE in XML publishing | No |
|  X251 | Persistent XML values of XML(DOCUMENT(UNTYPED)) type | No |
|  X252 | Persistent XML values of XML(DOCUMENT(ANY)) type | No |
|  X253 | Persistent XML values of XML(CONTENT(UNTYPED)) type | No |
|  X254 | Persistent XML values of XML(CONTENT(ANY)) type | No |
|  X255 | Persistent XML values of XML(SEQUENCE) type | No |
|  X256 | Persistent XML values of XML(DOCUMENT(XMLSCHEMA)) type | No |
|  X257 | Persistent XML values of XML(CONTENT(XMLSCHEMA)) type | No |
|  X260 | XML type: ELEMENT clause | No |
|  X261 | XML type: NAMESPACE without ELEMENT clause | No |
|  X263 | XML type: NO NAMESPACE with ELEMENT clause | No |
|  X264 | XML type: schema location | No |
|  X271 | XMLValidate: data-driven case | No |
|  X272 | XMLValidate: ACCORDING TO clause | No |
|  X273 | XMLValidate: ELEMENT clause | No |
|  X274 | XMLValidate: schema location | No |
|  X281 | XMLValidate with DOCUMENT option | No |
|  X282 | XMLValidate with CONTENT option | No |
|  X283 | XMLValidate with SEQUENCE option | No |
|  X284 | XMLValidate: NAMESPACE without ELEMENT clause | No |
|  X286 | XMLValidate: NO NAMESPACE with ELEMENT clause | No |
|  X300 | XMLTable | No |
|  X301 | XMLTable: derived column list option | No |
|  X302 | XMLTable: ordinality column option | No |
|  X303 | XMLTable: column default option | No |
|  X304 | XMLTable: passing a context item | No |
|  X305 | XMLTable: initializing an XQuery variable | No |
|  X400 | Name and identifier mapping | No |
|  X410 | Alter column data type: XML type | No |
