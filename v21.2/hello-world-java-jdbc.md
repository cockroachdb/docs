---
title: Build a Hello World App with CockroachDB and JDBC
summary: Learn how to use CockroachDB from a Hello World Java application.
toc: true
twitter: false
referral_id: docs_hello_world_java_jdbc
---

This tutorial shows you how build a simple Hello World Java application with CockroachDB and the [JDBC](https://jdbc.postgresql.org/) driver.

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/hello-world-java-jdbc/
~~~

<div class="filter-content" markdown="1" data-scope="cockroachcloud">

Check out the `cockroachcloud` branch:

{% include_cached copy-clipboard.html %}
~~~shell
git checkout cockroachcloud
~~~

</div>

The `app/src/main/java/example/app/App.java` file contains all of the code for the sample Hello World app:

{% include_cached copy-clipboard.html %}
~~~ java
{% remote_include https://raw.githubusercontent.com/cockroachlabs/hello-world-java-jdbc/master/app/src/main/java/example/app/App.java %}
~~~

The `main` method of this program does the following:

1. Attempts to connect to a running cluster, given some connection information.
2. Prints a message to the terminal about the connection status.

## Step 3. Run the code

<section class="filter-content" markdown="1" data-scope="cockroachcloud">

### Update the connection parameters

In a text editor modify `app/src/main/java/example/app/App.java` with the settings to connect to the cluster:

{% include_cached copy-clipboard.html %}
~~~ java
ds.setServerNames(new String[]{"{globalhost}"});
ds.setDatabaseName("{cluster_name}.defaultdb");
ds.setUser("{username}");
ds.setPassword("{password}");
ds.setSslRootCert(System.getenv("{path to the CA certificate}"));
~~~

{% include {{page.version.version}}/app/cc-free-tier-params.md %}

{{site.data.alerts.callout_success}}
For guidance on connection pooling, with an example using JDBC and [HikariCP](https://github.com/brettwooldridge/HikariCP), see [Connection Pooling](connection-pooling.html).
{{site.data.alerts.end}}

</section>

Compile and run the code:

{% include_cached copy-clipboard.html %}
~~~ shell
./gradlew run
~~~

<section class="filter-content" markdown="1" data-scope="local">

The app will prompt you for the password to the demo cluster:

~~~
> Task :app:run
Enter the demo password:
<=========----> 75% EXECUTING [22s]
~~~

Enter the password.

</section>

The output should look like this:

~~~
Hey! You successfully connected to your CockroachDB cluster.
~~~


## See also

- [Build a Simple CRUD Java App with CockroachDB](build-a-java-app-with-cockroachdb.html)

{% include {{page.version.version}}/app/see-also-links.md %}

