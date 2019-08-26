Partitioning is an enterprise-only feature. To continue, you must set a trial or enterprise key in your cluster settings:

  1. [Request a trial enterprise license](https://www.cockroachlabs.com/get-cockroachdb/). You should receive your trial license via email within a few minutes.

  2. Run the following commands in your SQL shell to enable enterprise features using your trial license:
    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING cluster.organization = '<your organization>';
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SET CLUSTER SETTING enterprise.license = '<your license key>';
    ~~~
