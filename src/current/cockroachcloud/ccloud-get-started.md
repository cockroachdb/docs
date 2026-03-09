---
title: Get Started with the ccloud CLI
summary: Install the ccloud CLI for management of CockroachDB Cloud clusters
toc: true
docs_area: manage
---

The `ccloud` tool is a command-line interface (CLI) tool that allows you to create, manage, and connect to CockroachDB Cloud clusters. If you are new to CockroachDB Cloud, [install `ccloud`](#install-ccloud) and use the [`ccloud quickstart` command](#use-ccloud-quickstart) to interactively log in and create a new CockroachDB {{ site.data.products.serverless }} cluster.

## Install `ccloud`

{% include cockroachcloud/ccloud/install-ccloud.md %}

## Use `ccloud quickstart`

The easiest way of getting started with CockroachDB Cloud is to use `ccloud quickstart`. The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new CockroachDB {{ site.data.products.serverless }} cluster, and connecting to the new cluster. Run `ccloud quickstart` and follow the instructions:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud quickstart
~~~

The `ccloud quickstart` command will open a browser window to log you in to CockroachDB Cloud. If you are new to CockroachDB Cloud, you can register using one of the single-sign-on options, or create a new account using an email address.

## Log in to CockroachDB Cloud using `ccloud auth`

In order to use the `ccloud` commands to configure and manage your clusters, you first need to log in to CockroachDB Cloud. Use the `ccloud auth login` command to open a browser window to log in to CockroachDB Cloud.

1. Run the `ccloud auth login` command and press **Enter** to open a browser window:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    ccloud auth login
    ~~~

    This will take you to the CockroachDB Cloud login page.

1. Enter your username and password if you already have a CockroachDB Cloud account, then click **Continue**.

    If you do not have a CockroachDB Cloud account, click one of the single sign-on (SSO) options or **Sign up** to register.

1. Close the browser window and return to your terminal.

If you are a member of more than one CockroachDB Cloud organization, use the `--org` flag to set the organization name when authenticating.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --org {organization-label}
~~~

The organization label is found on the **Settings** page of the CockroachDB Cloud Console.

If your organization has a custom URL, use the `--vanity-name` flag to log in:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --vanity-name {custom-organization-name}
~~~

Replace `{custom-organization-name}` with the portion of the custom sign-in URL that follows `/login/`. Do not pass the full custom sign-in URL.

### Log in to CockroachDB Cloud on a headless server

If you are using `ccloud` on a headless machine, use the `--no-redirect` flag to log in. This allows you to log in to CockroachDB Cloud on a different machine, retrieve an authorization code, and enter the code on the headless machine so `ccloud` can complete authentication.

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud auth login --no-redirect
~~~

## Next steps

Refer to the [`ccloud` reference documentation]({% link cockroachcloud/ccloud-reference.md %}) to learn how to use the `ccloud` CLI tool to create and manage CockroachDB {{ site.data.products.cloud }} clusters.