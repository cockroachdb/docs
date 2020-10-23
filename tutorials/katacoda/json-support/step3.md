Next, create a database called `jsonb_test`:

```sql
CREATE DATABASE jsonb_test;
```{{execute T2}}

Set the database as the default:

```sql
SET DATABASE = jsonb_test;
```{{execute T2}}

Then [grant privileges](https://www.cockroachlabs.com/docs/stable/grant.html) to the `maxroach` user:

```sql
GRANT ALL ON DATABASE jsonb_test TO maxroach;
```{{execute T2}}
