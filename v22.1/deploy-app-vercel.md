---
title: Deploy a Web App Built on CockroachDB with Vercel
summary: Learn how to use Vercel and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_vercel
docs_area: get_started
---

This tutorial shows you how to use [Vercel](https://vercel.com/) to deploy a web application built with [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), and {{ site.data.products.serverless }}.

{{site.data.alerts.callout_success}}
For more detailed instructions on building a fullstack app with Next.js and Prisma, see Vercel's official [How to Build a Fullstack App with Next.js, Prisma, and PostgreSQL](https://vercel.com/guides/nextjs-prisma-postgres) guide.
{{site.data.alerts.end}}

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create a [Vercel](https://vercel.com/signup) account. You can do this with your GitHub login credentials.

## Step 1. Create a {{ site.data.products.serverless }} cluster

{% include cockroachcloud/quickstart/create-a-free-cluster.md %}

<a name="connection-string"></a>

After the cluster is created, the **Connection info** window appears. Click the **Connection string** tab and copy the connection string to a secure location. You will use this connection string to connect to CockroachDB later in the tutorial.

{{site.data.alerts.callout_info}}
The connection string is pre-populated with your username, cluster name, and other details, including your password. Your password, in particular, will be provided only once. Save it in a secure place (we recommend a password manager) to connect to your cluster in the future. If you forget your password, you can reset it by going to the [**SQL Users** page](../cockroachcloud/user-authorization.html).
{{site.data.alerts.end}}

## Step 2. Get the code

1. Clone the `cockroachdb` fork of the `prisma-examples` repo:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ git clone git@github.com:cockroachdb/prisma-examples.git
    ~~~

    {{site.data.alerts.callout_info}}
    In this tutorial, we deploy a slightly modified version of Prisma's [`rest-nextjs-api-routes`](https://github.com/prisma/prisma-examples/tree/latest/typescript/rest-nextjs-api-routes) example app.
    {{site.data.alerts.end}}

1. Navigate to the `rest-nextjs-api-routes` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd typescript/rest-nextjs-api-routes
    ~~~

## Step 3. Initialize the database

1. Set the local `DATABASE_URL` environment variable to [the connection string](#connection-string) you obtained earlier from the {{ site.data.products.db }} Console:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ export DATABASE_URL="<connection-string>"
    ~~~

    By default, Prisma uses the local `DATABASE_URL` environment variable as the connection string to the database.

1. Install Prisma:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npm install prisma --save-dev
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    npx prisma
    ~~~

1. Run [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to initialize the database with the schema defined in `prisma/prisma.schema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npx prisma migrate dev --name init
    ~~~

    You should see the following output:

    ~~~
    Your database is now in sync with your schema.

    ✔ Generated Prisma Client (3.11.0 | library) to ./node_modules/@prisma/client in 87ms
    ~~~

    This command also initializes [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client) to communicate with your CockroachDB cluster, based on the configuration in the `prisma/schema.prisma` file.

## Step 4. Deploy the application

1. Save the local `DATABASE_URL` environment variable to a `.env` file in your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo "DATABASE_URL=$DATABASE_URL" >> .env
    ~~~

    Next.js loads the variables defined in `.env` to the project environment.

1. (Optional) Run the app server locally to preview your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm run dev
    ~~~

1. Install the `vercel` CLI:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm i -g vercel
    ~~~

1. Run the `vercel` command to start deploying the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ vercel
    ~~~

    You will be asked to sign into your Vercel account:

    ~~~
    Vercel CLI 24.0.0
    > > No existing credentials found. Please log in:
    > Log in to Vercel (Use arrow keys)
    ❯ Continue with GitHub
      Continue with GitLab
      Continue with Bitbucket
      Continue with Email
      Continue with SAML Single Sign-On
    ~~~

    When you authenticate your credentials, you should see the following message:

    ~~~
    > Success! GitHub authentication complete ...
    ~~~

    Select the default options for the remaining prompts to deploy the app to the `example-app-typescript-vercel` Vercel project:

    ~~~
    ? Set up and deploy “~/path/example-app-typescript-vercel”? [Y/n] y
    ? Which scope do you want to deploy to? my-scope
    ? Link to existing project? [y/N] n
    ? What’s your project’s name? example-app-typescript-vercel
    ? In which directory is your code located? ./
    Auto-detected Project Settings (Next.js):
    - Build Command: next build
    - Output Directory: Next.js default
    - Development Command: next dev --port $PORT
    ? Want to override the settings? [y/N] n
    ~~~

    ~~~
    🔗  Linked to username/example-app-typescript-vercel (created .vercel and added it to .gitignore)
    🔍  Inspect: https://vercel.com/username/example-app-typescript-vercel/123456789 [1s]
    ✅  Production: https://example-app-typescript-vercel-username.vercel.app [copied to clipboard] [47s]
    📝  Deployed to production. Run `vercel --prod` to overwrite later (https://vercel.link/2F).
    💡  To change the domain or build command, go to https://vercel.com/ericharmeling/example-app-typescript-vercel/settings
    ~~~

    Follow the links provided to view and manage your deployed application.

## See also

- [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify)
- [Build a Simple CRUD Node.js App with CockroachDB and Prisma Client](build-a-nodejs-app-with-cockroachdb-prisma.html)

{% include {{page.version.version}}/app/see-also-links.md %}