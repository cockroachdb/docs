---
title: Deploy a Web App Built on CockroachDB with Vercel
summary: Learn how to use Vercel and CockroachDB Serverless.
toc: true
twitter: false
referral_id: docs_vercel
docs_area: get_started
---

This tutorial shows you how to use [Vercel](https://vercel.com/) to deploy a web application built with [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), and {{ site.data.products.serverless }}.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="browser"><strong>Use your browser</strong></button>
    <button class="filter-button page-level" data-scope="local"><strong>Use the command line</strong></button>
</div>

## Prerequisites

Before starting the tutorial, do the following:

1. Create a [{{ site.data.products.db }}](https://cockroachlabs.cloud/signup?referralId={{page.referral_id}}) account.

1. Create a [Vercel](https://vercel.com/signup) account.

<section class="filter-content" markdown="1" data-scope="browser">

## Step 1. Get the code

1. Create a [GitHub](https://github.com/) account if you haven't already.
1. In GitHub, [create your own fork](https://docs.github.com/en/get-started/quickstart/fork-a-repo#forking-a-repository) of CockroachDB's [`prisma-examples` repo](https://github.com/cockroachdb/prisma-examples).

## Step 2. Create a Vercel project

1. From the [Vercel dashboard](https://vercel.com/dashboard), click **Add new...** > **Project**.
1. Select the `prisma-examples` repository you forked in [Step 1](#step-1) to import.
1. From the **Framework preset** dropdown, select **Next.js**.
1. In the **Root directory** field, click **Edit**.
1. Select the **typescript** > **rest-nextjs-api-routes** directory.
1. Click **Continue**.
1. Open the **Build and Output Settings** and toggle the build command's **Override** switch to on.
1. Enter `yarn prisma db push && yarn next build` as the **Build command**.
1. Click **Deploy**.

    Your deployment will fail until you integrate CockroachDB in the next step, so you can leave this screen without waiting for it to finish.

## Step 3. Integrate CockroachDB

1. Navigate to the [CockroachDB page](https://vercel.com/integrations/cockroachdb) of Vercel's integration marketplace.
1. Click **Add Integration**.
1. Select your Vercel account and click **Continue**.
1. Select either **All Projects** or the project you just created and click **Continue**.
1. Accept the permissions and click **Add Integration**.

    A window will pop up prompting you to log in to {{ site.data.products.db }} if you haven't already.
    
1. In the {{ site.data.products.db }} pop-up window, select the organization in which you want to create a new {{ site.data.products.serverless }} cluster.
1. Click **Create**.

    After a few seconds, your cluster will be created and the pop-up window will close automatically. Once this is done, your Vercel project will have the `DATABASE_URL` environment variable automatically populated with the connection string for your new cluster.

## Step 3. Deploy the application

1. Navigate to the **Overview** page for your Vercel project.
1. Select the **Deployments** tab.
1. Click **Redeploy**.
1. Click **Redeploy** again from the pop-up dialog.

    Your project will be deployed in a few seconds. You can view the final product by clicking on the **Domain** link on your project's **Overview** page.

</section>
<section class="filter-content" markdown="1" data-scope="local">
 
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

1. Navigate to the `rest-nextjs-api-routes` directory:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ cd typescript/rest-nextjs-api-routes
    ~~~

1. Install the application dependencies:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install
    ~~~

1. Install the `vercel` and `prisma` CLI tools:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm install --global vercel prisma
    ~~~

## Step 3. Initialize the database

1. Save [the connection string](#connection-string) you obtained earlier from the {{ site.data.products.db }} Console to the `DATABASE_URL` environment variable in an `.env` file in your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo "DATABASE_URL=<connection-string>" >> .env
    ~~~

    Prisma loads the variables defined in `.env` to the project environment. By default, Prisma uses the `DATABASE_URL` environment variable as the connection string to the database.

1. Run [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to initialize the database with the schema defined in `prisma/prisma.schema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ prisma migrate dev --name init
    ~~~

    You should see the following output:

    ~~~
    Your database is now in sync with your schema.

    ✔ Generated Prisma Client (3.11.0 | library) to ./node_modules/@prisma/client in 87ms
    ~~~

    This command also initializes [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client) to communicate with your CockroachDB cluster, based on the configuration in the `prisma/schema.prisma` file.

## Step 4. Deploy the application

1. (Optional) Run the app server locally to preview your site:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ npm run dev
    ~~~

    You should see the following output:

    ~~~
    ready - started server on 0.0.0.0:3000, url: http://localhost:3000
    ~~~

1. Run the `vercel` command to start deploying the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ vercel deploy --confirm
    ~~~

    You will be asked to sign into your Vercel account. When you authenticate your credentials, you should see the following message:

    ~~~
    > Success! GitHub authentication complete ...
    ~~~

    The [`--confirm` flag](https://vercel.com/docs/cli#introduction/unique-options/confirm) instructs Vercel to deploy the app to the `example-app-typescript-vercel` Vercel project, using the default settings:

    ~~~
    🔗  Linked to username/example-app-typescript-vercel (created .vercel and added it to .gitignore)
    🔍  Inspect: https://vercel.com/username/example-app-typescript-vercel/123456789 [1s]
    ✅  Production: https://example-app-typescript-vercel-username.vercel.app [copied to clipboard] [47s]
    📝  Deployed to production. Run `vercel --prod` to overwrite later (https://vercel.link/2F).
    💡  To change the domain or build command, go to https://vercel.com/ericharmeling/example-app-typescript-vercel/settings
    ~~~

    Follow the links provided to view and manage your deployed application.
    
</section>

## See also

- [Vercel's official How to Build a Fullstack App with Next.js, Prisma, and PostgreSQL guide](https://vercel.com/guides/nextjs-prisma-postgres)
- [How to build a Complete Webapp with React, TypeScript & CockroachDB](https://www.cockroachlabs.com/blog/react-typescript-cockroachdb-sample-app/#deploy-the-application-to-netlify)
- [Build a Simple CRUD Node.js App with CockroachDB and Prisma Client](build-a-nodejs-app-with-cockroachdb-prisma.html)

{% include {{page.version.version}}/app/see-also-links.md %}