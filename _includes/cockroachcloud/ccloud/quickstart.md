The easiest way of getting started with CockroachDB Cloud is to use `ccloud quickstart`. The `ccloud quickstart` command guides you through logging in to CockroachDB Cloud, creating a new {{ site.data.products.serverless }} with a $0 resource limit, and connecting to the new cluster. Run `ccloud quickstart` and follow the instructions:

{% include_cached copy-clipboard.html %}
~~~ shell
ccloud quickstart
~~~

The `ccloud quickstart` command will open a browser window to log you in to CockroachDB Cloud. If you are new to CockroachDB Cloud, you can register using one of the single sign-on (SSO) options, or create a new account using an email address.

The `ccloud quickstart` command will prompt you for the cluster name, cloud provider, and cloud provider region, then ask if you want to connect to the cluster. Each prompt has default values that you can select, or change if you want a different option.

