---
title: View Version Details
summary: To view version details for a specific cockroach binary, run the cockroach version command.
toc: false
---

To view version details for a specific `cockroach` binary, run the `cockroach version` [command](cockroach-commands.html):

~~~ shell
$ cockroach version
Build Tag:   {{site.data.strings.version}}
Build Time:  {{site.data.strings.build_time}}
Platform:    darwin amd64
Go Version:  go1.7.1
C Compiler:  4.2.1 Compatible Apple LLVM 7.3.0 (clang-703.0.31)
~~~

The `cockroach version` command outputs the following fields:

Field | Description
------|------------
`Build Tag` | The CockroachDB version.
`Build Time` | The date and time when the binary was built.
`Platform` | The platform that the binary can run on.
`Go Version` | The version of Go in which the source code is written.
`C Compiler` | The C compiler used to build the binary.

To also list the repositories containing first- and third-party code used to the build the binary, add the `--deps` flag:

~~~ shell
$ cockroach version --deps
Build Tag:   {{site.data.strings.version}}
Build Time:  {{site.data.strings.build_time}}
Platform:    darwin amd64
Go Version:  go1.7.1
C Compiler:  4.2.1 Compatible Apple LLVM 7.3.0 (clang-703.0.31)
Build Deps:
  github.com/VividCortex/ewma                       c595cd886c223c6c28fc9ae2727a61b5e4693d85
  github.com/biogo/store                            913427a1d5e89604e50ea1db0f28f34966d61602
  github.com/cenk/backoff                           8edc80b07f38c27352fb186d971c628a6c32552b
  github.com/chzyer/readline                        25c2772d5fd908077927228597b084a1f1a0e66d
  github.com/cockroachdb/c-jemalloc                 42e6a32cd7a4dff9c70d80323681d46d046181ef
  github.com/cockroachdb/c-protobuf                 951f3e665896e7ba939fd1f2db9aeaae6ca988f8
  github.com/cockroachdb/c-rocksdb                  b5ca031b93fde49bfa2ba99aba423136aebf3c06
  github.com/cockroachdb/c-snappy                   d4e7b428fe7fc09e93573df3448567a62df8c9fa
  github.com/cockroachdb/cmux                       b64f5908f4945f4b11ed4a0a9d3cc1e23350866d
  github.com/cockroachdb/cockroach                  125aca089913f23d7d8d4d1711320e2dda25a145
  github.com/cockroachdb/pq                         44a6473ebbc26e3af09fe57bbdf761475c2c9f7c
  github.com/codahale/hdrhistogram                  3a0bb77429bd3a61596f5e8a3172445844342120
  github.com/coreos/etcd                            33e4f2ea283c187cac459462994d084f44d7c9de
  github.com/cpuguy83/go-md2man                     a65d4d2de4d5f7c74868dfa9b202a3c8be315aaa
  github.com/dustin/go-humanize                     bd88f87ad3a420f7bcf05e90566fd1ceb351fa7f
  github.com/elastic/gosigar                        2716c1fe855ee5c88eae707195e0688374458c92
  github.com/elazarl/go-bindata-assetfs             9a6736ed45b44bf3835afeebb3034b57ed329f3e
  github.com/facebookgo/clock                       600d898af40aa09a7a93ecb9265d87b0504b6f03
  github.com/gogo/protobuf                          fdc14ac22689d09f8639e603614593811bc1d81c
  github.com/golang/protobuf                        df1d3ca07d2d07bba352d5b73c4313b4e2a6203e
  github.com/google/btree                           7364763242911ab6d418d2722e237194938ebad0
  github.com/grpc-ecosystem/grpc-gateway            acebe0f9ff5993e130b141ee60e83e592839ca22
  github.com/jeffjen/datefmt                        6688647cfa0439b86e09b097cac96ed328d5fa34
  github.com/kr/pretty                              cfb55aafdaf3ec08f0db22699ab822c50091b1c4
  github.com/kr/text                                7cafcd837844e784b526369c9bce262804aebc60
  github.com/leekchan/timeutil                      28917288c48df3d2c1cfe468c273e0b2adda0aa5
  github.com/lib/pq                                 fcb9ef54da7cae1ea08f0b5a92f236d83e59294a
  github.com/lightstep/lightstep-tracer-go          7ec5005048fddb1fc15627e1bf58796ce01d919e
  github.com/mattn/go-isatty                        66b8e73f3f5cda9f96b69efd03dd3d7fc4a5cdb8
  github.com/mattn/go-runewidth                     d6bea18f789704b5f83375793155289da36a3c7f
  github.com/matttproud/golang_protobuf_extensions  c12348ce28de40eed0136aa2b644d0ee0650e56c
  github.com/olekukonko/tablewriter                 bdcc175572fd7abece6c831e643891b9331bc9e7
  github.com/opentracing/basictracer-go             1b32af207119a14b1b231d451df3ed04a72efebf
  github.com/opentracing/opentracing-go             30dda9350627161ff15581c0bdc504e32ec9a536
  github.com/petermattis/goid                       ba001f8780f3bf978180f390ad7b5bac39fbf70a
  github.com/pkg/errors                             839d9e913e063e28dfd0e6c7b7512793e0a48be9
  github.com/prometheus/client_model                fa8ad6fec33561be4280a8f0514318c79d7f6cb6
  github.com/prometheus/common                      85637ea67b04b5c3bb25e671dacded2977f8f9f6
  github.com/rcrowley/go-metrics                    ab2277b1c5d15c3cba104e9cbddbdfc622df5ad8
  github.com/rubyist/circuitbreaker                 7e3e7fbe9c62b943d487af023566a79d9eb22d3b
  github.com/satori/go.uuid                         b061729afc07e77a8aa4fad0a2fd840958f1942a
  github.com/spf13/cobra                            9c28e4bbd74e5c3ed7aacbc552b2cab7cfdfe744
  github.com/spf13/pflag                            c7e63cf4530bcd3ba943729cee0efeff2ebea63f
  golang.org/x/crypto                               484eb34681af59703e639b971bc307019182c41f
  golang.org/x/net                                  f4b625ec9b21d620bb5ce57f2dfc3e08ca97fce6
  golang.org/x/text                                 098f51fb687dbaba1f6efabeafbb6461203f9e21
  google.golang.org/grpc                            79b7c349179cdd6efd8bac4a1ce7f01b98c16e9b
  gopkg.in/inf.v0                                   3887ee99ecf07df5b447e9b00d9c0b2adaa9f3e4
  gopkg.in/yaml.v2                                  a5b47d31c556af34a302ce5d659e6fea44d90de0
~~~