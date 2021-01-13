Once your cluster is created, the **Connection info** modal displays. Use the information provided in the modal to set up your cluster connection for the SQL user that was created by default:

1. Click the name of the `cc-ca.crt` to download the CA certificate to your local machine.
1. Create a `certs` directory on your local machine:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

1. Move the downloaded `cc-ca.crt` file to the `certs` directory:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv <path>/<to>/cc-ca.crt <path>/<to>/certs
    ~~~

    For example:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mv Users/maxroach/Downloads/cc-ca.crt Users/maxroach/certs
    ~~~    

1. Copy the connection string provided, which will be used in the next steps (and to connect to your cluster in the future).

    {{site.data.alerts.callout_danger}}
    This connection string contains your password, which will be provided only once. If you forget your password, you can reset it by going to the [**SQL Users** page](user-authorization.html).
    {{site.data.alerts.end}}
