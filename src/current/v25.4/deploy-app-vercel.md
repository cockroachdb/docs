---
title: Deploy a Web App Built on CockroachDB with Vercel
summary: Learn how to build with Vercel and CockroachDB Standard.
toc: true
twitter: false
referral_id: docs_vercel
docs_area: get_started
---

This tutorial shows you how to use [Vercel](https://vercel.com/) to deploy a web application built with [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), [Prisma](https://www.prisma.io/), and CockroachDB {{ site.data.products.standard }}.

<div class="filters clearfix">
    <button class="filter-button page-level" data-scope="browser"><strong>Use the browser</strong></button>
    <button class="filter-button page-level" data-scope="local"><strong>Use the command line</strong></button>
</div>

## Before you begin

Before starting the tutorial, create a [Vercel](https://vercel.com/signup) account and sign in.

## Step 1. Create a CockroachDB {{ site.data.products.standard }} cluster

{% include_cached cockroachcloud/quickstart/create-free-trial-standard-cluster.md %}

{% include_cached cockroachcloud/connection-string-standard.md %}

## Step 2. Get the code

1. Open the code repository's [GitHub repository](https://github.com/cockroachdb/prisma-examples).
1. Fork it by clicking **Fork** at the top. Netlify requires you to own a Netlify app's repository.
    - Set **Owner** to your GitHub identity or an organization.
    - Disable **Copy the master branch only**.
    - Click **Fork**.

    You now have an exact copy of the code repository in the GitHub location you chose.
1. Copy the fork's address, which you will use to clone it locally. Click **Code**, then in the **Local** tab, click **SSH** if you have added SSH keys to GitHub, or **HTTPS** if not. Click the copy symbol to copy the address.
1. Clone your fork locally. Replace `{ADDRESS}` with the full address of your fork, which will end with `prisma-examples.git`.

<section class="filter-content" markdown="1" data-scope="browser">

## Step 3. Create a Vercel project

1. From the [Vercel dashboard](https://vercel.com/dashboard), click **Add new...** > **Project**.
1. Select the `prisma-examples` repository you forked in [Step 2](#step-2-get-the-code) to import.
1. From the **Framework preset** dropdown, select **Next.js**.
1. In the **Root directory** field, click **Edit**.
1. Select the **typescript** > **rest-nextjs-api-routes** directory.
1. Click **Continue**.
1. Open the **Build and Output Settings** and toggle the build command's **Override** switch to on.
1. Enter `yarn prisma db push && yarn next build` as the **Build command**.
1. Click **Deploy**.

    Your deployment will fail until you integrate CockroachDB in the next step, so you can leave this screen without waiting for it to finish.

## Step 4. Integrate your project with CockroachDB

1. Navigate to the [CockroachDB page](https://vercel.com/integrations/cockroachdb) of Vercel's integration marketplace.
1. Click **Add Integration**.
1. Select your Vercel account and click **Continue**.
1. Select the project you just created and click **Continue**.
1. Accept the permissions and click **Add Integration**.
1. When prompted, log into CockroachDB Cloud and select the organization and cluster to integrate with.
1. Click **Create** to finish the integration.

    After a few seconds, the window will close automatically and your Vercel project will have the `DATABASE_URL` environment variable configured with the cluster's connection string.

## Step 5. Deploy the application

1. Navigate to the **Overview** page for your Vercel project.
1. Select the **Deployments** tab.
1. Click **Redeploy**.
1. Click **Redeploy** again from the pop-up dialog.

    Your project will be deployed in a few seconds. You can view the final product by clicking on the **Domain** link on your project's **Overview** page.

</section>
<section class="filter-content" markdown="1" data-scope="local">

## Step 3. Initialize the database

1. Save [the connection string](#connection-string) you obtained earlier from the CockroachDB {{ site.data.products.cloud }} Console to the `DATABASE_URL` environment variable in an `.env` file in your project:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    echo "DATABASE_URL=<connection-string>" >> .env
    ~~~

    Prisma loads the variables defined in `.env` to the project environment. By default, Prisma uses the `DATABASE_URL` environment variable as the connection string to the database.

1. Run [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) to initialize the database with the schema defined in `prisma/prisma.schema`.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    prisma migrate dev --name init
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
    npm run dev
    ~~~

    You should see the following output:

    ~~~
    ready - started server on 0.0.0.0:3000, url: http://localhost:3000
    ~~~

1. Run the `vercel` command to start deploying the app:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    vercel deploy --confirm
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
- [Build a Simple CRUD Node.js App with CockroachDB and Prisma Client]({% link {{ page.version.version }}/build-a-nodejs-app-with-cockroachdb-prisma.md %})

{% include_cached {{page.version.version}}/app/see-also-links.md %}
