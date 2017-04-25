There are two parts to certificate rotation: generating the new certificates, and reloading them.

Both have been improved, with the main difference being that we can now reload certificates without restarting a node.

## Order of certificate regeneration

Most of the complication in rotating certificates is proper handling of new CA certificates.
It's important for all parts of the system (nodes and clients) to have the same CA certificates, or they may not be able to verify each other's client/node certificates.

It is possible to have multiple CA certificates active at the same time, but not node or client certificates. Therefore, CA certificates should be generated and pushed first, followed by new node/client certificates using the new CA.

Let's say we want to regenerate all certificates (CA, client, node), we should do the following:
1. generate new CA certificate and combine it with the existing one
1. push combined CA certificate to all nodes and reload certificates
1. make combined CA available to all clients. We may need to wait some time (days/weeks) for all clients to make use of the new certificate
1. generate and push new node/client certificates using the new CA certificate

It is recommended to change CA certificates on a completely different schedule. eg: months before.
**WARNING**: node certificates generated with the new CA will not be accepted by clients that do not yet have the new CA. Before all clients have the new CA cert, node certificates should be signed with the old CA (this is still a [TODO](https://github.com/cockroachdb/cockroach/blob/master/pkg/cli/cert.go#L91-L93))

## Generating new CA certificates

CA rotation includes generating a new CA certificate and key.

If the original certificate and key are generated using:
```
$ cockroach cert create-ca --certs-dir=certs --ca-key=ca.key --logtostderr=true
I170425 14:20:29.394473 1 security/certs.go:120  Generated CA key ca.key
I170425 14:20:29.398081 1 security/certs.go:173  Wrote 1 certificates to certs/ca.crt
```

We can generate a new CA certificate and key with the following:
```
$ cockroach cert create-ca --certs-dir=certs --ca-key=ca.new.key --overwrite --logtostderr=true
I170425 14:21:10.490341 1 security/certs.go:120  Generated CA key ca.new.key
I170425 14:21:10.494007 1 security/certs.go:160  Found 1 certificates in certs/ca.crt
I170425 14:21:10.494341 1 security/certs.go:173  Wrote 2 certificates to certs/ca.crt
```

Flags:
* `--ca-key=ca.new.key`: path to the new key to generate. To re-use the existing key (not recommended), use `--ca-key=ca.key` and `--allow-key-reuse`.
* `--overwrite`: add the new certificate to the existing `ca.crt` file.

This results in a `ca.crt` containing the new certificate followed by the old certificate. This
combined CA certificate should be used by all nodes and clients to verify old node/client certificates
and well as new certificates.

## Generating new node/client certificates

Client and node certificates are simpler than CA certificates because we do not need to keep old
certificates around.

Generating a new certificate and key is the same as the original generation. If the files already exist, specify `--overwrite` to overwrite both certificate and key.

If the original certificate and key for node `localhost` were created with:
```
$ cockroach cert create-node --certs-dir=certs --ca-key=ca.key --logtostderr=true localhost
I170425 14:28:10.713448 1 security/certs.go:226  Generated node certificate: certs/node.crt
I170425 14:28:10.713845 1 security/certs.go:232  Generated node key: certs/node.key
```

We can either delete the `node.crt` and `node.key` files and rerun the same command, or run:
```
roach cert create-node --certs-dir=certs --ca-key=ca.key --logtostderr=true --overwrite localhost
I170425 14:28:45.839331 1 security/certs.go:226  Generated node certificate: certs/node.crt
I170425 14:28:45.839556 1 security/certs.go:232  Generated node key: certs/node.key
```

## Deploying certificates

Cockroach does not currently provide any tools to deploy certificates and keys to clients and nodes.
The appropriate files should be copied to the hosts needing them. Specifically:

* each node needs: `ca.crt`, `node.crt`, `node.key`, with the node certificate issued for its hostnames and IPs
* a client with username `marc` needs: `ca.crt`, `client.marc.crt`, `client.marc.key`.

When generated a new CA certificate and adding it to the existing file, you **must** push the newly 
generated file containing both certificates.

Node and client certificate and keys can be replaced entirely as they are re-generated.
The key file must be the one generated at the same time as the corresponding certificate.

## Reloading certificates on a node

Certificates are loaded automatically when a node starts.
It is also possible to tell a running node to re-scan the certificates directory and use the
new certificates if found.

This is done by issuing a `SIGHUP` signal to the cockroach process:
```
pkill -SIGHUP -x cockroach
```

Flags:
* `-SIGHUP`: send a `SIGHUP` signal
* `-x`: only look for the process named exactly `cockroach`.

This must be run by the same user running the process (eg: run with `sudo` if cockroach is running under user `root`).

Upon receiving the signal, the node will attempt to reload the files in the certificates directory.
It will refuse to if the CA certificate or node certificate disappear.

A successful reload will be seen in the logs as:
```
I170425 14:40:50.744709 16 security/certificate_manager.go:96  received signal "hangup", triggering certificate reload
I170425 14:40:50.744899 16 security/certificate_manager.go:100  successfully reloaded certificates
```

A failed reload will be seen in the logs with an error, such as:
```
I170425 14:42:00.983732 16 security/certificate_manager.go:96  received signal "hangup", triggering certificate reload
W170425 14:42:00.983927 16 security/certificate_manager.go:98  could not reload certificates: CA certificate has disappeared
```
