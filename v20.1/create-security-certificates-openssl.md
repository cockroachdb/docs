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

### Step 1. Create the CA key and certificate pair

1. Create three directories:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ mkdir node-certs client-certs my-safe-directory
    ~~~
    - `node-certs`: Create your CA certificate and all node certificates and keys in this directory and then upload the relevant files to the nodes.
    - `client-certs`: Copy your CA certificate to this folder and create all client certificates and keys in this directory and then upload the relevant files to the clients.
    - `my-safe-directory`: Create your CA key in this directory and then reference the key when generating node and client certificates. After that, keep the key safe and secret; do not upload it to your nodes or clients.

2. Create the `ca.cnf` file and copy the following configuration into it.

    You can set the CA certificate expiration period using the `default_days` parameter. We recommend using the CockroachDB default value of the CA certificate expiration period, which is 365 days.

    {% include copy-clipboard.html %}
    ~~~
    # OpenSSL CA configuration file
    [ ca ]
    default_ca = CA_default

    [ CA_default ]
    default_days = 365
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
    commonName = optional

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

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out my-safe-directory/ca.key 2048
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 my-safe-directory/ca.key
    ~~~

4. Create the CA certificate using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -x509 \
    -config ca.cnf \
    -key my-safe-directory/ca.key \
    -out node-certs/ca.crt \
    -days 365 \
    -batch
    ~~~

6. Reset database and index files.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm -f index.txt serial.txt
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ touch index.txt
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ echo '01' > serial.txt
    ~~~

### Step 2. Create the certificate and key pairs for nodes

In the following steps, replace the placeholder text in the code with the actual username and node address.

1. Create the `node.cnf` file for the first node and copy the following configuration into it:

    {% include copy-clipboard.html %}
    ~~~
    # OpenSSL node configuration file
    [ req ]
    prompt=no
    distinguished_name = distinguished_name
    req_extensions = extensions

    [ distinguished_name ]
    organizationName = Cockroach

    [ extensions ]
    subjectAltName = critical,DNS:<node-hostname>,DNS:<node-domain>,IP:<IP Address>
    ~~~

    {{site.data.alerts.callout_danger}}The <code>subjectAltName</code> parameter is vital for CockroachDB functions. You can modify or omit other parameters as per your preferred OpenSSL configuration, but do not omit the <code>subjectAltName</code> parameter.  {{site.data.alerts.end}}

2. Create the key for the first node using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out node-certs/node.key 2048
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 node-certs/node.key
    ~~~

3. Create the CSR for the first node using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -config node.cnf \
    -key node-certs/node.key \
    -out node.csr \
    -batch
    ~~~

4. Sign the node CSR to create the node certificate for the first node using the [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) command.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
    -config ca.cnf \
    -keyfile my-safe-directory/ca.key \
    -cert node-certs/ca.crt \
    -policy signing_policy \
    -extensions signing_node_req \
    -out node-certs/node.crt \
    -outdir node-certs/ \
    -in node.csr \
    -batch
    ~~~

5. Verify the values in the `Subject Alternative Name` field in the certificate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl x509 -in node-certs/node.crt -text | grep "X509v3 Subject Alternative Name" -A 1
    ~~~

    Example output:
    ~~~
    X509v3 Subject Alternative Name: critical
                DNS:localhost, DNS:node.example.io, IP Address:127.0.0.1
    ~~~

6. Upload certificates to the first node:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ ssh <username>@<node1 address> "mkdir node-certs"
    ~~~

    {% include copy-clipboard.html %}
    ~~~ shell
    $ scp node-certs/ca.crt \
    node-certs/node.crt \
    node-certs/node.key \
    <username>@<node1 address>:~/node-certs
    ~~~

7. Delete the local copy of the first node's certificate and key:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ rm node-certs/node.crt node-certs/node.key
    ~~~

    {{site.data.alerts.callout_info}}This is necessary because the certificates and keys for additional nodes will also be named <code>node.crt</code> and <code>node.key</code>.{{site.data.alerts.end}}

8. Repeat steps 1 - 6 for each additional node.

9. Remove the `.pem` files in the `node-certs` directory. These files are unnecessary duplicates of the `.crt` files that CockroachDB requires.

### Step 3. Create the certificate and key pair for the first user

1. Copy the `ca.crt` from the `node-certs` directory to the `client-certs` directory

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cp node-certs/ca.crt client-certs
    ~~~

2. Create the `client.cnf` file for the first user and copy the following configuration into it:

    {% include copy-clipboard.html %}
    ~~~
    [ req ]
    prompt=no
    distinguished_name = distinguished_name

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <username_1>

    [ extensions ]
    subjectAltName = DNS:root
    ~~~

    {{site.data.alerts.callout_danger}}The <code>commonName</code> and <code>subjectAltName</code> parameters are vital for CockroachDB functions. You can modify or omit other parameters as per your preferred OpenSSL configuration, but do not omit the <code>commonName</code> parameter or modify the <code>subjectAltName</code> parameter. {{site.data.alerts.end}}

