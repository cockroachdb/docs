---
title: Quickstart with CockroachCloud Free (beta)
summary: Learn how to create and use your free {{ site.data.products.db }} cluster.
toc: true
---

<div class="filters clearfix">
    <a href="quickstart.html"><button class="filter-button page-level current">{{ site.data.products.serverless }}</button></a>
    <a href="quickstart-trial-cluster.html"><button class="filter-button page-level">{{ site.data.products.dedicated }}</button></a>
</div>

This page shows you the quickest way to get started with CockroachDB. You'll start a free {{ site.data.products.serverless }} cluster, connect with the CockroachDB SQL client, insert some data, and then read the data from a sample application.

{% include cockroachcloud/free-limitations.md %}

## Step 1. Create a free cluster

1. If you haven't already, <a href="https://cockroachlabs.cloud/signup?referralId=docs_quickstart_free" rel="noopener" target="_blank">sign up for a {{ site.data.products.db }} account</a>.
1. [Log in](https://cockroachlabs.cloud/) to your {{ site.data.products.db }} account.
1. On the **Clusters** page, click **Create Cluster**.
1. On the **Create your cluster** page, select **{{ site.data.products.serverless-plan }}**.
1. Click **Create your free cluster**.

    In approximately 20-30 seconds, your cluster will be ready and the **Connection info** dialog will display.

## Step 2. Connect to the cluster

1. In the **Connection info** dialog, choose your OS.
1. Open a terminal on your local machine.
1. Copy the first command from the dialog and run it in your terminal. This installs the CockroachDB binary and copies it into the `PATH`.

    We've included the command here for convenience:

    <div class="filters clearfix">
      <button class="filter-button page-level" data-scope="mac">Mac</button>
      <button class="filter-button page-level" data-scope="linux">Linux</button>
      <button class="filter-button page-level" data-scope="windows">Windows</button>
    </div>

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.darwin-10.9-amd64.tgz | tar -xJ && cp -i cockroach-{{ page.release_info.version }}.darwin-10.9-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-{{ page.release_info.version }}.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ErrorActionPreference = "Stop"; [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ProgressPreference = 'SilentlyContinue'; mkdir -p $env:appdata/cockroach; Invoke-WebRequest -Uri https://binaries.cockroachdb.com/cockroach-{{ page.release_info.version }}.windows-6.2-amd64.zip -OutFile cockroach.zip; Expand-Archive -Path cockroach.zip; Copy-Item "cockroach/cockroach-{{ page.release_info.version }}.windows-6.2-amd64/cockroach.exe" -Destination $env:appdata/cockroach; $Env:PATH += ";$env:appdata/cockroach"
    ~~~
    </section>

1. Copy the second command from the dialog and run it in your terminal. This creates a new `certs` directory on your local machine and downloads the CA certificate to that directory.

    We've included the command here for convenience but with some placeholder values. It's easiest to use the command directly from the **Connection info** dialog.

    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~

    Your `cert` file will be downloaded to `~/.postgres/root.crt`.
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">    
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl --create-dirs -o ~/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/<cluster-id>/cert
    ~~~

    Your `cert` file will be downloaded to `~/.postgres/root.crt`.
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir -p $env:appdata\.postgresql\; Invoke-WebRequest -Uri https://cockroachlabs.cloud/clusters/<cluster-id>/cert -OutFile $env:appdata\.postgresql\root.crt
    ~~~

    Your `cert` file will be downloaded to `%APPDATA%/.postgres/root.crt`.
    </section>

1. Copy the third command from the dialog and run it in your terminal. This connects CockroachDB's built-in SQL client to your cluster.

    {{site.data.alerts.callout_success}}
    The connection string in the command is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (e.g., in a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}

    Again, we've included the command here for convenience but with some placeholder values. It's easiest to use the command directly from the **Connection info** dialog.

    {% include cockroachcloud/sql-connection-string-free.md %}

    A welcome message displays:

    ~~~
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
  <button class="filter-button" data-scope="go">Go</button>
  <button class="filter-button" data-scope="java">Java</button>
  <button class="filter-button" data-scope="python">Python</button>
</div>

<section class="filter-content" markdown="1" data-scope="node">

</section>

<section class="filter-content" markdown="1" data-scope="go">

1. Create a `main.go` file on your local machine and copy this code into it:

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

<section class="filter-content" markdown="1" data-scope="java">

</section>

<section class="filter-content" markdown="1" data-scope="python">

</section>

## What's next?

- Check out our full range of [sample applications](../stable/example-apps.html) to test against your {{ site.data.products.serverless }} cluster
- Learn more about [CockroachDB SQL](learn-cockroachdb-sql.html)
