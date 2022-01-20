---
title: Deploy a Netlify App Built on CockroachDB
summary: Learn how to use Netlify and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_netlify
docs_area: get_started
---

This tutorial shows you how to deploy a [Netlify](https://www.netlify.com/) web application that communicates with a {{ site.data.products.serverless }} cluster.

The sample app used in this tutorial simulates [a gaming leaderboard](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app). The [Netlify functions](https://www.netlify.com/products/functions/) used for the app are written in TypeScript. The functions use [Prisma](https://www.prisma.io/) to connect to CockroachDB. The app's frontend, also written in TypeScript, uses React, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The source code for the completed app is available on GitHub at [https://github.com/cockroachdb/cockroachdb-typescript](https://github.com/cockroachdb/cockroachdb-typescript).

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create a Starter [Netlify](https://app.netlify.com/signup) account. You can do this with your GitHub login credentials.

1. Install the [`cockroach` binary](install-cockroachdb.html). You'll use the [`cockroach sql` CLI](cockroach-sql.html) to initialize the database schema for the app.

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

<a name="connection-string"></a>

After the cluster is created, the **Connection info** window appears. Click the **Connection string** tab and copy the connection string to a secure location. You will use this connection string to connect to CockroachDB later in the tutorial.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

## Step 2. Get the code

1. Clone the code's GitHub repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone git@github.com:cockroachdb/cockroachdb-typescript.git
    ~~~

    The project has the following directory structure:

    ~~~
    ├── LICENSE.md
    ├── README.md
    ├── database
    │   └── schema.sql
    ├── netlify
    │   └── functions
    │       ├── addScore.ts
    │       ├── getPlayers.ts
    │       └── getScores.ts
    ├── package-lock.json
    ├── package.json
    ├── prisma
    │   └── schema.prisma
    ├── public
    ├── src
    └── tsconfig.json
    ~~~

    In this tutorial, we focus on the files in the `database`, `netlify`, and `prisma` directories.

1. At the top of the repo directory, fork the repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ gh repo fork --remote
    ~~~

    To deploy your code to Netlify, you need to have your own repo, or your own fork of the existing repo.

## Step 3. Initialize the database

At the top level of the project directory, use the [`cockroach sql` command](cockroach-sql.html) to initialize the `leaderboard` database in your cluster:

{% include_cached copy-clipboard.html %}
~~~ shell
cockroach sql --url "<connection-string>" --file ./database/schema.sql
~~~

Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

This command runs the SQL commands in the `database/schema.sql` file. These commands initialize the database schema in your cluster:

~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/database/schema.sql %}
~~~

{{site.data.alerts.callout_info}}
CockroachDB does not support Prisma Migrate. We recommend executing DDL SQL statements to initialize your database schema separately. After the database schema is initialized, you can load existing tables into your Prisma schema with the Prisma Client, as demonstrated [here](https://www.prisma.io/docs/concepts/components/introspection).
{{site.data.alerts.end}}

## Step 4. Initialize Prisma Client

1. Set the local `DATABASE_URL` environment variable to a valid connection string to the `leaderboard` database on your cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="postgresql://<username>:<password>@<host>:<port>/leaderboard?sslmode=verify-full&options=--cluster%3D<routing-id>"
    ~~~

    Where:
    - `<username>` is the [SQL user](authorization.html#sql-users) connecting to the cluster.
    - `<password>` is the password for the SQL user connecting to the cluster.
    - `<host>` is the host on which the CockroachDB node is running.
    - `<port>` is the port at which the CockroachDB node is listening.
    - `<routing-id>` is cluster's routing ID (e.g., `funky-skunk-123`). The routing ID identifies your tenant cluster on a [multi-tenant host](../cockroachcloud/architecture.html#architecture).

    {{site.data.alerts.callout_info}}
    This connection string is identical to the connection string you obtained earlier from the {{ site.data.products.db }} Console, with the exception of the database parameter (`leaderboard`).
    {{site.data.alerts.end}}

     By default, Prisma uses the local `DATABASE_URL` environment variable as the connection string to the database.

1. Initialize Prisma Client:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma generate
    ~~~

    This command initializes Prisma Client to communicate with your CockroachDB cluster, based on the configuration in the `prisma/schema.prisma` file:

~~~
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/prisma/schema.prisma %}
~~~

## Step 5. Deploy the application

You can deploy web applications directly from GitHub to Netlify. In this tutorial, we use the [Netlify CLI](https://docs.netlify.com/cli/get-started/) to deploy the app.

1. Install the `netlify` CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install netlify-cli -g
    ~~~

1. Sign into your Netlify account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify login
    ~~~

1. Verify that you can build the web application locally:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm run build
    ~~~

1. Run the app server locally to preview your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify dev
    ~~~

    If the local deployment succeeds, you should see the following message in your terminal:

    ~~~
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   ◈ Server now ready on http://localhost:8888   │
    │                                                 │
    └─────────────────────────────────────────────────┘
    ~~~

    For a preview of the site, visit [http://localhost:8888](http://localhost:8888).

    Interacting with the site triggers the Netlify functions defined in the `netlify/functions` directory. These functions use Prisma Client to run [`SELECT`](selection-queries.html) and [`INSERT`](insert.html) queries against the database:
    - [`getScores.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getScores.ts) reads all rows from the `player_scores` table and returns values in the `id`, `name`, and `score` columns.
    - [`getPlayers.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getPlayers.ts) reads and returns all rows from the `players` table.
    - [`addScore.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/addScore.ts) writes new scores to the `player_scores` table.

1. Deploy your app with the Netlify CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify deploy
    ~~~

    Choose to create a new site, and then select the default options for each of the subsequent prompts. You will be required to authorize Netlify with GitHub.

    After the app is deployed, you should see the following message:

    ~~~
    ✔ Deploy is live!
    ~~~

1. In order for the deployed app to connect to your database, you need to define the `DATABASE_URL` environment variable for the site's production environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify env:set DATABASE_URL $DATABASE_URL
    ~~~

    This command sets the remote `DATABASE_URL` environment variable for the site to the local `DATABASE_URL` environment variable that you set earlier to initialize Prisma.

1. Navigate to the admin URL for your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify open
    ~~~

    From the **Site overview** page, you can manage your site. The **Site overview** page also provides you with a public URL for your site.

## See also

- [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify)
- [Build a Simple CRUD Node.js App with CockroachDB and Prisma Client](build-a-nodejs-app-with-cockroachdb-prisma.html)

{% include {{page.version.version}}/app/see-also-links.md %}
