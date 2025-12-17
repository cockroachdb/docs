Within the SQL shell, you can get interactive help about statements and functions:

Command | Usage
--------|------
`\h`<br>`??` | List all available SQL statements, by category.
`\hf` | List all available SQL functions, in alphabetical order.
`\h <statement>`<br>or `<statement> ?` | View help for a specific SQL statement.
`\hf <function>`<br>or `<function> ?` | View help for a specific SQL function.

#### Examples

~~~ sql
> \h UPDATE
~~~

~~~
Command:     UPDATE
Description: update rows of a table
Category:    data manipulation
Syntax:
UPDATE <tablename> [[AS] <name>] SET ... [WHERE <expr>] [RETURNING <exprs...>]

See also:
  SHOW TABLES
  INSERT
  UPSERT
  DELETE
  https://www.cockroachlabs.com/docs/v2.1/update.html
~~~

~~~ sql
> \hf uuid_v4
~~~

~~~
Function:    uuid_v4
Category:    built-in functions
Returns a UUID.

Signature          Category
uuid_v4() -> bytes [ID Generation]

See also:
  https://www.cockroachlabs.com/docs/v2.1/functions-and-operators.html
~~~
