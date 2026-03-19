---
title: Triggers
summary: A trigger executes a function when one or more specified SQL operations is performed on a table.
toc: true
---

{{site.data.alerts.callout_info}}
{% include feature-phases/preview.md %}
{{site.data.alerts.end}}

A *trigger* executes a function when one or more specified SQL operations is performed on a table. The executed function is called a [*trigger function*](#trigger-function) and is written in [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}).

Triggers respond to data changes by adding logic within the database, rather than in an application. They can be used to modify data before it is inserted, maintain data consistency across rows or tables, or record an update to a row.

## Structure

A trigger consists of a trigger name, table name associated with the trigger, SQL operations and other conditions that activate the trigger, and a trigger function name with optional arguments. A trigger is defined with [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %}) and has the following overall structure:

~~~ sql
CREATE TRIGGER trigger_name 
  [ BEFORE | AFTER ] [ INSERT | UPDATE | DELETE ] ON table_name
  FOR EACH ROW
  [ WHEN boolean_condition ]
  EXECUTE FUNCTION function_name(arguments)
~~~

- The trigger can activate `BEFORE` or `AFTER` any combination of `INSERT`, `UPDATE`, or `DELETE` statements is issued on a given table.
	- `FOR EACH ROW` specifies a row-level trigger, which activates once for each row that is affected by the statements.
	- `WHEN` specifies an optional boolean condition that determines whether the trigger activates for a given row.
	- For details on the preceding behaviors, refer to [Trigger conditions](#trigger-conditions).
- The [trigger function](#trigger-function), written in [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}), is executed each time the trigger activates. A comma-separated list of constant string arguments can be included.

### Trigger conditions

A trigger activates when one or more SQL statements is issued on a table. The statement can be [`INSERT`]({% link {{ page.version.version }}/insert.md %}), [`DELETE`]({% link {{ page.version.version }}/delete.md %}), or [`UPDATE`]({% link {{ page.version.version }}/update.md %}). 

To specify more than one statement, use the `OR` clause. For example:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER check_value
  BEFORE INSERT OR UPDATE ON users
  ...
~~~

{{site.data.alerts.callout_info}}
`INSERT` and `UPDATE` triggers activate when [`UPSERT`]({% link {{ page.version.version }}/upsert.md %}) statements insert or update rows, respectively. However, `UPSERT` cannot be specified in a [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %}) statement.

`UPDATE` triggers activate when the [`ON CONFLICT`]({% link {{ page.version.version }}/insert.md %}#on-conflict-clause) clause of an `INSERT` updates rows.
{{site.data.alerts.end}}

If `BEFORE` is specified, the trigger activates before the SQL operation. `BEFORE` triggers can be used to validate or modify data before it is inserted, or to check row values before they are updated.

If `AFTER` is specified, the trigger activates after the SQL operation commits. `AFTER` triggers can be used to audit or cascade changes to other tables, thus maintaining data consistency.

The `FOR EACH ROW` clause must be included after the table name. This specifies a *row-level trigger* that activates once for each table row that is affected by the SQL operations.

An optional `WHEN` boolean condition can then be added. This further controls whether the trigger activates on an affected row, and is typically applied to the `OLD` or `NEW` [trigger variables](#trigger-variables). For example, the following trigger only activates if the row's `address` value was changed by the `UPDATE`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER audit_address_change
  AFTER UPDATE ON users
  FOR EACH ROW
  WHEN ((OLD).address IS DISTINCT FROM (NEW).address)
  ...
~~~

{{site.data.alerts.callout_info}}
Due to a [known limitation]({% link {{ page.version.version }}/create-type.md %}#known-limitations), `OLD` and `NEW` must be wrapped in parentheses when accessing column names.
{{site.data.alerts.end}}

Only `OLD` can be referenced in the `WHEN` clause of a `DELETE` trigger, and only `NEW` in the `WHEN` clause of an `INSERT` trigger. `OLD` or `NEW` or both can be referenced in the `WHEN` clause of an `UPDATE` trigger. For details, refer to [Trigger variables](#trigger-variables).

#### Trigger ordering

When multiple triggers activate on the same table, the order is determined as follows:

1. All `BEFORE` triggers activate before all `AFTER` triggers.
1. `BEFORE INSERT` triggers activate before `BEFORE UPDATE` triggers.
1. The triggers activate in alphabetical order by trigger name.

The output of a `BEFORE` trigger is passed to the next `BEFORE` trigger. For details on values returned by triggers, refer to [Trigger function](#trigger-function).

For an example, refer to [Demonstrate `BEFORE` and `AFTER` trigger ordering](#demonstrate-before-and-after-trigger-ordering).

### Trigger function

A trigger executes a [function]({% link {{ page.version.version }}/user-defined-functions.md %}) called a trigger function. A trigger function is defined with [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %}#create-a-trigger-function) and has the following requirements:

- The function must return type `TRIGGER`. 
- The function must be declared without arguments.
- The function must be written in [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}).
- The function for a [`BEFORE`](#trigger-conditions) trigger must return one of the following values:
	- The [`NEW`](#trigger-variables) table row resulting from the SQL operation that activated the trigger. This variable applies only to `INSERT` and `UPDATE` triggers, and also allows the `BEFORE` trigger to modify the row before it is written.
	- The [`OLD`](#trigger-variables) table row affected by the SQL operation that activated the trigger. This variable applies only to `UPDATE` and `DELETE` triggers.
	- `NULL`, which stops the SQL operation that activated the `BEFORE` trigger.
- The function for an [`AFTER`](#trigger-conditions) trigger typically returns `NULL` by convention, because its return value will be ignored.
- The function must be defined before creating the trigger.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION function_name()
  RETURNS TRIGGER AS $$
  BEGIN
	...
  END
  $$ LANGUAGE PLpgSQL;
~~~

Refer to [Examples](#examples).

#### Trigger variables

The following trigger variables are automatically created for trigger functions, and can be used in the function body.

|      Variable     |    Type    |                                                                                                         Description                                                                                                          |
|-------------------|------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `NEW`             | `RECORD`   | New table row resulting from the SQL operation. For `INSERT` triggers, this is the row that will be inserted. For `UPDATE` triggers, this is the row containing the updated values. For `DELETE` triggers, this is `NULL`.   |
| `OLD`             | `RECORD`   | Old table row affected by `UPDATE` and `DELETE` operations. For `UPDATE` triggers, this is the row that will be updated. For `DELETE` triggers, this is the row that will be deleted. For `INSERT` triggers, this is `NULL`. |
| `TG_NAME`         | `NAME`     | Name of the trigger that was activated.                                                                                                                                                                                      |
| `TG_WHEN`         | `STRING`   | When the trigger is set to activate: [`BEFORE` or `AFTER`](#trigger-conditions).                                                                                                                                             |
| `TG_LEVEL`        | `STRING`   | Scope of trigger behavior: [`ROW`](#trigger-conditions).                                                                                                                                                                     |
| `TG_OP`           | `STRING`   | SQL operation that activated the trigger: [`INSERT`, `UPDATE`, or `DELETE`](#trigger-conditions).                                                                                                                            |
| `TG_RELID`        | `OID`      | [`OID`]({% link {{ page.version.version }}/oid.md %}) of the table associated with the trigger.                                                                                                                              |
| `TG_TABLE_NAME`   | `NAME`     | Name of the table associated with the trigger.                                                                                                                                                                               |
| `TB_TABLE_SCHEMA` | `NAME`     | Name of the table schema associated with the trigger.                                                                                                                                                                        |
| `TG_NARGS`        | `INT`      | Number of arguments passed to the trigger function in the [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %}) definition.                                                                            |
| `TG_ARGV`         | `STRING[]` | Arguments passed to the trigger function in the [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %}) definition.                                                                                      |

## Examples

### Create an audit log

In the following example, a trigger is used to log data changes to an "audit log" table.

1. Run [`cockroach demo`]({% link {{ page.version.version }}/cockroach-demo.md %}) to start a temporary, in-memory cluster with the [`movr`]({% link {{ page.version.version }}/movr.md %}) sample dataset preloaded:

	{% include_cached copy-clipboard.html %}
	~~~ shell
	cockroach demo
	~~~

1. Create a table that stores audit records. Each record includes the table that was affected, the SQL operation that was performed on the table, the old and new table rows, and the timestamp when the change was made:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE audit_log (
	    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	    table_name TEXT NOT NULL,
	    operation TEXT NOT NULL,
	    old_data JSONB,
	    new_data JSONB,
	    changed_at TIMESTAMP DEFAULT current_timestamp
	);
	~~~

1. Create a [trigger function]({% link {{ page.version.version }}/create-function.md %}#create-a-trigger-function) that inserts the corresponding values into the `audit_log` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION audit_changes()
	RETURNS TRIGGER AS $$
	BEGIN
	    INSERT INTO audit_log (table_name, operation, old_data, new_data, changed_at)
	    VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_timestamp);
	    RETURN NULL;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

	This function inserts the following [trigger variables](#trigger-variables):
	- `TG_TABLE_NAME`: The table associated with the trigger. In this example, this will be `users`.
	- `TG_OP`: The SQL operation that was performed on the table, thus activating the trigger.
	- `OLD`: The old table row affected by `UPDATE` and `DELETE` operations.
	- `NEW`: The new table row resulting from `INSERT` and `UPDATE` operations.
		
	`current_timestamp` generates a new timestamp each time the function is executed by the trigger.

1. Create a trigger that executes the `audit_changes` function after an `INSERT`, `UPDATE`, or `DELETE` is issued on the `users` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TRIGGER audit_trigger
	AFTER INSERT OR UPDATE OR DELETE ON users
	FOR EACH ROW EXECUTE FUNCTION audit_changes();
	~~~

	{{site.data.alerts.callout_success}}
	The `audit_changes` function can be used to audit changes on multiple tables. You can create another trigger, on a table name other than `users`, that also executes `audit_changes`.
	{{site.data.alerts.end}}

1. Test the trigger by inserting, updating, and deleting a row in the `users` table of the `movr` database:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	INSERT INTO users (id, city, name) VALUES (uuid_generate_v4(), 'new york', 'Max Roach');
	UPDATE users SET address = '541 Greene Avenue' WHERE name = 'Max Roach';
	DELETE FROM users WHERE name = 'Max Roach';
	~~~

	The trigger activates after each of the preceding 3 statements.

1. View the results in the `audit_log` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT * FROM audit_log ORDER BY changed_at;
	~~~

	~~~
	                   id                  | table_name | operation |                                                                   old_data                                                                   |                                                                   new_data                                                                   |         changed_at
	---------------------------------------+------------+-----------+----------------------------------------------------------------------------------------------------------------------------------------------+----------------------------------------------------------------------------------------------------------------------------------------------+-----------------------------
	  70faffe0-6137-4138-9f7d-e34cf29af925 | users      | INSERT    | NULL                                                                                                                                         | {"address": null, "city": "new york", "credit_card": null, "id": "8459c2dd-bee0-4661-a8dd-f0e240d34326", "name": "Max Roach"}                | 2024-11-12 16:39:49.726472
	  612f0dd0-f772-409c-bc48-265b7c0c2555 | users      | UPDATE    | {"address": null, "city": "new york", "credit_card": null, "id": "8459c2dd-bee0-4661-a8dd-f0e240d34326", "name": "Max Roach"}                | {"address": "541 Greene Avenue", "city": "new york", "credit_card": null, "id": "8459c2dd-bee0-4661-a8dd-f0e240d34326", "name": "Max Roach"} | 2024-11-12 16:39:55.53091
	  903d1954-cb8a-4f36-aa4c-e34baebf098e | users      | DELETE    | {"address": "541 Greene Avenue", "city": "new york", "credit_card": null, "id": "8459c2dd-bee0-4661-a8dd-f0e240d34326", "name": "Max Roach"} | NULL                                                                                                                                         | 2024-11-12 16:40:00.899737
	(3 rows)
	~~~

	Because `OLD` does not apply to `INSERT` operations, and `NEW` does not apply to `DELETE` operations, their corresponding `old_data` and `new_data` values are `NULL`, respectively. For details, refer to [Trigger variables](#trigger-variables).

### Create a summary table

In the following example, a trigger is used to calculate sales figures for a "summary table".

1. Create the following two sample tables. `products` contains a list of products, and `orders` contains a list of orders on those products:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE products (
		product_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
		product_name VARCHAR(255) NOT NULL
	);
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE orders (
	    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	    product_id UUID NOT NULL,
	    quantity INT NOT NULL,
	    price NUMERIC(10, 2) NOT NULL,
	    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	    FOREIGN KEY (product_id) REFERENCES products (product_id)
	);
	~~~

1. Create a `product_sales_summary` table that stores summary records. Each record includes the total number of orders and the total value of sales for each product:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE product_sales_summary (
	    product_id UUID PRIMARY KEY,
	    total_orders INT NOT NULL DEFAULT 0,
	    total_sales NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
	    FOREIGN KEY (product_id) REFERENCES products (product_id)
	);
	~~~

1. Create a [trigger function]({% link {{ page.version.version }}/create-function.md %}#create-a-trigger-function) that updates existing summary records, or inserts a new summary record, to reflect each order that is placed:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION update_product_sales_summary()
	RETURNS TRIGGER AS $$
	BEGIN
	    -- Check if the product already exists in the summary table
	    IF EXISTS (SELECT 1 FROM product_sales_summary WHERE product_id = (NEW).product_id) THEN
	        -- Update the existing summary record
	        UPDATE product_sales_summary
	        SET total_orders = total_orders + 1,
	            total_sales = total_sales + ((NEW).quantity * (NEW).price)
	        WHERE product_id = (NEW).product_id;
	    ELSE
	        -- Insert a (NEW) summary record
	        INSERT INTO product_sales_summary (product_id, total_orders, total_sales)
	        VALUES ((NEW).product_id, 1, (NEW).quantity * (NEW).price);
	    END IF;
	    RETURN NULL;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

	`(NEW).quantity * (NEW).price` is the total value of each new order. This value is aggregated into the `total_sales` value in the `product_sales_summary` table.

1. Create a trigger that executes the `update_product_sales_summary` function after an `INSERT` is issued on the `orders` table (i.e., an order is placed):

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TRIGGER trg_update_product_sales_summary
	AFTER INSERT ON orders
	FOR EACH ROW
	EXECUTE FUNCTION update_product_sales_summary();
	~~~

	Because this trigger executes the `update_product_sales_summary` function directly after each row is affected by a SQL operation, it spares you from having to run a potentially expensive query on those values in the `orders` table (e.g., `SUM(quantity * price)`).

1. Set up the example scenario by inserting two sample product names and creating a function to randomly generate orders on those product names:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	INSERT INTO products (product_name) VALUES ('Product A'), ('Product B');
	~~~

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION generate_orders(num_orders INT)
	RETURNS VOID AS $$
	DECLARE
	    product_id_a UUID;
	    product_id_b UUID;
	    order_count INT := 0;
	    random_product_id UUID;
	    random_quantity INT;
	    random_price NUMERIC(10, 2);
	BEGIN
	    -- Retrieve product IDs
	    SELECT product_id INTO product_id_a FROM products WHERE product_name = 'Product A';
	    SELECT product_id INTO product_id_b FROM products WHERE product_name = 'Product B';
	    -- Insert orders
	    WHILE order_count < num_orders LOOP
	        -- Determine random product ID
	        random_product_id := CASE WHEN random() < 0.5 THEN product_id_a ELSE product_id_b END;
	        -- Generate random quantity and price
	        random_quantity := (random() * 10)::INT + 1;
	        random_price := (random() * 100)::NUMERIC(10, 2);
	        -- Insert order
	        INSERT INTO orders (product_id, quantity, price)
	        VALUES (random_product_id, random_quantity, random_price);
	        -- Increment order count
	        order_count := order_count + 1;
	    END LOOP;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

1. Run the example function, generating 100 orders:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT generate_orders(100);
	~~~

1. View some of the orders that were generated:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT * FROM orders limit 5;
	~~~

	~~~
	                order_id               |              product_id              | quantity | price |         order_date
	---------------------------------------+--------------------------------------+----------+-------+-----------------------------
	  02684068-6ff7-4f48-a1e6-c837375bb2f4 | 09b1e8d1-ed15-4777-acaa-384852f51793 |        8 | 85.60 | 2024-11-12 18:33:35.064328
	  049b33b5-9db3-4748-839e-a4af2bbfe2fb | 7780c52f-9d54-4098-a824-c19efdf1b390 |        2 | 32.12 | 2024-11-12 18:33:35.064328
	  05806296-442d-4dc3-84f4-c6f629fbabb9 | 7780c52f-9d54-4098-a824-c19efdf1b390 |        6 | 43.01 | 2024-11-12 18:33:35.064328
	  0b362545-3e08-4c14-b42a-7d3d8013f2b6 | 09b1e8d1-ed15-4777-acaa-384852f51793 |        9 | 35.60 | 2024-11-12 18:33:35.064328
	  0d6d299d-ff06-4ac2-a924-8f704f2cf916 | 7780c52f-9d54-4098-a824-c19efdf1b390 |       10 | 51.84 | 2024-11-12 18:33:35.064328
	~~~

1. View the aggregated results on the summary table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	SELECT * FROM product_sales_summary;
	~~~

	~~~
	               product_id              | total_orders | total_sales
	---------------------------------------+--------------+--------------
	  09b1e8d1-ed15-4777-acaa-384852f51793 |           49 |    13618.14
	  7780c52f-9d54-4098-a824-c19efdf1b390 |           51 |    15594.56
	(2 rows)
	~~~

### Demonstrate `BEFORE` and `AFTER` trigger ordering

In the following example, a combination of `BEFORE` and `AFTER` triggers is used to demonstrate the [order in which they activate](#trigger-ordering).

1. Create a sample table of employees and their wages:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TABLE employees (
	    employee_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	    name VARCHAR(100),
	    wage NUMERIC(10, 2),
	    created_at TIMESTAMP DEFAULT current_timestamp
	);
	~~~

1. Create a [trigger function]({% link {{ page.version.version }}/create-function.md %}#create-a-trigger-function) that checks whether a new wage is below the minimum:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION ensure_minimum_wage()
	RETURNS TRIGGER AS $$
	BEGIN
		RAISE NOTICE 'Starting wage for employee %: %', (NEW).employee_id, (NEW).wage;
    IF (NEW).wage < 15 THEN
        RAISE EXCEPTION 'Wage cannot be below minimum';
    END IF;
    RETURN NEW;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

	The function prints the wage that is initially assigned to the employee. If the new wage is below minimum, the function [raises an exception]({% link {{ page.version.version }}/plpgsql.md %}#report-messages-and-handle-exceptions) to abort the SQL operation that changes the wage. Otherwise, it returns the `NEW` row resulting from the SQL operation.

1. Create a trigger that executes the `ensure_minimum_wage` function before an `INSERT` or `UPDATE` is issued on the `employees` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TRIGGER trg_ensure_minimum_wage
	BEFORE INSERT OR UPDATE ON employees
	FOR EACH ROW
	EXECUTE FUNCTION ensure_minimum_wage();
	~~~

1. Create a trigger function that adds an initial starting bonus of `5` to each new wage:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION give_bonus()
	RETURNS TRIGGER AS $$
	BEGIN
		RAISE NOTICE 'Modifying wage for employee %: % + 5', (NEW).employee_id, (NEW).wage;
		NEW.wage := (NEW).wage + 5;
		RETURN NEW;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

1. Create a trigger that executes the `give_bonus` function before an `INSERT` or `UPDATE` is issued on the `employees` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TRIGGER trg_give_bonus
	BEFORE INSERT OR UPDATE ON employees
	FOR EACH ROW
	EXECUTE FUNCTION give_bonus();
	~~~

	Both `trg_ensure_minimum_wage` and `trg_give_bonus` are `BEFORE` triggers that activate before any `INSERT` or `UPDATE` is issued on `employees`. Because `trg_give_bonus` comes alphabetically after `trg_ensure_minimum_wage`, it activates **second**. For details on this behavior, refer to [Trigger conditions](#trigger-ordering).

1. Create a trigger function that prints an employee's final wage with the bonus applied.

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE OR REPLACE FUNCTION print_final_wage()
	RETURNS TRIGGER AS $$
	BEGIN
	    RAISE NOTICE 'Final wage for employee %: %', (NEW).employee_id, (NEW).wage;
	    RETURN NEW;
	END;
	$$ LANGUAGE PLpgSQL;
	~~~

1. Create a trigger that executes the `print_final_wage` function after an `INSERT` or `UPDATE` is issued on the `employees` table:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	CREATE TRIGGER trg_print_final_wage
	AFTER INSERT OR UPDATE ON employees
	FOR EACH ROW
	EXECUTE FUNCTION print_final_wage();
	~~~

	This `AFTER` trigger activates after the SQL operation and both `BEFORE` triggers are written to `employees`, ensuring that it prints the final value of the row.

1. Test the triggers by adding a new employee with a wage of `20`:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	INSERT INTO employees (name, wage) VALUES ('John Doe', 20);
	~~~

	~~~
	NOTICE: Starting wage for employee 7a80a11a-51ad-4acf-815f-3f5d4b820e17: 20.00
	NOTICE: Modifying wage for employee 7a80a11a-51ad-4acf-815f-3f5d4b820e17: 20.00 + 5
	NOTICE: Final wage for employee 7a80a11a-51ad-4acf-815f-3f5d4b820e17: 25.00
	INSERT 0 1
	~~~

	This output demonstrates the following order of events:

	1. `trg_ensure_minimum_wage` activates before `trg_give_bonus`, so the "Starting wage" message is printed before the "Modifying wage" message.
	1. `trg_give_bonus` receives the `NEW` row value (`20.00`) returned by `trg_ensure_minimum_wage`, which is unmodified from the `INSERT` operation. After printing the "Modifying wage" message, the function adds `5` to the row value and returns a modified `NEW` value.
	1. The `NEW` value is written to the row.
	1. `trg_print_final_wage` prints the "Final wage" message with the committed row value (`25.00`).

1. Add a new employee with a wage of `10`:

	{% include_cached copy-clipboard.html %}
	~~~ sql
	INSERT INTO employees (name, wage) VALUES ('Jane Doe', 10);
	~~~

	~~~ 
	NOTICE: Starting wage for employee f0035967-2123-493b-9e9e-83b568fe61c4: 10.00
	ERROR: Wage cannot be below minimum
	SQLSTATE: P0001
	~~~

	This output demonstrates the following order of events:

	1. `trg_ensure_minimum_wage` prints the "Starting wage" message.
	1. The row value fails the conditional check in `ensure_minimum_wage`, and raises an exception.
	1. The `ERROR` message is printed and the SQL operation is aborted before the `give_bonus` function is executed.

### Video demo

For a deep-dive demo on triggers, play the following video:

{% include_cached youtube.html video_id="OEu5Dbe7ueE" %}

## Known limitations

{% include {{ page.version.version }}/known-limitations/trigger-limitations.md %}

## See also

- [`CREATE TRIGGER`]({% link {{ page.version.version }}/create-trigger.md %})
- [`DROP TRIGGER`]({% link {{ page.version.version }}/drop-trigger.md %})
- [User-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})