---
title: View Version Details
toc: false
---

To view version details for a specific `cockroach` binary, run the `cockroach version` [command](cockroach-commands.html):

~~~ shell
$ ./cockroach version
Build Tag:   beta-20160421
Build Time:  2016/04/21 16:25:23
Platform:    darwin amd64
Go Version:  go1.6.1
C Compiler:  4.2.1 Compatible Ubuntu Clang 3.7.0 (tags/RELEASE_370/final)
~~~

The output includes the following fields:

Field | Description 
------|------------
`Build Tag` |
`Build Time` |
`Platform` |
`Go Version` |
`C Compiler` |

To also list the repositories containing first- and third-party code used to the build the binary, add the `--deps` flag:

~~~ shell
$ ./cockroach version --deps
Build Tag:   {{site.data.strings.version}}
Build Time:  {{site.data.strings.build_time}}
Platform:    darwin amd64
Go Version:  go1.6.1
C Compiler:  4.2.1 Compatible Ubuntu Clang 3.7.0 (tags/RELEASE_370/final)
Build Deps:
  github.com/biogo/store                     3b4c041f52c224ee4a44f5c8b150d003a40643a0
  github.com/chzyer/readline                 f2a9cba613d3b2f1eb435992201d5787e6551830
  github.com/cockroachdb/cmux                112f0506e7743d64a6eb8fedbcff13d9979bbf92
  github.com/cockroachdb/cockroach           e6880ae2bce8f2a391f6adc07f9945c783480e2b
  github.com/cockroachdb/c-protobuf          4feb192131ea08dfbd7253a00868ad69cbb61b81
  github.com/cockroachdb/c-rocksdb           b80d2efe8e544bbcc4b50dec8e89f9305f5da745
  github.com/cockroachdb/c-snappy            5c6d0932e0adaffce4bfca7bdf2ac37f79952ccf
  github.com/cockroachdb/pq                  3d7f893b32668bbf6dacfc59367d7a4c004457cc
  github.com/codahale/hdrhistogram           360314142131c2043d1346f197f86435b287c6da
  github.com/coreos/etcd                     6c8428c3939a7fa224ac8e97005b1967f3fd87f1
  github.com/cpuguy83/go-md2man              2724a9c9051aa62e9cca11304e7dd518e9e41599
  github.com/dustin/go-humanize              8929fe90cee4b2cb9deb468b51fb34eba64d1bf0
  github.com/elastic/gosigar                 28809b70ab5790851083da5405c0e2ca2a80fe23
  github.com/elazarl/go-bindata-assetfs      57eb5e1fc594ad4b0b1dbea7b286d299e0cb43c2
  github.com/gengo/grpc-gateway              965b62d83c33af1be34fd5d70ccf814c4029a319
  github.com/gogo/protobuf                   4365f750fe246471f2a03ef5da5231c3565c5628
  github.com/golang/protobuf                 dda510ac0fd43b39770f22ac6260eb91d377bce3
  github.com/google/btree                    f06e229e679911bb31a04e07ac891115822e37c3
  github.com/julienschmidt/httprouter        77366a47451a56bb3ba682481eed85b64fea14e8
  github.com/kr/pretty                       add1dbc86daf0f983cd4a48ceb39deb95c729b67
  github.com/kr/text                         bb797dc4fb8320488f47bf11de07a733d7233e1f
  github.com/lib/pq                          3cd0097429be7d611bb644ef85b42bfb102ceea4
  github.com/mattn/go-isatty                 56b76bdf51f7708750eac80fa38b952bb9f32639
  github.com/mattn/go-runewidth              d6bea18f789704b5f83375793155289da36a3c7f
  github.com/olekukonko/tablewriter          cca8bbc0798408af109aaaa239cbd2634846b340
  github.com/opentracing/basictracer-go      8037d926355bd3bc9b503652580a71a030995575
  github.com/opentracing/opentracing-go      01498abd158dfdbe8e251856bc7d14cb0f046fa3
  github.com/rcrowley/go-metrics             eeba7bd0dd01ace6e690fa833b3f22aaec29af43
  github.com/russross/blackfriday            b43df972fb5fdf3af8d2e90f38a69d374fe26dd0
  github.com/satori/go.uuid                  f9ab0dce87d815821e221626b772e3475a0d2749
  github.com/shurcooL/sanitized_anchor_name  10ef21a441db47d8b13ebcc5fd2310f636973c77
  github.com/spf13/cobra                     4c05eb1145f16d0e6bb4a3e1b6d769f4713cb41f
  github.com/spf13/pflag                     7f60f83a2c81bc3c3c0d5297f61ddfa68da9d3b7
  github.com/VividCortex/ewma                c34099b489e4ac33ca8d8c5f9d29d6eeaf69f2ed
  golang.org/x/crypto                        b8a0f4bb4040f8d884435cff35b9691e362cf00c
  golang.org/x/net                           e45385e9b226f570b1f086bf287b25d3d4117776
  golang.org/x/text                          5ee49cfe751141f8017047bab800d1f528ee3be1
  google.golang.org/grpc                     ecd00d52ac82a2cd37e17bf91d9c6ca228b71745
  gopkg.in/inf.v0                            3887ee99ecf07df5b447e9b00d9c0b2adaa9f3e4
  gopkg.in/yaml.v1                           9f9df34309c04878acc86042b16630b0f696e1de
~~~