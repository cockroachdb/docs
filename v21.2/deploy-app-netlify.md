---
title: Create and Deploy a Netlify App Built on CockroachDB
summary: Learn how to use Netlify and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_netlify
---

This tutorial shows you how to create and deploy a [Netlify](https://www.netlify.com/) web application that communicates with a {{ site.data.products.serverless }} cluster.

The sample app used in this tutorial simulates a gaming leaderboard. The [Netlify functions](https://www.netlify.com/products/functions/) used for the app are written in TypeScript. The functions use [Prisma](https://www.prisma.io/) to connect to CockroachDB. The app's frontend, also written in TypeScript, uses React, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

The source code for the completed app is available on GitHub at [https://github.com/cockroachdb/cockroachdb-typescript](https://github.com/cockroachdb/cockroachdb-typescript).

{{site.data.alerts.callout_success}}
See the blog post that inspired this tutorial: [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify).
{{site.data.alerts.end}}

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create a Starter [Netlify](https://app.netlify.com/signup) account. You can do this with your GitHub login credentials.

1. Install the [`cockroach` binary](install-cockroachdb.html).

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

<a name="connection-string"></a>

After the cluster is created, the **Connection info** window appears. Click the **Connection string** tab and copy the connection string to a secure location. You will use this connection string to connect to CockroachDB later in the tutorial.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

## Step 2. Create the app project

1. Open a new terminal and navigate to the directory where you want to create your web app.

1. Generate the React project boilerplate with [Create React App](https://github.com/facebook/create-react-app):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx create-react-app cockroachdb-typescript --template typescript
    ~~~

1. Follow the prompts to create the app in the `cockroachdb-typescript` directory. After you have installed the required packages, you should see a message in the terminal similar to the following:

    ~~~
    Success! Created cockroachdb-typescript at /path/cockroachdb-typescript
    Inside that directory, you can run several commands:

      npm start
        Starts the development server.

      npm run build
        Bundles the app into static files for production.

      npm test
        Starts the test runner.

      npm run eject
        Removes this tool and copies build dependencies, configuration files
        and scripts into the app directory. If you do this, you can’t go back!

    We suggest that you begin by typing:

      cd cockroachdb-typescript
      npm start

    Happy hacking!
    ~~~

1. Navigate to `cockroachdb-typescript`:


    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd cockroachdb-typescript
    ~~~

    The directory structure should look like this:

    ~~~
    cockroachdb-typescript
    ├── README.md
    ├── node_modules
    ├── package-lock.json
    ├── package.json
    ├── public
    ├── src
    └── tsconfig.json
    ~~~

## Step 3. Initialize the database

1. Open a new terminal, and use the `cockroach sql` command to open a [SQL shell](cockroach-sql.html) to your {{ site.data.products.serverless }} cluster:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    cockroach sql --url "<connection-string>"
    ~~~

    Where `<connection-string>` is the connection string you obtained earlier from the {{ site.data.products.db }} Console.

1. To create the database schema in your cluster, run the following SQL commands in the SQL shell:

{% include_cached copy-clipboard.html %}
~~~ sql
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/database/schema.sql %}
~~~

{{site.data.alerts.callout_info}}
CockroachDB does not support Prisma Migrate. We recommend executing DDL SQL statements to initialize your database schema separately. After the database schema is initialized, you can load existing tables into your Prisma schema with the Prisma Client, as demonstrated [here](https://www.prisma.io/docs/concepts/components/introspection).
{{site.data.alerts.end}}

## Step 4. Initialize Prisma Client

1. Install [Prisma Client](https://www.prisma.io/client) to your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install --save prisma @prisma/client@3.8.0
    ~~~

1. Initialize the Prisma schema file and `.env` file in your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npx prisma init
    ~~~

1. Update the Prisma schema file to specify CockroachDB as the database provider:

    {% include_cached copy-clipboard.html %}
    ~~~
    generator client {
      provider        = "prisma-client-js"
      previewFeatures = ["cockroachdb"]
    }

    datasource db {
      provider = "cockroachdb"
      url      = env("DATABASE_URL")
    }
    ~~~

1. Update the `.env` file to set `DATABASE_URL` to the local `DATABASE_URL` environment variable:

    {% include_cached copy-clipboard.html %}
    ~~~
    DATABASE_URL= ${DATABASE_URL}
    ~~~

    <a name="database-url"></a>

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

1. Load the database schema from the cluster into your Prisma schema file:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma db pull
    ~~~

1. Initialize Prisma Client:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma generate
    ~~~

## Step 5. Create Netlify functions

1. Add the [`@netlify/functions`](https://github.com/netlify/functions) module to your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install --save @netlify/functions
    ~~~

1. Create a `netlify/functions` subdirectory for the functions:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir -p netlify/functions
    ~~~

1. Add the function source code to the `netlify/functions` directory.

Here are three sample functions, which use Prisma Client to [`SELECT`](selection-queries.html) and [`INSERT`](insert.html) data:

[`getScores.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getScores.ts) reads all rows from the `player_scores` table and returns values in the `id`, `name`, and `score` columns.

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getScores.ts %}
~~~

[`getPlayers.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getPlayers.ts) reads and returns all rows from the `players` table.

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getPlayers.ts %}
~~~

[`addScore.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/addScore.ts) writes new scores to the `player_scores` table.

{% include_cached copy-clipboard.html %}
~~~ js
{% remote_include https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/addScore.ts %}
~~~

## Step 6. Create the React frontend

The example app uses React for the frontend. This tutorial focuses on the database layer, so we recommend just copying some files over from the [completed app](https://github.com/cockroachdb/cockroachdb-typescript).

1. Install [React Router](https://github.com/remix-run/react-router):

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install --save react-router-dom@6.1.1
    ~~~

1. Copy the [`Admin.tsx`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/Admin.tsx), [`App.tsx`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/App.tsx), and [`Leaderboard.tsx`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/Leaderboard.tsx) files to the `cockroachdb-typescript/src` directory.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ wget  -P ./src/ https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/Admin.tsx \
    ./src/ https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/App.tsx \
    ./src/ https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/src/Leaderboard.tsx
    ~~~

## Step 7. Deploy the application

You can deploy web applications directly from GitHub to Netlify. In this tutorial, we use the [Netlify CLI](https://docs.netlify.com/cli) to deploy the app.

1. [Initialize a new GitHub repo](https://git-scm.com/docs/git-init) in your `cockroachdb-typescript` directory, or fork [the existing repo](https://github.com/cockroachdb/cockroachdb-typescript) and clone the repo to a local directory.

1. Install the Netlify CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install netlify-cli -g
    ~~~

1. Sign into your Netlify account:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify login
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

1. From your repo directory, deploy your app with the Netlify CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify init
    ~~~

    Select the default options for each of the prompts. You will be required to authorize Netlify with GitHub.

    After the app is deployed, you should see the following message:

    ~~~
    Success! Netlify CI/CD Configured!
    ~~~

1. In order for the deployed app to connect to your database, you need to define the `DATABASE_URL` environment variable in the production environment:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify env:set DATABASE_URL $DATABASE_URL
    ~~~

    This command sets the remote `DATABASE_URL` environment variable for the site to the local `DATABASE_URL` environment variable [that you set earlier to initialize Prisma](#database-url).

1. Navigate to the admin URL for your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ netlify open
    ~~~

    From the **Site overview** page, you can manage your site. The **Site overview** page also provides you with a public URL for your site.

## See also

- [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify)
- [Create and Deploy an AWS Lambda Function Built on CockroachDB](deploy-lambda-function.html)
- [Deploy a CockroachDB Cloud Application with Google Cloud Run](deploy-app-gcr.html)

{% include {{page.version.version}}/app/see-also-links.md %}
