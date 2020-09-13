---
title: Install CockroachDB Spatial
summary: Install instructions for CockroachDB with support for efficiently storing and querying spatial data.
toc: true
---

<a name="linux"></a>
<a name="mac"></a>
<span class="version-tag">New in v20.2</span>: CockroachDB has special support for efficiently storing and querying spatial data.

This page has instructions for installing CockroachDB Spatial on Mac and Linux.

If you are looking to install a single-file CockroachDB binary without spatial support, see [Install CockroachDB](install-cockroachdb.html).

{{site.data.alerts.callout_info}}
These instructions are likely to change, since they refer to an alpha build of CockroachDB. Note that the Windows installation instructions for CockroachDB Spatial are still being developed.

For instructions showing how to get started using CockroachDB Spatial, see [Working with Spatial Data](spatial-data.html).
{{site.data.alerts.end}}

<div class="filters clearfix">
  <button class="filter-button" data-scope="mac">Mac</button>
  <button class="filter-button" data-scope="linux">Linux</button>
</div>

<section class="filter-content" markdown="1" data-scope="mac">

## Step 1. Download and extract the binary and supporting spatial libraries

{% include copy-clipboard.html %}
~~~ shell
wget https://binaries.cockroachdb.com/cockroach-v20.2.0-alpha.3.darwin-10.9-amd64.tgz
~~~

{% include copy-clipboard.html %}
~~~ shell
tar xzvf cockroach-v20.2.0-alpha.3.darwin-10.9-amd64.tgz
~~~

{% include copy-clipboard.html %}
~~~ shell
cd cockroach-v20.2.0-alpha.3.darwin-10.9-amd64
~~~

## Step 2. Copy the binary and libraries to the appropriate locations

