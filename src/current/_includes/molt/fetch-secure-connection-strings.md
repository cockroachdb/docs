To keep your database credentials out of shell history and logs, follow these best practices when specifying your source and target connection strings:

- Avoid plaintext connection strings.

- URL-encode connection strings for the source database and [CockroachDB]({% link {{site.current_cloud_version}}/connect-to-the-database.md %}) so special characters in passwords are handled correctly.

	- Given a password `a$52&`, pass it to the `molt escape-password` command with single quotes:

		{% include_cached copy-clipboard.html %}
		~~~ shell
		molt escape-password 'a$52&'
		~~~

		Use the encoded password in your `--source` connection string. For example:

		~~~
		--source 'postgres://postgres:a%2452%26@localhost:5432/replicationload'
		~~~
		
- Provide your connection strings as environment variables.	For example:

	~~~ shell
	export SOURCE="postgres://postgres:postgres@localhost:5432/molt?sslmode=verify-full"
	export TARGET="postgres://root@localhost:26257/molt?sslmode=verify-full"
	~~~

	Afterward, reference the environment variables as follows:

	~~~
	--source $SOURCE
	--target $TARGET
	~~~

- If possible, use an external secrets manager to load the environment variables from stored secrets.