3. Create the key for the first client using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out client-certs/client.<username_1>.key 2048
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 client-certs/client.<username_1>.key
    ~~~

4. Create the CSR for the first client using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -config client.cnf \
    -key client-certs/client.<username_1>.key \
    -out client.<username_1>.csr \
    -batch
    ~~~

5. Sign the client CSR to create the client certificate for the first client using the [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) command.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
    -config ca.cnf \
    -keyfile my-safe-directory/ca.key \
    -cert client-certs/ca.crt \
    -policy signing_policy \
    -extensions signing_client_req \
    -out client-certs/client.<username_1>.crt \
    -outdir client-certs/ \
    -in client.<username_1>.csr \
    -batch
    ~~~    

6. Verify the values in the `CN` field in the certificate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl x509 -in client-certs/client.<username_1>.crt -text | grep CN=
    ~~~

    Output:

    ~~~
    Issuer: O=Cockroach, CN=Cockroach CA
        Subject: O=Cockroach, CN=<username_1>
    ~~~

7. Remove the `.pem` files in the `client-certs` directory. These files are unnecessary duplicates of the `.crt` files that CockroachDB requires.

### Step 4. Start a local cluster and connect using the built-in SQL client

1. Start a single-node cluster:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach start-single-node --certs-dir=node-certs --cert-principal-map=<node-domain>:node,<username_1>:root --background
    ~~~

2. Connect to the cluster using the built-in SQL client:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=client-certs
    ~~~

3. Create a new SQL user:

    {% include copy-clipboard.html %}
    ~~~ sql
    > create user <username_2>;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~

### Step 5. Create the certificate and key pair for a client

In the following steps, replace the placeholder text in the code with the actual username.

1. Edit the `client.cnf` file for the client and copy the following configuration into it:

    {% include copy-clipboard.html %}
    ~~~
    [ req ]
    prompt=no
    distinguished_name = distinguished_name

    [ distinguished_name ]
    organizationName = Cockroach
    commonName = <username_2>
    ~~~

    {{site.data.alerts.callout_danger}}The <code>commonName</code> parameter is vital for CockroachDB functions. You can modify or omit other parameters as per your preferred OpenSSL configuration, but do not omit the <code>commonName</code> parameter.  {{site.data.alerts.end}}

2. Create the key for the first client using the [`openssl genrsa`](https://www.openssl.org/docs/manmaster/man1/genrsa.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl genrsa -out client-certs/client.<username_2>.key 2048
    ~~~
    {% include copy-clipboard.html %}
    ~~~ shell
    $ chmod 400 client-certs/client.<username_2>.key
    ~~~

3. Create the CSR for the first client using the [`openssl req`](https://www.openssl.org/docs/manmaster/man1/req.html) command:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl req \
    -new \
    -config client.cnf \
    -key client-certs/client.<username_2>.key \
    -out client.<username_2>.csr \
    -batch
    ~~~

4. Sign the client CSR to create the client certificate for the first client using the [`openssl ca`](https://www.openssl.org/docs/manmaster/man1/ca.html) command.

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl ca \
    -config ca.cnf \
    -keyfile my-safe-directory/ca.key \
    -cert client-certs/ca.crt \
    -policy signing_policy \
    -extensions signing_client_req \
    -out client-certs/client.<username_2>.crt \
    -outdir client-certs/ \
    -in client.<username_2>.csr \
    -batch
    ~~~    

5. Verify the values in the `CN` field in the certificate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ openssl x509 -in client-certs/client.<username_2>.crt -text | grep CN=
    ~~~

    Example output:

    ~~~
    Issuer: O=Cockroach, CN=Cockroach CA
        Subject: O=Cockroach, CN=roach
    ~~~

6. Upload certificates to the client using your preferred method.

7. Connect to the SQL client using the client certificate:

    {% include copy-clipboard.html %}
    ~~~ shell
    $ cockroach sql --certs-dir=client-certs --user=<username_2>
    ~~~

8. Repeat steps 1 - 7 for each additional client.

9. Remove the `.pem` files in the `client-certs` directory. These files are unnecessary duplicates of the `.crt` files that CockroachDB requires.

## See also

- [Manual Deployment](manual-deployment.html): Learn about starting a multi-node secure cluster and accessing it from a client.
- [Start a Node](cockroach-start.html): Learn more about the flags you pass when adding a node to a secure cluster
- [Client Connection Parameters](connection-parameters.html)
