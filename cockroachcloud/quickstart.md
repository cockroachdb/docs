---
title: Quickstart with {{ site.data.products.serverless }}
summary: Learn how to create and use your free CockroachDB Cloud cluster.
toc: true
filter_category: qs_crdb_cloud
filter_html: {{ site.data.products.serverless }}
filter_sort: 1
---

{% include filter-tabs.md %}

This page guides you through the quickest way to get started with CockroachDB. You'll start a free {{ site.data.products.serverless }} cluster, connect with the CockroachDB SQL client, insert some data, and then read the data from a sample application.

To run CockroachDB on your local machine instead, see [Start a Local Cluster](../stable/secure-a-cluster.html).

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **Serverless**.

    Unless you change your monthly budget, this cluster will be free forever.

1. Click **Create cluster**.

    Your cluster will be created in a few seconds and the **Connection info** dialog will display.

1. Click the **Connection string** tab in the **Connection info** dialog and copy the connection string in step 2 to a secure location.

    {{site.data.alerts.callout_danger}}
    The connection string in the command is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

## Step 2. Connect to the cluster

The **Connection info** dialog shows information about how to connect to your cluster for the client OS.

<div class="filters clearfix">
  <button class="filter-button page-level" data-scope="mac">Mac</button>
  <button class="filter-button page-level" data-scope="linux">Linux</button>
  <button class="filter-button page-level" data-scope="windows">Windows</button>
</div>

1. In the **Connection info** dialog, choose your OS.
1. Open a terminal on your local machine.
1. Run the commands in each step of the **Command Line** tab of the **Connection info** dialog.
   1. Run the command in step 1 to install the CockroachDB binary and add it to your OS's `PATH`.
   1. Run the command in step 2 to download the CA certificate to your local machine.
   1. Run the command in step 3 to connect to your cluster using the SQL client.

You will see a welcome message when you've successfully connected to your cluster:

~~~ text
#
# Welcome to the CockroachDB SQL shell.
# All statements must be terminated by a semicolon.
# To exit, type: \q.
#
~~~

## Step 3. Insert data

1. You can now run [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE messages (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), message STRING);
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO messages (message) VALUES ('Hello world!');
    ~~~

