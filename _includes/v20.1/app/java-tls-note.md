{{site.data.alerts.callout_danger}}
CockroachDB versions v20.1 and lower require TLS 1.2. By default, Java 8 uses TLS 1.2, but applications running on Java 9+ must be configured to run TLS 1.2. For example, when starting your app: `$ java -Djdk.tls.client.protocols=TLSv1.2 appName`
{{site.data.alerts.end}}