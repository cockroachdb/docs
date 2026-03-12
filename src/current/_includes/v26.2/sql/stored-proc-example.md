The following {% if page.name == "stored-procedures.md" %}stored procedure{% else %}[stored procedure]({% link {{ page.version.version }}/user-defined-functions.md %}){% endif %} removes a specified number of earliest rides in `vehicle_location_histories`.

It uses the {% if page.name == "plpgsql.md" %}PL/pgSQL{% else %}[PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}){% endif %} [`WHILE`]({% link {{ page.version.version }}/plpgsql.md %}#write-loops) syntax to iterate through the rows, [`RAISE`] to return notice and error messages, and `REFCURSOR` to define a cursor that fetches the next rows to be affected by the procedure.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE delete_earliest_histories (
	num_deletions INT, remaining_histories REFCURSOR
)
LANGUAGE PLpgSQL
AS $$
DECLARE
	counter INT := 0;
	deleted_timestamp TIMESTAMP;
	deleted_ride_id UUID;
	latest_timestamp TIMESTAMP;
BEGIN
	-- Raise an exception if the table has fewer rows than the number to delete
	IF (SELECT COUNT(*) FROM vehicle_location_histories) < num_deletions THEN
	    RAISE EXCEPTION 'Only % row(s) in vehicle_location_histories',
	    (SELECT count(*) FROM vehicle_location_histories)::STRING;
	END IF;

	-- Delete 1 row with each loop iteration, and report its timestamp and ride ID
	WHILE counter < num_deletions LOOP
		DELETE FROM vehicle_location_histories
		WHERE timestamp IN (
			SELECT timestamp FROM vehicle_location_histories
			ORDER BY timestamp
			LIMIT 1
		)
		RETURNING ride_id, timestamp INTO deleted_ride_id, deleted_timestamp;
	
		-- Report each row deleted
		RAISE NOTICE 'Deleted ride % with timestamp %', deleted_ride_id, deleted_timestamp;

		counter := counter + 1;
	END LOOP;

	-- Open a cursor for the remaining rows in the table
	OPEN remaining_histories FOR SELECT * FROM vehicle_location_histories ORDER BY timestamp;
END;
$$;
~~~

Open a [transaction]({% link {{ page.version.version }}/transactions.md %}):

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN;
~~~

Call the stored procedure, specifying 5 rows to delete and a `rides_left` cursor name:

{% include_cached copy-clipboard.html %}
~~~ sql
CALL delete_earliest_histories (5, 'rides_left');
~~~

~~~
NOTICE: Deleted ride 0a3d70a3-d70a-4d80-8000-000000000014 with timestamp 2019-01-02 03:04:05
NOTICE: Deleted ride 0b439581-0624-4d00-8000-000000000016 with timestamp 2019-01-02 03:04:05.001
NOTICE: Deleted ride 09ba5e35-3f7c-4d80-8000-000000000013 with timestamp 2019-01-02 03:04:05.002
NOTICE: Deleted ride 0fdf3b64-5a1c-4c00-8000-00000000001f with timestamp 2019-01-02 03:04:05.003
NOTICE: Deleted ride 049ba5e3-53f7-4ec0-8000-000000000009 with timestamp 2019-01-02 03:04:05.004
CALL
~~~

Use the cursor to fetch the 3 earliest remaining rows in `vehicle_location_histories`:

{% include_cached copy-clipboard.html %}
~~~ sql
FETCH 3 from rides_left;
~~~

~~~
    city   |               ride_id                |        timestamp        | lat | long
-----------+--------------------------------------+-------------------------+-----+-------
  new york | 0c49ba5e-353f-4d00-8000-000000000018 | 2019-01-02 03:04:05.005 |  -88 |  -83
  new york | 0083126e-978d-4fe0-8000-000000000001 | 2019-01-02 03:04:05.006 |  170 |  -16
  new york | 049ba5e3-53f7-4ec0-8000-000000000009 | 2019-01-02 03:04:05.007 | -149 |   63
