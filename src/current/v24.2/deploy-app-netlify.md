---
title: Deploy a Netlify App Built on CockroachDB
summary: Learn how to use Netlify and CockroachDB Standard.
toc: true
twitter: false
referral_id: docs_netlify
docs_area: get_started
---

This tutorial shows you how to deploy a [Netlify](https://www.netlify.com/) web application that communicates with a CockroachDB {{ site.data.products.standard }} cluster.

The sample app used in this tutorial simulates a [gaming leaderboard](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/) using [Netlify functions](https://www.netlify.com/products/functions/) written in TypeScript. The functions use [Prisma](https://www.prisma.io/) to connect to CockroachDB. The app's frontend, also written in TypeScript, uses React, bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can view or download the [source code](https://github.com/cockroachdb/cockroachdb-typescript) for the example.

## Before you begin

Before starting the tutorial:

1. Create a Starter [Netlify](https://app.netlify.com/signup) account.
1. Install the `netlify` CLI locally and log in. Refer to [Get started with Netlify CLI](https://docs.netlify.com/cli/get-started/).

## Step 1. Create a CockroachDB {{ site.data.products.standard }} cluster

{% include_cached cockroachcloud/quickstart/create-free-trial-standard-cluster.md %}

{% include_cached cockroachcloud/connection-string-standard.md %}

## Step 2. Get the code

1. Open the code repository's [GitHub repository](https://github.com/cockroachdb/cockroachdb-typescript).
1. Fork it by clicking **Fork** at the top. Netlify requires you to own a Netlify app's repository.
    - Set **Owner** to your GitHub identity or an organization.
    - Disable **Copy the master branch only**.
    - Click **Fork**.

    You now have an exact copy of the code repository in the GitHub location you chose.
1. Copy the fork's address, which you will use to clone it locally. Click **Code**, then in the **Local** tab, click **SSH** if you have added SSH keys to GitHub, or **HTTPS** if not. Click the copy symbol to copy the address.
1. Clone your fork locally. Replace `{ADDRESS}` with the full address of your fork, which will end with `cockroachdb-typescript.git`.

The project has the following directory structure:

~~~
├── LICENSE.md
├── README.md
├── netlify
│   └── functions
│       ├── addScore.ts
│       ├── getPlayers.ts
│       └── getScores.ts
├── package-lock.json
├── package.json
├── prisma
│   ├── schema.prisma
│   └── seed.ts
├── public
├── src
└── tsconfig.json
~~~

This tutorial modifies the files in the `netlify` and `prisma` directories.

## Step 3. Initialize the database

1. Open the project's `.env` file in a text editor set the `DATABASE_URL` environment variable to [the connection string](#connection-string) you obtained earlier from the CockroachDB {{ site.data.products.cloud }} Console:

    {% include_cached copy-clipboard.html %}
    ~~~ text
    DATABASE_URL=<connection-string>
    ~~~

    Prisma loads the variables defined in `.env` to the project environment.

1. Install Prisma:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install prisma --save-dev
    ~~~

1. Run [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to initialize the database with the schema defined in `prisma/prisma.schema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npx prisma migrate dev --name init
    ~~~

    ~~~
    Your database is now in sync with your schema.
    ✔ Generated Prisma Client (3.11.0 | library) to ./node_modules/@prisma/client in 87ms

    Running seed command `ts-node --compiler-options {"module":"CommonJS"} prisma/seed.ts` ...
    {
      test_player_1: { id: 1n, name: 'Test Player 1', email: 'test_player_1@example.com' },
      test_player_2: { id: 2n, name: 'Test Player 2', email: 'test_player_2@example.com' },
      test_player_3: { id: 3n, name: 'Test Player 3', email: 'test_player_3@example.com' }
    }

    🌱  The seed command has been executed.
    ~~~

    This command initializes [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client) to communicate with your CockroachDB cluster, based on the configuration in the `prisma/schema.prisma` file. The command also seeds your database with some sample data, using the script defined in `prisma/seed.ts`.

## Step 4. Deploy the application

You can deploy web applications directly from GitHub to Netlify. This tutorial uses the [Netlify CLI](https://docs.netlify.com/cli/get-started/) to deploy the app.

1. Using the Netlify CLI, start the app server locally to preview your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    netlify dev
    ~~~

    ~~~
    ┌─────────────────────────────────────────────────┐
    │                                                 │
    │   ◈ Server now ready on http://localhost:8888   │
    │                                                 │
    └─────────────────────────────────────────────────┘
    ~~~

    For a preview of the site, visit [http://localhost:8888](http://localhost:8888).

    Interacting with the site triggers the Netlify functions defined in the `netlify/functions` directory. These functions use Prisma Client to run [`SELECT`]({% link {{ page.version.version }}/selection-queries.md %}) and [`INSERT`]({% link {{ page.version.version }}/insert.md %}) queries against the database:
    - [`getScores.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getScores.ts) reads all rows from the `player_scores` table and returns values in the `id`, `name`, and `score` columns.
    - [`getPlayers.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/getPlayers.ts) reads and returns all rows from the `players` table.
    - [`addScore.ts`](https://raw.githubusercontent.com/cockroachdb/cockroachdb-typescript/master/netlify/functions/addScore.ts) writes new scores to the `player_scores` table.

1. Deploy your app with the Netlify CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    netlify deploy
    ~~~

    Choose to create a new site, and then select the default options for each of the subsequent prompts. You will be required to log in to Netlify using GitHub.

    After the app is deployed, you should see the following message:

    ~~~
    ✔ Deploy is live!
    ~~~

1. Navigate to the admin URL for your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    netlify open
    ~~~

    From the **Site overview** page, you can manage your site. The **Site overview** page also provides you with a public URL for your site.

## See also

- [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify)
- [Build a Simple CRUD Node.js App with CockroachDB and Prisma Client]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-prisma.md %})

{% include_cached {{page.version.version}}/app/see-also-links.md %}
