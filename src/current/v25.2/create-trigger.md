---
title: CREATE TRIGGER
summary: The CREATE TRIGGER statement creates a trigger on a specified table.
toc: true
keywords:
docs_area: reference.sql
---

The `CREATE TRIGGER` [statement]({% link {{ page.version.version }}/sql-statements.md %}) defines a [trigger]({% link {{ page.version.version }}/triggers.md %}) on a specified table.

## Required privileges

To create a trigger, a user must have [`CREATE` privilege]({% link {{ page.version.version }}/security-reference/authorization.md %}#supported-privileges) on the schema of the trigger.

## Synopsis

<div>
{% remote_include https://raw.githubusercontent.com/cockroachdb/generated-diagrams/{{ page.release_info.crdb_branch_name }}/grammar_svg/create_trigger.html %}
</div>

## Parameters

|       Parameter       |                                                                                                 Description                                                                                                 |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `trigger_create_name` | The name of the trigger.                                                                                                                                                                                    |
| `table_name`          | The name of the table associated with the trigger.                                                                                                                                                          |
| `func_name`           | The [trigger function]({% link {{ page.version.version }}/triggers.md %}#trigger-function) that is executed when the trigger activates.                                                                     |
| `a_expr`              | Boolean condition that determines if the trigger function should execute for a given row. For details, refer to [Trigger conditions]({% link {{ page.version.version }}/triggers.md %}#trigger-conditions). |
| `trigger_func_args`   | A comma-separated list of constant string arguments.                                                                                                                                                        |

## Examples

The following are examples of basic triggers. For more detailed examples of trigger usage, see [Triggers]({% link {{ page.version.version }}/triggers.md %}#examples).

### Create a `BEFORE` trigger

Create a sample table:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE lock_table (
    id INT PRIMARY KEY,
    name TEXT NOT NULL,
    is_locked BOOLEAN DEFAULT FALSE
);
~~~

Populate `lock_table` with sample values:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO lock_table VALUES (1, 'Record 1', FALSE);
INSERT INTO lock_table VALUES (2, 'Record 2', TRUE);
~~~

Create a [trigger function]({% link {{ page.version.version }}/triggers.md %}#trigger-function) that prevents "locked" rows from being deleted:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION prevent_delete_locked()
RETURNS TRIGGER AS $$
BEGIN
  IF (OLD).is_locked THEN
    RAISE EXCEPTION 'Record is locked and cannot be deleted';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE PLpgSQL;
~~~

Create a trigger that executes `prevent_delete_locked` before a `DELETE` is issued on `lock_table`:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER prevent_locked_delete
BEFORE DELETE ON lock_table
FOR EACH ROW
EXECUTE FUNCTION prevent_delete_locked();
~~~

Test the trigger by attempting to delete a row:

{% include_cached copy-clipboard.html %}
~~~ sql
DELETE FROM lock_table WHERE id = 2;
~~~

~~~
ERROR: Record is locked and cannot be deleted
SQLSTATE: P0001
~~~

View `lock_table` to verify that the row was not deleted:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM lock_table;
~~~

~~~
  id |   name   | is_locked
-----+----------+------------
   1 | Record 1 |     f
   2 | Record 2 |     t
(2 rows)
~~~

### Create an `AFTER` trigger

Create two sample tables. `stock` contains a product inventory, and `orders_placed` contains a list of orders on those products:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE stock (
"product_id" STRING PRIMARY KEY,
"quantity_on_hand" INTEGER NOT NULL DEFAULT 1
);
~~~

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TABLE orders_placed (
"product_id" STRING NOT NULL REFERENCES stock ("product_id"),
"quantity" INTEGER NOT NULL DEFAULT 1
);
~~~

Populate `stock` with three products each at `1000` count:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO stock ("product_id", "quantity_on_hand") VALUES ('a', 1000), ('b', 1000), ('c', 1000);
~~~

Create a [trigger function]({% link {{ page.version.version }}/triggers.md %}#trigger-function) that updates the `stock` table to reflect the quantity on hand after each order that is placed:

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE FUNCTION update_stock_after_order()
RETURNS TRIGGER
AS $$
BEGIN
  UPDATE stock
  SET quantity_on_hand = quantity_on_hand - (NEW).quantity
  WHERE stock.product_id = (NEW).product_id;
  RETURN NULL;
END;
$$ LANGUAGE PLpgSQL;
~~~

Create a trigger that executes `update_stock_after_order` after an `INSERT` is issued on `orders_placed` (i.e., an order is placed):

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE TRIGGER trg_update_stock_after_order
AFTER INSERT ON orders_placed
FOR EACH ROW
EXECUTE FUNCTION update_stock_after_order();
~~~

Test the trigger by inserting some sample orders:

{% include_cached copy-clipboard.html %}
~~~ sql
INSERT INTO orders_placed (product_id, quantity) VALUES ('a', 1), ('b', 3);
~~~

View the `stock` table to see that the quantities have decreased accordingly:

{% include_cached copy-clipboard.html %}
~~~ sql
SELECT * FROM stock;
~~~

~~~
  product_id | quantity_on_hand
-------------+-------------------
  a          |              999
  b          |              997
  c          |             1000
(3 rows)
~~~

## See also

- [Triggers]({% link {{ page.version.version }}/triggers.md %})
- [`DROP TRIGGER`]({% link {{ page.version.version }}/drop-trigger.md %})
- [User-defined functions]({% link {{ page.version.version }}/user-defined-functions.md %})
- [`CREATE FUNCTION`]({% link {{ page.version.version }}/create-function.md %})
- [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %})