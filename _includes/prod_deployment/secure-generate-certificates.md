You can use either `cockroach cert` commands or [`openssl` commands](create-security-certificates-openssl.html) to generate the security certificates. This section discusses the procedure to generate certificates using the `cockroach cert` commands.

Locally, you'll need to [create the following certificates and keys](create-security-certificates.html):

- A certificate authority (CA) key pair (`ca.crt` and `ca.key`).
- A node key pair for each node, issued to its IP addresses and any common names the machine uses, as well as to the IP addresses and common names for machines running load balancers.
- A client key pair for the `root` user.

{{site.data.alerts.callout_success}}Before beginning, it's useful to collect each of your machine's internal and external IP addresses, as well as any server names you want to issue certificates for.{{site.data.alerts.end}}

1. [Install CockroachDB](install-cockroachdb.html) on your local machine, if you haven't already.

2. Create two directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: You'll generate your CA certificate and all node and client certificates and keys in this directory and then upload some of the files to your nodes.
    - `my-safe-directory`: You'll generate your CA key in this directory and then reference the key when generating node and client certificates. After that, you'll keep the key safe and secret; you will not upload it to your nodes.

3. Create the CA certificate and key:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-ca \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

4. Create the certificate and key for the first node, issued to all common names you might use to refer to the node as well as to the load balancer instances:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-node \
	<node1 internal IP address> \
	<node1 external IP address> \
	<node1 hostname>  \
	<other common names for node1> \
	localhost \
	127.0.0.1 \
	<load balancer IP address> \
	<load balancer hostname>  \
	<other common names for load balancer instances> \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

5. Upload certificates to the first node:

    {% include copy-clipboard.html %}
	~~~ shell
	# Create the certs directory:
	$ ssh <username>@<node1 address> "mkdir certs"
	~~~

	{% include copy-clipboard.html %}
	~~~ shell
	# Upload the CA certificate and node certificate and key:
	$ scp certs/ca.crt \
	certs/node.crt \
	certs/node.key \
	<username>@<node1 address>:~/certs
	~~~

6. Delete the local copy of the node certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code> As an alternative to deleting these files, you can run the next <code>cockroach cert create-node</code> commands with the <code>--overwrite</code> flag.{{site.data.alerts.end}}

7. Create the certificate and key for the second node, issued to all common names you might use to refer to the node as well as to the load balancer instances:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-node \
	<node2 internal IP address> \
	<node2 external IP address> \
	<node2 hostname>  \
	<other common names for node1> \
	localhost \
	127.0.0.1 \
	<load balancer IP address> \
	<load balancer hostname>  \
	<other common names for load balancer instances> \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

8. Upload certificates to the second node:

    {% include copy-clipboard.html %}
	~~~ shell
	# Create the certs directory:
	$ ssh <username>@<node2 address> "mkdir certs"
	~~~

	{% include copy-clipboard.html %}
	~~~ shell
	# Upload the CA certificate and node certificate and key:
	$ scp certs/ca.crt \
	certs/node.crt \
	certs/node.key \
	<username>@<node2 address>:~/certs
	~~~

9. Repeat steps 6 - 8 for each additional node.

10. Create a client certificate and key for the `root` user:

    {% include copy-clipboard.html %}
	~~~ shell
	$ cockroach cert create-client \
	root \
	--certs-dir=certs \
	--ca-key=my-safe-directory/ca.key
	~~~

    {{site.data.alerts.callout_success}}In later steps, you'll use the <code>root</code> user's certificate to run <a href="cockroach-commands.html"><code>cockroach</code></a> client commands from your local machine. If you might also want to run <code>cockroach</code> client commands directly on a node (e.g., for local debugging), you'll need to copy the <code>root</code> user's certificate and key to that node as well.{{site.data.alerts.end}}
