{{site.data.alerts.callout_danger}}
CockroachDB versions v20.2 and higher support TLS 1.2 and 1.3, and use 1.3 by default.

A bug in the TLS 1.3 implementation in Java 11 versions lower than 11.0.7 and Java 13 versions lower than 13.0.3 makes the versions incompatible with CockroachDB. For applications running Java 11 or 13, make sure that you have version 11.0.7 or higher, or 13.0.3 or higher.

If you cannot upgrade to a version higher than 11.0.7 or 13.0.3, you must configure the application to use TLS 1.2. For example, when starting your app, use: `$ java -Djdk.tls.client.protocols=TLSv1.2 appName`
{{site.data.alerts.end}}