1. To exit the SQL shell:

    {% include_cached copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

## Step 4. Run a sample app

<div class="filters clearfix">
  <button class="filter-button" data-scope="node">Node.js</button>
  <button class="filter-button" data-scope="python">Python</button>
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

1. Create an `app.js` file on your local machine and copy the following code into it:

    {% include_cached copy-clipboard.html %}
    ~~~ javascript
    const parse = require("pg-connection-string").parse;
    const { Client } = require("pg");
    const prompt = require("prompt");

    (async () => {

      prompt.start()
      const URI = await prompt.get("connectionString");
      var connectionString;
      // Expand $env:appdata environment variable in Windows connection string
      if (URI.connectionString.includes("env:appdata")) {
        connectionString = await URI.connectionString.replace(
          "$env:appdata",
          process.env.APPDATA
        );
      }
      // Expand $HOME environment variable in UNIX connection string
      else if (URI.connectionString.includes("HOME")) {
        connectionString = await URI.connectionString.replace(
          "$HOME",
          process.env.HOME
        );
      }
      var config = parse(connectionString);
      config.port = 26257;
      config.database = 'defaultdb';
      const client = new Client(config);

      try {
        await client.connect();
        const result = await client.query('SELECT message FROM messages')
        console.log(result.rows[0].message)
        await client.end()
      } catch (err) {
        console.log(`error connecting: ${err}`)
      }

      // Exit program
      process.exit();
    })().catch((err) => console.log(err.stack));
    ~~~

    The application:

    1. Attempts to connect to a running cluster, given a connection string.
    1. Reads the sample data you inserted earlier.
    1. Prints the data to the terminal.

1. Create a `package.json` file and paste in the following code:

    {% include_cached copy-clipboard.html %}
    ~~~ json
    {
      "dependencies": {
        "pg": "latest",
        "pg-connection-string": "latest",
        "prompt": "latest"
      }
    }
    ~~~

1. Initialize and run the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    node app.js
    ~~~

    In the **Connection info** dialog, go to the **Connection string** tab, copy the connection string from step 2, and paste it in your terminal.

    ~~~
    prompt: connectionString:
    ~~~

    After entering the connection string, the program will execute. The output will look like this:

    ~~~
    Hello world!
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="python">

1. Install SQLAlchemy.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    pip install psycopg2-binary
    ~~~

1. Create a `main.py` file and copy in the following code:

    {% include_cached copy-clipboard.html %}
    ~~~ python
    import logging
    import os
    import psycopg2


    def print_hello(conn):
      with conn.cursor() as cur:
          cur.execute("SELECT message FROM messages")
          logging.debug("print_hello(): status message: %s", cur.statusmessage)
          rows = cur.fetchall()
          conn.commit()
          for row in rows:
              print(row[0])


    def main():
      conn_string = input('Enter a connection string:\n')

      conn = psycopg2.connect(os.path.expandvars(conn_string))
      print_hello(conn)

      # Close communication with the database.
      conn.close()


    if __name__ == "__main__":
        main()
    ~~~

    The application:

    1. Attempts to connect to a running cluster, given a connection string.
    1. Reads the sample data you inserted earlier.
    1. Prints the data to the terminal.

1. Run the application:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    python3 main.py
    ~~~

    The program will prompt you for a connection string to the database:

    ~~~
    Enter a connection string:
    ~~~

1. Back in the **Connection info** dialog, click **Connection string**, copy the connection string from step 2, and paste it in your terminal after the "Enter a connection string" prompt.

    {{site.data.alerts.callout_info}}
    If the connection string does not include your SQL user password, replace `<ENTER-PASSWORD>` with the password.
    {{site.data.alerts.end}}

    The program will then execute. The output should look like this:

    ~~~
    Hello world!
    ~~~
</section>

<section class="filter-content" markdown="1" data-scope="go">

1. Create a `main.go` file on your local machine and copy the following code into it:

    {% include_cached copy-clipboard.html %}
    ~~~ go
    package main
    import (
    	"bufio"
    	"context"
    	"log"
    	"os"
    	"github.com/jackc/pgx/v4"
    )
    func readRows(conn *pgx.Conn) error {
        rows, err := conn.Query(context.Background(), "SELECT message FROM messages")
        if err != nil {
            log.Fatal(err)
        }
        defer rows.Close()
        for rows.Next() {
            var message string
            if err := rows.Scan(&message); err != nil {
                log.Fatal(err)
            }
            log.Printf(message)
        }
        return nil
    }
    func main() {
    	// Read in connection string
    	scanner := bufio.NewScanner(os.Stdin)
    	log.Println("Enter a connection string: ")
    	scanner.Scan()
    	connstring := scanner.Text()
    	// Attempt to connect
    	config, err := pgx.ParseConfig(os.ExpandEnv(connstring))
    	if err != nil {
    		log.Fatal("error configuring the database: ", err)
    	}
    	conn, err := pgx.ConnectConfig(context.Background(), config)
    	if err != nil {
    		log.Fatal("error connecting to the database: ", err)
    	}
      // Read rows
      readRows(conn)
      defer conn.Close(context.Background())
    }
    ~~~

    The `main` method of this program does the following:

    1. Attempts to connect to a running cluster, given a connection string.
    1. Reads the sample data you inserted earlier.
    1. Prints the data to the terminal.

1. Initialize and run the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample && go mod tidy
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go run main.go
    ~~~

    The program will prompt you for a connection string to the database:

    ~~~
    Enter a connection string:
    ~~~

1. Back in the **Connection info** dialog, click **Connection string**, copy the connection string from step 2, and paste it in your terminal after the "Enter a connection string" prompt.

    {{site.data.alerts.callout_info}}
    If the connection string does not include your SQL user password, replace `<ENTER-PASSWORD>` with the password.
    {{site.data.alerts.end}}

    The program will then execute. The output should look like this:

    ~~~
    Hello world!
    ~~~

</section>
<br/>{% comment %}Need to add this manual break to force Jekyll to render the next section correctly {% endcomment %}
<section class="filter-content" markdown="1" data-scope="java">

1. Clone the following GitHub repository and check out the `serverless` branch:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    git clone https://github.com/cockroachlabs/hello-world-java-jdbc.git
    cd hello-world-java-jdbc
    git checkout serverless
    ~~~

1. In a text editor modify `app/src/main/java/example/app/App.java` with the settings from the **Connection parameters** tab of the **Connection info** dialog to connect to the cluster:

    <div class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ java
    ds.setServerNames(new String[]{"{host}"});
    ds.setDatabaseName("{database}");
    ds.setUser("{username}");
    ds.setPassword("{password}");
    ds.setSslRootCert(System.getenv("$HOME/.postgresql/root.crt"));
    ~~~
    </div>
    <div class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ java
    ds.setServerNames(new String[]{"{host}"});
    ds.setDatabaseName("{database}");
    ds.setUser("{username}");
    ds.setPassword("{password}");
    ds.setSslRootCert(System.getenv("$HOME/.postgresql/root.crt"));
    ~~~
    </div>
    <div class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ java
    ds.setServerNames(new String[]{"{host}"});
    ds.setDatabaseName("{database}");
    ds.setUser("{username}");
    ds.setPassword("{password}");
    ds.setSslRootCert(System.getenv("%APPDATA%/.postgresql/root.crt"));
    ~~~
    </div>

    Where:
    - `{host}` is the host for your cluster.
    - `{database}` is the [routing ID](connect-to-a-serverless-cluster.html?filters=connection-string#step-2-connect-to-your-cluster) plus `.defaultdb`. For example, `funny-duck-3.defaultdb`.
    - `{username}` is the SQL username.
    - `{password}` is the SQL user password.
    - Make sure `ds.setSslRootCert` is set to the correct path for your OS to the `root.crt` CA certificate you downloaded earlier.

1. Run the application using `gradlew`:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ./gradlew run
    ~~~

    The application connects to the cluster using the JDBC parameters specified in the data source, then executes a `SELECT` statement and displays the results.

    The output should look like this:

    ~~~
    > Task :app:run
    Hello world!

    BUILD SUCCESSFUL in 3s
    2 actionable tasks: 2 executed
    ~~~

</section>

## Next steps

You've successfully created your {{ site.data.products.serverless }} cluster, connected to it using the SQL client, and run some basic SQL statements.

- Build a simple CRUD application in [Go](../{{site.versions["stable"]}}/build-a-go-app-with-cockroachdb.html), [Java](../{{site.versions["stable"]}}/build-a-java-app-with-cockroachdb.html), [Node.js](../{{site.versions["stable"]}}/build-a-nodejs-app-with-cockroachdb.html), or [Python](../{{site.versions["stable"]}}/build-a-python-app-with-cockroachdb.html).
- [Learn CockroachDB SQL](learn-cockroachdb-sql.html).
- [Create and manage SQL users](user-authorization.html).
- Explore our [example apps](../{{site.versions["stable"]}}/example-apps.html) for examples on how to build applications using your preferred driver or ORM and run it on {{ site.data.products.serverless }}.

## Learn more

This page outlines the quickest way to get started with CockroachDB. For information on other options that are available when creating a {{ site.data.products.serverless }} cluster, see the following:

- To create a free cluster with other configurations (e.g., a different cloud provider, region, or monthly budget), see [Create a {{ site.data.products.serverless }} Cluster](create-a-serverless-cluster.html).
- To connect to a free cluster with other options (e.g., a different SQL user) and connection methods (with an application or [CockroachDB compatible tool](../stable/third-party-database-tools.html)), see [Connect to a {{ site.data.products.serverless }} Cluster](connect-to-a-serverless-cluster.html).
- To watch a video walkthrough of connecting to a cluster, see [How to connect to {{ site.data.products.db }} and Import Data](https://www.youtube.com/watch?v=XJZD1rorEQE).
