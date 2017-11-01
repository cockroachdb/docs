# Goals

Create and manage users - https://www.cockroachlabs.com/docs/stable/create-and-manage-users.html
Privileges - https://www.cockroachlabs.com/docs/stable/privileges.html

# Presentation

/----------------------------------------/

## Agenda

- What is it?
- Users
- Privileges

/----------------------------------------/

## What is it?

Because you don't want everything running as `root`, CockroachDB supports users and privileges.

/----------------------------------------/

## Users

The `cockroach` process starts with a `root` user; however, it has access to do _everything_ in your cluster.

As a best practice, you want to create more/different users.

/----------------------------------------/

## Creating Users

~~~ shell
$ cockroach user set
~~~

- Insecure deployments should include `--password` to create a level of security
- Secure deployments require a user certificate to connect (recommended and covered in the next section) or a password (less secure)

/----------------------------------------/

## Connecting As Users

Directly:

cockroach sql --insecure --user=jpointsman

cockroach sql --certs-dir=certs --user=jpointsman

Connection String

postgresql://user@localhost/test?password=secret&ssl=false

postgresql://user@localhost/test?password=secret&ssl=true

/----------------------------------------/

## Privileges

Some actions can only be performed by `root`, e.g. enterprise `BACKUP` and `RESTORE`.

The rest, though, can be controlled by SQL privileges through `GRANT`:

~~~ shell
$ CREATE
~~~, `DROP`, `GRANT`, `SELECT`, `INSERT`, `DELETE`, `UPDATE`

/----------------------------------------/

## User Privileges

Simple `GRANT` statements:

~~~ shell
$ GRANT ALL ON DATABASE app TO jalil
~~~

~~~ shell
$ GRANT INSERT ON customers TO niraj
~~~

/----------------------------------------/

## Recap

- Users can authenticate with SSL certs (recommended) or passwords
- Users can connect directly through the SQL shell or through a connection string
- You can control user's privileges through `GRANT`