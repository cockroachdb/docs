1. Launch a temporary interactive pod and start the [built-in SQL client](cockroach-sql.html) inside it:

    <section class="filter-content" markdown="1" data-scope="manual">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl run cockroachdb -it \
    --image=cockroachdb/cockroach:{{page.release_info.version}} \
    --rm \
    --restart=Never \
    -- sql \
    --insecure \
    --host=cockroachdb-public
    ~~~
    </section>

    <section class="filter-content" markdown="1" data-scope="helm">
    {% include copy-clipboard.html %}
    ~~~ shell
    $ kubectl run cockroachdb -it \
    --image=cockroachdb/cockroach:{{page.release_info.version}} \
    --rm \
    --restart=Never \
    -- sql \
    --insecure \
    --host=my-release-cockroachdb-public
    ~~~    
    </section>

2. Run some basic [CockroachDB SQL statements](learn-cockroachdb-sql.html):

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE DATABASE bank;
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > CREATE TABLE bank.accounts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    	  balance DECIMAL
      );
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > INSERT INTO bank.accounts (balance)
      VALUES
    	  (1000.50), (20000), (380), (500), (55000);
    ~~~

    {% include copy-clipboard.html %}
    ~~~ sql
    > SELECT * FROM bank.accounts;
    ~~~

    ~~~
                       id                  | balance
    +--------------------------------------+---------+
      6f123370-c48c-41ff-b384-2c185590af2b |     380
      990c9148-1ea0-4861-9da7-fd0e65b0a7da | 1000.50
      ac31c671-40bf-4a7b-8bee-452cff8a4026 |     500
      d58afd93-5be9-42ba-b2e2-dc00dcedf409 |   20000
      e6d8f696-87f5-4d3c-a377-8e152fdc27f7 |   55000
    (5 rows)
    ~~~

3. Exit the SQL shell and delete the temporary pod:

    {% include copy-clipboard.html %}
    ~~~ sql
    > \q
    ~~~
