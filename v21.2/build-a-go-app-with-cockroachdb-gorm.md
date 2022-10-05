---
title: Build a Go App with CockroachDB and GORM
summary: Learn how to use CockroachDB from a simple Go application with the GORM ORM.
toc: true
twitter: false
referral_id: docs_go_gorm
docs_area: get_started
---

{% include {{ page.version.version }}/filter-tabs/crud-go.md %}

This tutorial shows you how build a simple CRUD Go application with CockroachDB and the [GORM ORM](https://gorm.io/index.html).

{{site.data.alerts.callout_success}}
For another use of GORM with CockroachDB, see our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.
{{site.data.alerts.end}}

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/setup/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone https://github.com/cockroachlabs/example-app-go-gorm
~~~

The project has the following directory structure:

~~~
├── README.md
└── main.go
~~~

The `main.go` file defines an `Account` struct that maps to a new `accounts` table. The file also contains some read and write database operations that are executed in the `main` method of the program.

{% include_cached copy-clipboard.html %}
~~~ go
{% remote_include https://raw.githubusercontent.com/cockroachlabs/example-app-go-gorm/master/main.go %}
~~~

{{site.data.alerts.callout_info}}
CockroachDB may require the [client to retry a transaction](transactions.html#transaction-retries) in the case of read/write contention. The [CockroachDB Go client](https://github.com/cockroachdb/cockroach-go) includes a generic **retry function** (`ExecuteTx()`) that runs inside a transaction and retries it as needed. The code sample shows how you can use this function to wrap SQL statements.
{{site.data.alerts.end}}

## Step 3. Run the code

1. Initialize the module:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd example-app-go-gorm
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go mod init basic-sample && go mod tidy
    ~~~

1. Run the code:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ go run main.go
    ~~~

    The output should look similar to the following:

    ~~~
    2021/09/16 14:17:12 Creating 5 new accounts...
    2021/09/16 14:17:12 Accounts created.
    Balance at '2021-09-16 14:17:12.68843 -0400 EDT m=+2.760587790':
    1580d2f4-c9ec-4f26-bbe7-6a53e9aa5170 1947
    26ddc77b-8068-409b-b305-0c5d873f7c43 7987
    3d97ea5a-5108-4388-88e8-92524d5de5e8 4159
    af49831d-d637-4a20-a9a7-01e9fe4628fe 8181
    f0cc97ef-e3fe-4abb-a44a-0dd04207f7d4 2181
    2021/09/16 14:17:12 Transferring 100 from account af49831d-d637-4a20-a9a7-01e9fe4628fe to account 3d97ea5a-5108-4388-88e8-92524d5de5e8...
    2021/09/16 14:17:12 Funds transferred.
    Balance at '2021-09-16 14:17:12.759686 -0400 EDT m=+2.831841311':
    1580d2f4-c9ec-4f26-bbe7-6a53e9aa5170 1947
    26ddc77b-8068-409b-b305-0c5d873f7c43 7987
    3d97ea5a-5108-4388-88e8-92524d5de5e8 4259
    af49831d-d637-4a20-a9a7-01e9fe4628fe 8081
    f0cc97ef-e3fe-4abb-a44a-0dd04207f7d4 2181
    2021/09/16 14:17:12 Deleting accounts created...
    2021/09/16 14:17:12 Accounts deleted.
    ~~~

    The code runs a migration that creates the `accounts` table in the `bank` database, based on the `Account` struct defined at the top of the `main.go` file.

    As shown in the output, the code also does the following:
    - Inserts some rows into the `accounts` table.
    - Reads values from the table.
    - Updates values in the table.
    - Deletes values from the table.

## What's next?

Read more about using the [GORM ORM](http://gorm.io), or check out a more realistic implementation of GORM with CockroachDB in our [`examples-orms`](https://github.com/cockroachdb/examples-orms) repository.

{% include {{ page.version.version }}/app/see-also-links.md %}
