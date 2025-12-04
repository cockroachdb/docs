- To keep your database credentials out of shell history and logs, follow these best practices when specifying your source and target connection strings:

	- Avoid plaintext connection strings.

	- Provide your connection strings as environment variables. For example:

		~~~ shell
		export SOURCE="postgres://migration_user:a%2452%26@localhost:5432/migration_db?sslmode=verify-full"
		export TARGET="postgres://root@localhost:26257/defaultdb?sslmode=verify-full"
		~~~

		Afterward, reference the environment variables in MOLT commands:

		{% if page.name == "molt-replicator.md" %}
		~~~
		--sourceConn $SOURCE
		--targetConn $TARGET
		~~~
		{% else %}
		~~~
		--source $SOURCE
		--target $TARGET
		~~~
		{% endif %}

	- If possible, use an external secrets manager to load the environment variables from stored secrets.

- Use TLS-enabled connection strings to encrypt data in transit from MOLT to the database. When using TLS certificates, ensure certificate files are accessible to the MOLT binary on the same machine.

	For example, a PostgreSQL connection string with TLS certificates:

	{% include_cached copy-clipboard.html %}
	~~~
	postgresql://migration_user@db.example.com:5432/appdb?sslmode=verify-full&sslrootcert=/etc/migration_db/certs/ca.pem&sslcert=/etc/migration_db/certs/client.crt&sslkey=/etc/migration_db/certs/client.key
	~~~

- URL-encode connection strings for the source database and [CockroachDB]({% link {{site.current_cloud_version}}/connect-to-the-database.md %}) so special characters in passwords are handled correctly.

	- Given a password `a$52&`, pass it to the `molt escape-password` command with single quotes:

		{% include_cached copy-clipboard.html %}
		~~~ shell
		molt escape-password --password 'a$52&'
		~~~

		Use the encoded password in your connection string. For example:

		~~~
		postgres://migration_user:a%2452%26@localhost:5432/migration_db
		~~~

- Remove `sslmode=disable` from production connection strings.