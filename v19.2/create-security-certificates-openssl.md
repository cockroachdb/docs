---
title: Create Security Certificates using Openssl
summary: A secure CockroachDB cluster uses TLS for encrypted inter-node and client-node communication.
toc: true
---

To secure your CockroachDB cluster's inter-node and client-node communication, you need to provide a Certificate Authority (CA) certificate that has been used to sign keys and certificates (SSLs) for:

- Nodes
- Clients
- Admin UI (optional)

To create these certificates and keys, use the `cockroach cert` [commands](cockroach-commands.html) with the appropriate subcommands and flags, use [`openssl` commands](https://wiki.openssl.org/index.php/), or use a [custom CA](create-security-certificates-custom-ca.html) (for example, a public CA or your organizational CA).

<div class="filters filters-big clearfix">
  <a href="cockroach-cert.html"><button style="width:28%" class="filter-button">Use cockroach cert</button>
  <button style="width:28%" class="filter-button current">Use <strong>Openssl</strong></button></a>
  <a href="create-security-certificates-custom-ca.html"><button style="width:28%" class="filter-button">Use custom CA</button></a>
</div>

## Subcommands

Subcommand | Usage
-----------|------
[`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) | Create an RSA private key.
[`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) | Create CA certificate and CSRs (certificate signing requests).
[`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) | Create node and client certificates using the CSRs.

## Configuration files

To use [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) and [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) subcommands, you need the following configuration files:

File name pattern | File usage
-------------|------------
`ca.cnf`     | CA configuration file
`node.cnf`   | Server configuration file
`client.cnf` | Client configuration file

## Certificate directory

To create node and client certificates using the OpenSSL commands, you need access to a local copy of the CA certificate and key. We recommend creating all certificates (node, client, and CA certificates), and node and client keys in one place and then distributing them appropriately. Store the CA key somewhere safe and keep a backup; if you lose it, you will not be able to add new nodes or clients to your cluster.

## Required keys and certificates

Use the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) and [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) subcommands to create all certificates, and node and client keys in a single directory, with the files named as follows:

### Node key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate
`node.crt`   | Server certificate
`node.key`   | Key for server certificate

### Client key and certificates

File name pattern | File usage
-------------|------------
`ca.crt`     | CA certificate.
`client.<user>.crt` | Client certificate for `<user>` (for example: `client.root.crt` for user `root`).
`client.<user>.key` | Key for the client certificate.

Note the following:

- The CA key should not be uploaded to the nodes and clients, so it should be created in a separate directory.

- Keys (files ending in `.key`) must not have group or world permissions (maximum permissions are 0700, or `rwx------`). This check can be disabled by setting the environment variable `COCKROACH_SKIP_KEY_PERMISSION_CHECK=true`.

## Examples

### Create the CA key and certificate pair

1. Create two directories:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir certs
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ mkdir my-safe-directory
    ~~~
    - `certs`: Create your CA certificate and all node and client certificates and keys in this directory and then upload the relevant files to the nodes and clients.
    - `my-safe-directory`: Create your CA key in this directory and then reference the key when generating node and client certificates. After that, keep the key safe and secret; do not upload it to your nodes or clients.

2. Create the `ca.cnf` file and copy the following configuration into it.

    You can set the CA certificate expiration period using the `default_days` parameter. We recommend using the CockroachDB default value of the CA certificate expiration period, which is 3660 days.

    {% include_cached copy-clipboard.html %}
    ~~~
    # OpenSSL CA configuration file
    [ ca ]
    default_ca = CA_default

    [ CA_default ]
    default_days = 3660
    database = index.txt
    serial = serial.txt
    default_md = sha256
    copy_extensions = copy
    unique_subject = no

    # Used to create the CA certificate.
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    x509_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = Cockroach CA

    [ extensions ]
    keyUsage = critical,digitalSignature,nonRepudiation,keyEncipherment,keyCertSign
    basicConstraints = critical,CA:true,pathlen:1

    # Common policy for nodes and users.
    [ signing_policy ]
    organizationName = supplied
    commonName = supplied

    # Used to sign node certificates.
    [ signing_node_req ]
    keyUsage = critical,digitalSignature,keyEncipherment
    extendedKeyUsage = serverAuth,clientAuth

    # Used to sign client certificates.
    [ signing_client_req ]
    keyUsage = critical,digitalSignature,keyEncipherment
    extendedKeyUsage = clientAuth
    ~~~

    {{site.data.alerts.callout_danger}}The <code>keyUsage</code> and <code>extendedkeyUsage</code> parameters are vital for CockroachDB functions. You can modify or omit other parameters as per your preferred OpenSSL configuration and you can add additional usages, but do not omit <code>keyUsage</code> and <code>extendedkeyUsage</code> parameters or remove the listed usages. {{site.data.alerts.end}}

3. Create the CA key using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out my-safe-directory/ca.key 2048
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 my-safe-directory/ca.key
    ~~~

4. Create the CA certificate using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -x509 \
    -config ca.cnf \
    -key my-safe-directory/ca.key \
    -out certs/ca.crt \
    -days 3660 \
    -batch
    ~~~

5. Reset database and index files.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm -f index.txt serial.txt
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ touch index.txt
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ echo '01' > serial.txt
    ~~~

### Create the certificate and key pairs for nodes

In the following steps, replace the placeholder text in the code with the actual username and node address.

1. Create the `node.cnf` file for the first node and copy the following configuration into it:

    {% include_cached copy-clipboard.html %}
    ~~~
    # OpenSSL node configuration file
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    req_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach
    # Required value for commonName, do not change.
    commonName = node

    [ extensions ]
    subjectAltName = DNS:<node-hostname>,DNS:<node-domain>,IP:<IP Address>
    ~~~

    {{site.data.alerts.callout_danger}}The <code>commonName</code> and <code>subjectAltName</code> parameters are vital for CockroachDB functions. It is also required that <code>commonName</code> be set to <code>node</code>. You can modify or omit other parameters as per your preferred OpenSSL configuration, but do not omit the <code>commonName</code> and <code>subjectAltName</code> parameters.  {{site.data.alerts.end}}

2. Create the key for the first node using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out certs/node.key 2048
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 certs/node.key
    ~~~

3. Create the CSR for the first node using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -config node.cnf \
    -key certs/node.key \
    -out node.csr \
    -batch
    ~~~

4. Sign the node CSR to create the node certificate for the first node using the [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) command.

    You can set the node certificate expiration period using the `days` flag. We recommend using the CockroachDB default value of the node certificate expiration period, which is 1830 days.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
    -config ca.cnf \
    -keyfile my-safe-directory/ca.key \
    -cert certs/ca.crt \
    -policy signing_policy \
    -extensions signing_node_req \
    -out certs/node.crt \
    -outdir certs/ \
    -in node.csr \
    -days 1830 \
    -batch
    ~~~

5. Upload certificates to the first node:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ ssh <username>@<node1 address> "mkdir certs"
    ~~~

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ scp certs/ca.crt \
    certs/node.crt \
    certs/node.key \
    <username>@<node1 address>:~/certs
    ~~~

6. Delete the local copy of the first node's certificate and key:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ rm certs/node.crt certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code>.{{site.data.alerts.end}}

7. Repeat steps 1 - 6 for each additional node.

8. Remove the `.pem` files in the `certs` directory. These files are unnecessary duplicates of the `.crt` files that CockroachDB requires.

### Create the certificate and key pair for a client

In the following steps, replace the placeholder text in the code with the actual username.

1. Create the `client.cnf` file for the first client and copy the following configuration into it:

    {% include_cached copy-clipboard.html %}
    ~~~
    [ req ]
    prompt=no
    distinguished_name = distinguished_name

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <username>
    ~~~

    {{site.data.alerts.callout_info}}The <code>commonName</code> parameter is vital for CockroachDB functions. You can modify or omit other parameters as per your preferred OpenSSL configuration, but do not omit the <code>commonName</code> parameter.  {{site.data.alerts.end}}

2. Create the key for the first client using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out certs/client.<username>.key 2048
    ~~~
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 certs/client.<username>.key
    ~~~

3. Create the CSR for the first client using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -config client.cnf \
    -key certs/client.<username>.key \
    -out client.<username>.csr \
    -batch
    ~~~

4. Sign the client CSR to create the client certificate for the first client using the [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) command. You can set the client certificate expiration period using the `days` flag. We recommend using the CockroachDB default value of the client certificate expiration period, which is 1830 days.

    {% include_cached copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
    -config ca.cnf \
    -keyfile my-safe-directory/ca.key \
    -cert certs/ca.crt \
    -policy signing_policy \
    -extensions signing_client_req \
    -out certs/client.<username>.crt \
    -outdir certs/ \
    -in client.<username>.csr \
    -days 1830 \
    -batch
    ~~~    

5. Upload certificates to the first client using your preferred method.

6. Repeat steps 1 - 5 for each additional client.

7. Remove the `.pem` files in the `certs` directory. These files are unnecessary duplicates of the `.crt` files that CockroachDB requires.

## See also

- [Manual Deployment](manual-deployment.html): Learn about starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](cockroach-start.html): Learn more about the flags you pass when adding a node to a secure cluster
- [Client Connection Parameters](connection-parameters.html)
