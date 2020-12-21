In the SQL shell, create the `bank` database that your application will use:

```sql
CREATE DATABASE bank;
```{{execute}}

Create a SQL user for your app:

```sql
CREATE USER python WITH PASSWORD test;
```{{execute}}

Give the user the necessary permissions:

```sql
GRANT ALL ON DATABASE bank TO python;
```{{execute}}
