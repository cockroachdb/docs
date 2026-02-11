CockroachDB supports TLS 1.2 and 1.3, and uses 1.3 by default.

{% include common/tls-bad-cipher-warning.md %}

[A bug in the TLS 1.3 implementation](https://bugs.openjdk.java.net/browse/JDK-8236039) in Java 11 versions lower than 11.0.7 and Java 13 versions lower than 13.0.3 makes the versions incompatible with CockroachDB.

If an incompatible version is used, the client may throw the following exception:

`javax.net.ssl.SSLHandshakeException: extension (5) should not be presented in certificate_request`

For applications running Java 11 or 13, make sure that you have version 11.0.7 or higher, or 13.0.3 or higher.

If you cannot upgrade to a version higher than 11.0.7 or 13.0.3, you must configure the application to use TLS 1.2. For example, when starting your app, use: `$ java -Djdk.tls.client.protocols=TLSv1.2 appName`
