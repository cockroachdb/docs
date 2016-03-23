---
title: Build a Test App
toc: false
---

This page demonstrates how to connect a simple test app to CockroachDB from various languages. The app creates a "bank" database, creates two accounts, and executes a transaction to transfer funds from one account to the other. 

We assume that you have already [installed CockroachDB](install-cockroachdb.html), [started a local cluster](start-a-local-cluster.html#insecure), and [installed the relevant client driver](install-client-drivers.html).

## Go

~~~ go
{% include app/test-app1.go %}
~~~

## Python

~~~ py
{% include app/test-app1.py %}
~~~

## Ruby

~~~ ruby
{% include app/test-app1.rb %}
~~~

## Java

~~~ ruby
{% include app/test-app1.java %}
~~~

## JavaScript (Node.js)

~~~ js
{% include app/test-app1.js %}
~~~

## C/C++

~~~ c
{% include app/test-app1.c %}
~~~

## Clojure

~~~ clojure
{% include app/test-app1.clj %}
~~~

## PHP

~~~ php
{% include app/test-app1.php %}
~~~
