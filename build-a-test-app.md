---
title: Build a Test App
toc: false
---

This page demonstrates how to connect a simple test app to CockroachDB from various languages. The app creates a "bank" database, creates two accounts, and executes a transaction to transfer funds from one account to the other. 

We assume that you have already [installed CockroachDB](install-cockroachdb.html), [started a local cluster](start-a-local-cluster.html#insecure), and [installed the relevant client driver](install-client-drivers.html).

## Go

~~~ go
{% include app/basic-sample.go %}
~~~

## Python

~~~ py
{% include app/basic-sample.py %}
~~~

## Ruby

~~~ ruby
{% include app/basic-sample.rb %}
~~~

## Java

~~~ java
{% include app/BasicSample.java %}
~~~

## JavaScript (Node.js)

~~~ js
{% include app/basic-sample.js %}
~~~

## C++

~~~ c
{% include app/basic-sample.c %}
~~~

## Clojure

~~~ clojure
{% include app/basic-sample.clj %}
~~~

## PHP

~~~ php
{% include app/basic-sample.php %}
~~~
