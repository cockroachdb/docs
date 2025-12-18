---
title: Go Implementation
summary: CockroachDB is built in Go.
toc: false
---

The choice of language matters. Speed, stability, maintainability: each of these attributes of the underlying language can impact how quickly CockroachDB evolves and how well it works. Not all languages were created equal. Go is an open source programming language developed primarily at Google as a viable alternative to C++ and Java.

-   Excellent environment for building distributed systems
-   Faster compile times
-   Garbage collection and type safety provide stability
-   Readable, well-documented code encourages open source contributions

<img src="{{ 'images/v2.1/2go-implementation.png' | relative_url }}" alt="CockroachDB is built in Go" style="width: 400px" />

## See also

- [Why Go Was the Right Choice for CockroachDB](https://www.cockroachlabs.com/blog/why-go-was-the-right-choice-for-cockroachdb/)
- [How to Optimize Garbage Collection in Go](https://www.cockroachlabs.com/blog/how-to-optimize-garbage-collection-in-go/)
- [The Cost and Complexity of Cgo](https://www.cockroachlabs.com/blog/the-cost-and-complexity-of-cgo/)
- [Outsmarting Go Dependencies in Testing Code](https://www.cockroachlabs.com/blog/outsmarting-go-dependencies-testing-code/)
