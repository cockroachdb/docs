---
title: Build a Simple CRUD Elixir App with CockroachDB and the Postgrex  Driver
summary: Learn how to use CockroachDB from a simple Elixir application with the Postgrex driver.
toc: true
twitter: false
referral_id: docs_elixir_postgrex
filter_category: crud_elixir
filter_html: Use <strong>postgrex</strong>
filter_sort: 1
docs_area: get_started
---

{% include filter-tabs.md %}

This tutorial shows you how build a simple CRUD Elixir application with CockroachDB and the [Elixir Postgrex driver](https://hexdocs.pm/postgrex/Postgrex.html).

## Step 1. Start CockroachDB

{% include {{ page.version.version }}/app/sample-setup.md %}

## Step 2. Get the code

Clone the code's GitHub repo:

{% include_cached copy-clipboard.html %}
~~~ shell
$ git clone git@github.com:devalexandre/elixir-cockroach.git
~~~

The project has the following directory structure:
~~~
├── img
│   ├── img1.png
│   ├── img2.png
│   └── img3.png
├── lib
│   ├── cockroach
│   │   └── application.ex
│   ├── cockroach.ex
│   └── users.ex
├── mix.exs
├── priv
│   └── certs
├── Readme.livemd
└── README.md
~~~

For connect in your cluster , use a cerc file.

{% include_cached copy-clipboard.html %}
~~~shell
cp $HOME/.postgresql/root.crt priv/certs/ca-cert.crt]
~~~ 

Update a connect config.

{% include_cached copy-clipboard.html %}
~~~ elixir
{% remote_include https://raw.githubusercontent.com/devalexandre/elixir-cockroach/master/lib/cockroach/application.ex %}
~~~


## Step 3. Initialize the database

{% include {{ page.version.version }}/app/init-bank-sample.md %}

## Step 4. Run the code

For run local you can use livebook

{% include_cached copy-clipboard.html %}
~~~shell
mix local.rebar --force && mix local.hex --force]
~~~


{% include_cached copy-clipboard.html %}
~~~shell
mix escript.install hex livebook
~~~

{% include_cached copy-clipboard.html %}
~~~
livebook server
~~~

![step1](https://github.com/devalexandre/elixir-cockroach/blob/ca1a2df439a58f143e13a390237eb1a9ca60e2be/img/img1.png)
![step2](https://github.com/devalexandre/elixir-cockroach/blob/ca1a2df439a58f143e13a390237eb1a9ca60e2be/img/img2.png)
![step3](https://github.com/devalexandre/elixir-cockroach/blob/ca1a2df439a58f143e13a390237eb1a9ca60e2be/img/img3.png)


## What's next?

Read more about using the [Elixir Postgrex driver](https://hexdocs.pm/postgrex/Postgrex.html).

{% include {{ page.version.version }}/app/see-also-links.md %}
