In the SQL shell, create the `bank` database that your application will use:

```sql
CREATE DATABASE bank;
```{{execute}}

Create a SQL user for your app:

```sql
CREATE USER <username> WITH PASSWORD <password>;
```{{execute}}

**Tip:** Take note of the username and password. You will use it in your application code later.

Give the user the necessary permissions:

```sql
GRANT ALL ON DATABASE bank TO <username>;
```{{execute}}
