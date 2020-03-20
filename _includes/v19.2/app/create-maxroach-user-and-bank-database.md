Start the [built-in SQL shell](cockroach-sql.html):

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --certs-dir=certs
~~~

In the SQL shell, create the `maxroach` user and `bank` database:

<section class="filter-content" markdown="1" data-scope="secure">

{{site.data.alerts.callout_info}}
You'll use the password later to access the Admin UI.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach WITH PASSWORD 'roach';
~~~
</section>

<section class="filter-content" markdown="1" data-scope="insecure">

{% include copy-clipboard.html %}
~~~ sql
> CREATE USER IF NOT EXISTS maxroach;
~~~

</section>

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

Give the `maxroach` user the necessary permissions:

{% include copy-clipboard.html %}
~~~ sql
> GRANT ALL ON DATABASE bank TO maxroach;
~~~

<section class="filter-content" markdown="1" data-scope="secure">

In secure clusters, [certain pages of the Admin UI](admin-ui-overview.html#admin-ui-access) can only be accessed by `admin` users, so assign `maxroach` to the `admin` role as well:

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO system.role_members (role, member, "isAdmin")
    VALUES ('admin', 'maxroach', true);
~~~

</section>

Exit the SQL shell:

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~