First, copy the `cockroach` binary to [the standard location for user-installed binaries](https://www.freebsd.org/cgi/man.cgi?query=hier&sektion=7), and make sure it's marked as executable:

{% include copy-clipboard.html %}
~~~ shell
cp cockroach /usr/local/bin/
~~~

{% include copy-clipboard.html %}
~~~ shell
chmod 755 /usr/local/bin/cockroach
~~~

Next, copy the libraries to the location where CockroachDB expects to find them, in `/usr/local/lib/cockroach`. This is necessary because CockroachDB uses a custom-built version of the [GEOS](spatial-glossary.html#geos) libraries.

{% include copy-clipboard.html %}
~~~ shell
mkdir -p /usr/local/lib/cockroach
~~~

{% include copy-clipboard.html %}
~~~ shell
cp lib/libgeos.dylib /usr/local/lib/cockroach/
~~~

{% include copy-clipboard.html %}
~~~ shell
cp lib/libgeos_c.dylib /usr/local/lib/cockroach/
~~~

## Step 3. Test the installation

To make sure that CockroachDB Spatial is properly installed and can execute spatial queries, do the steps listed below.

1. Make sure the `cockroach` binary we just installed is the one that runs when you type `cockroach` in your shell:

    {% include copy-clipboard.html %}
    ~~~ shell
    which cockroach
    ~~~

    ~~~
    /usr/local/bin/cockroach
    ~~~

2. Start the `cockroach` binary using [`cockroach start`](cockroach-start.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach start-single-node --insecure --background --listen-addr=localhost
    ~~~

    This should generate output that looks like the following:

    ~~~
    *
    * WARNING: RUNNING IN INSECURE MODE!
    * 
    * - Your cluster is open for any client that can access localhost.
    * - Any user, even root, can log in without providing a password.
    * - Any user, connecting as root, can read or write any data in your cluster.
    * - There is no network encryption nor authentication, and thus no confidentiality.
    * 
    * Check out how to secure your cluster: https://www.cockroachlabs.com/docs/v20.2/secure-a-cluster.html
    *
    ~~~

3. Run the following command to test that the spatial libraries have loaded properly:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure -e 'SELECT ST_IsValid(ST_MakePoint(1,2))'
    ~~~

    This should result in the output shown below.

    ~~~
      st_isvalid
    --------------
         true
    (1 row)
    ~~~

    If your `cockroach` binary is not properly accessing the dynamically linked C libraries in `/usr/local/lib/cockroach` for some reason, it will output a message like the one shown below.

    ~~~
    ERROR: st_isvalid(): geos: error during GEOS init: geos: cannot load GEOS from dir "/usr/local/lib/cockroach": failed to execute dlopen
    Failed running "sql"
    ~~~

{{site.data.alerts.callout_info}}
If you are having difficulties installing CockroachDB Spatial, please see our [Support Resources](support-resources.html).
{{site.data.alerts.end}}

</section>

<section class="filter-content" markdown="1" data-scope="linux">

## Step 1. Download and extract the binary and spatial libraries

{% include copy-clipboard.html %}
~~~ shell
wget https://binaries.cockroachdb.com/cockroach-v20.2.0-alpha.3.linux-amd64.tgz
~~~

{% include copy-clipboard.html %}
~~~ shell
tar xzvf cockroach-v20.2.0-alpha.3.linux-amd64.tgz
~~~

{% include copy-clipboard.html %}
~~~ shell
cd cockroach-v20.2.0-alpha.3.linux-amd64
~~~

## Step 2. Copy the binary and libraries to the appropriate directories

First, copy the `cockroach` binary to [the standard location for user-installed binaries](https://refspecs.linuxfoundation.org/FHS_3.0/fhs/ch04s09.html), and make sure it's marked as executable:

{% include copy-clipboard.html %}
~~~ shell
cp cockroach /usr/local/bin/
~~~

{% include copy-clipboard.html %}
~~~ shell
chmod 755 /usr/local/bin/cockroach
~~~

Next, copy the libraries to the location where CockroachDB expects to find them, in `/usr/local/lib/cockroach`. This is necessary because CockroachDB uses a custom-built version of the [GEOS](spatial-glossary.html#geos) libraries.

{% include copy-clipboard.html %}
~~~ shell
mkdir -p /usr/local/lib/cockroach
~~~

{% include copy-clipboard.html %}
~~~ shell
cp lib/libgeos.so /usr/local/lib/cockroach/
~~~

{% include copy-clipboard.html %}
~~~ shell
cp lib/libgeos_c.so /usr/local/lib/cockroach/
~~~

## Step 3. Test that the installation works

To make sure that CockroachDB Spatial is properly installed and can execute spatial queries, do the steps listed below.

1. Make sure the `cockroach` binary we just installed is the one that runs when you type `cockroach` in your shell:

    {% include copy-clipboard.html %}
    ~~~ shell
    which cockroach
    ~~~

    ~~~
    /usr/local/bin/cockroach
    ~~~

2. Start the `cockroach` binary using [`cockroach start`](cockroach-start.html):

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach start-single-node --insecure --background --listen-addr=localhost
    ~~~

    This should generate output that looks like the following:

    ~~~
    *
    * WARNING: RUNNING IN INSECURE MODE!
    *
    * - Your cluster is open for any client that can access localhost.
    * - Any user, even root, can log in without providing a password.
    * - Any user, connecting as root, can read or write any data in your cluster.
    * - There is no network encryption nor authentication, and thus no confidentiality.
    *
    * Check out how to secure your cluster: https://www.cockroachlabs.com/docs/v20.2/secure-a-cluster.html
    *
    ~~~

3. Run the following command to test that the spatial libraries have loaded properly:

    {% include copy-clipboard.html %}
    ~~~ shell
    cockroach sql --insecure -e 'SELECT ST_IsValid(ST_MakePoint(1,2))'
    ~~~

    This should result in the output shown below.

    ~~~
      st_isvalid
    --------------
         true
    (1 row)
    ~~~

    If your `cockroach` binary is not properly accessing the dynamically linked C libraries in `/usr/local/lib/cockroach` for some reason, it will output a message like the one shown below.

    ~~~
    ERROR: st_isvalid(): geos: error during GEOS init: geos: cannot load GEOS from dir "/usr/local/lib/cockroach": failed to execute dlopen
    Failed running "sql"
    ~~~

{{site.data.alerts.callout_info}}
If you are having difficulties installing CockroachDB Spatial, please see our [Support Resources](support-resources.html).
{{site.data.alerts.end}}

</section>

## See also

- [Working with Spatial Data](spatial-data.html)
- [Spatial Features](spatial-features.html)
- [Spatial & GIS Glossary of Terms](spatial-glossary.html)
- [Geospatial functions](functions-and-operators.html#geospatial-functions)
- [Install CockroachDB](install-cockroachdb.html)
