    <section class="filter-content" markdown="1" data-scope="mac">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-v21.1.0.darwin-10.9- amd64.tgz | tar -xJ && cp -i cockroach-v21.1.0.darwin -10.9-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="linux">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    curl https://binaries.cockroachdb.com/cockroach-v21.1.0.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-v21.1.0.linux-amd64/cockroach /usr/local/bin/
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="windows">
    {% include_cached copy-clipboard.html %}
    ~~~ shell
    mkdir -p %APPDATA%\Cockroach && copy https://binaries.cockroachdb.com/cockroach-v21.1.2.windows-6.2-amd64.zip %APPDATA%\Cockroach && [Environment]::SetEnvironmentVariable("PATH", "%APPDATA%\Cockroach", "User")
    ~~~
    </section>