~~~

If the procedure is called again, these rows will be the first 3 to be deleted.

{% if page.name == "stored-procedures.md" %}
#### Example details

The example works as follows:

[`CREATE PROCEDURE`]({% link {{ page.version.version }}/create-procedure.md %}) defines a stored procedure called `delete_earliest_histories` with an `INT` and a `REFCURSOR` parameter.

{% include_cached copy-clipboard.html %}
~~~ sql
CREATE OR REPLACE PROCEDURE delete_earliest_histories (
	num_deletions INT, remaining_histories REFCURSOR
  )
~~~

`LANGUAGE` specifies [PL/pgSQL]({% link {{ page.version.version }}/plpgsql.md %}) as the language for the stored procedure.

{% include_cached copy-clipboard.html %}
~~~ sql
LANGUAGE PLpgSQL
~~~

`DECLARE` specifies the [PL/pgSQL variable definitions]({% link {{ page.version.version }}/plpgsql.md %}#declare-a-variable) that are used in the procedure body.

{% include_cached copy-clipboard.html %}
~~~ sql
DECLARE
	counter INT := 0;
	deleted_timestamp TIMESTAMP;
	deleted_ride_id UUID;
	latest_timestamp TIMESTAMP;
~~~

`BEGIN` and `END` [group the PL/pgSQL statements]({% link {{ page.version.version }}/plpgsql.md %}#structure) in the procedure body.

{% include_cached copy-clipboard.html %}
~~~ sql
BEGIN
  ...
  END
~~~

The following [`IF ... THEN`]({% link {{ page.version.version }}/plpgsql.md %}#write-conditional-statements) statement [raises an exception]({% link {{ page.version.version }}/plpgsql.md %}#report-messages-and-handle-exceptions) if `vehicle_location_histories` has fewer rows than the number specified with `num_deletions`. If the exception is raised within an open transaction, the transaction will abort.

~~~ sql
IF (SELECT COUNT(*) FROM vehicle_location_histories) < num_deletions THEN
	RAISE EXCEPTION 'Only % row(s) in vehicle_location_histories', (SELECT count(*) FROM vehicle_location_histories)::STRING;
  END IF;
~~~

The following [`WHILE`]({% link {{ page.version.version }}/plpgsql.md %}#write-loops) loop deletes rows iteratively from `vehicle_location_histories`, stopping when the number of loops reaches the `num_deletions` value.

The `DELETE ... RETURNING ... INTO` statement assigns column values from each deleted row into separate variables. For more information about assigning variables, see [Assign a result to a variable]({% link {{ page.version.version }}/plpgsql.md %}#assign-a-result-to-a-variable).

Finally, the [`RAISE NOTICE`]({% link {{ page.version.version }}/plpgsql.md %}#report-messages-and-handle-exceptions) statement reports these values for each deleted row.

~~~ sql
WHILE counter < num_deletions LOOP
	DELETE FROM vehicle_location_histories
	WHERE timestamp IN (
  	SELECT timestamp FROM vehicle_location_histories
  	ORDER BY timestamp
  	LIMIT 1
	)
	RETURNING ride_id, timestamp INTO deleted_ride_id, deleted_timestamp;
	RAISE NOTICE 'Deleted ride % with timestamp %', deleted_ride_id, deleted_timestamp;
	counter := counter + 1;
  END LOOP;
~~~

The `OPEN` statement [opens a cursor]({% link {{ page.version.version }}/plpgsql.md %}#open-and-use-cursors) for all remaining rows in `vehicle_location_histories`, sorted by timestamp. After calling the procedure in an open transaction, the cursor can be used to fetch rows from the table.

{% include_cached copy-clipboard.html %}
~~~ sql
OPEN remaining_histories FOR SELECT * FROM vehicle_location_histories ORDER BY timestamp;
~~~

{% else %}
For more details on this example, see the [Stored Procedures documentation]({% link {{ page.version.version }}/stored-procedures.md %}#example-details).

{% endif %}