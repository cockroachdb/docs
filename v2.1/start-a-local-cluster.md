---
title: Start a Local Cluster (Insecure)
summary: Run an insecure multi-node CockroachDB cluster locally with each node listening on a different port.
toc: true
toc_not_nested: true
asciicast: true
---

<div class="filters filters-big clearfix">
    <a href="start-a-local-cluster.html"><button class="filter-button current"><strong>Insecure</strong></button></a>
    <a href="secure-a-cluster.html"><button class="filter-button">Secure</button></a>
</div>

[CockroachDB를 설치](install-cockroachdb.html)했다면, 인시큐어한 멀티노드 클러스터를 로컬에서 실행하는 것은 간단합니다.

{{site.data.alerts.callout_info}}
단일 호스트에서 여러 노드를 실행하는 것은 CockroachDB를 테스트하는 데 유용하지만 프로덕션 배포에는 권장되지 않습니다. 물리적으로 분산된 클러스터를 프로덕션 환경에서 실행하려면, [수동배포](manual-deployment.html) 또는 [오케스트레이션 배포](orchestration.html)를 참조하십시오.
{{site.data.alerts.end}}


## 시작하기 전에

[CockroachDB 설치](install-cockroachdb.html)가 필요합니다.

<!-- TODO: Update the asciicast
Also, feel free to watch this process in action before going through the steps yourself. Note that you can copy commands directly from the video, and you can use **<** and **>** to go back and forward.

<asciinema-player class="asciinema-demo" src="asciicasts/start-a-local-cluster.json" cols="107" speed="2" theme="monokai" poster="npt:0:22" title="Start a Local Cluster"></asciinema-player>
-->

## 1단계. 첫 노드를 실행

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start --insecure --listen-addr=localhost
~~~

~~~
CockroachDB node starting at 2018-09-13 01:25:57.878119479 +0000 UTC (took 0.3s)
build:               CCL {{page.release_info.version}} @ {{page.release_info.build_time}}
webui:               http://localhost:8080
sql:                 postgresql://root@localhost:26257?sslmode=disable
client flags:        cockroach <client cmd> --host=localhost:26257 --insecure
logs:                cockroach/cockroach-data/logs
temp dir:            cockroach-data/cockroach-temp998550693
external I/O path:   cockroach-data/extern
store[0]:            path=cockroach-data
status:              initialized new cluster
clusterID:           2711b3fa-43b3-4353-9a23-20c9fb3372aa
nodeID:              1
~~~

이 명령어는 인시큐어 모드의 노드를 실행합니다. 대부분은 [`cockroach start`](start-a-node.html) 기본값을 사용합니다.

- `--insecure` 플래그를 사용하면 통신에 보안처리를 하지 않습니다.
- 순수하게 로컬 클러스터이면, `--listen-addr=localhost`는 노드가 오직 `localhost`만 받으며, 내부 클라이언트 트래픽은 포트(`26257`), 운영 UI의 HTTP 요청은(`8080`)을 사용합니다.
- 노드 데이터는 `cockroach-data` 디렉토리에 저장됩니다.
- [standard output](start-a-node.html#standard-output) CockroachDB 버전, Admin UI URL, SQL URL 등의 유용한 세부정보를 보여줍니다.

## 2단계. 클러스터에 노트 추가하기

이 시점에, 클러스터는 활성화되어 작동중입니다. 하나의 노드만 있어도 SQL 클라이언트를 연결하고 데이터베이스 구축을 시작할 수 있습니다. 그러나 실제 환경에서는 최소 3개 이상의 노드가 있어야 CockroachDB의 [자동 레플리케이션](demo-data-replication.html), [리밸런싱](demo-automatic-rebalancing.html), [장애 내성](demo-fault-tolerance-and-recovery.html) 기능을 사용할 수 있습니다. 이 단계는 실제 배포를 로컬에서 시뮬레이션합니다.

새 터미널에서 두번째 노드를 추가하십시오.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node2 \
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
--join=localhost:26257
~~~

새 터미널에서 세번째 노드를 추가하십시오.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node3 \
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--join=localhost:26257
~~~

이 명령어의 주요 차이점은 `--join`로 첫 번째 노드의 주소와 포트를 지정하여 새 노드를 클러스터에 연결하는 것입니다. 동일한 시스템이서 모든 노드가 실행되므로, `--store`, `--listen-addr`, `--http-addr`로 다른 노드가 사용하지 않는 위치와 포트를 설정합니다. 실제 환경에서는 각 노드가 다른 시스템에 있으므로 기본값을 사용할 수 있습니다.

## 3단계. 클러스터 테스트

이제 3개의 노드로 확장되었습니다. 어떤 노드라도 클러스터를 사용하기 위한 SQL 게이트웨이로 사용가능합니다.이것을 보기 위해 새 터미널에서 [빌트인 SQL 클라이언트](use-the-built-in-sql-client.html)로 노드 1에 연결합니다.

{{site.data.alerts.callout_info}}
SQL 클라이언트는 `cockroach` 바이너리에 내장되어 있으므로 추가 설치는 필요하지 않습니다.
{{site.data.alerts.end}}

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26257
~~~

기본 [CockroachDB SQL](learn-cockroachdb-sql.html) 몇가지를 실행해봅시다.

{% include copy-clipboard.html %}
~~~ sql
> CREATE DATABASE bank;
~~~

{% include copy-clipboard.html %}
~~~ sql
> CREATE TABLE bank.accounts (id INT PRIMARY KEY, balance DECIMAL);
~~~

{% include copy-clipboard.html %}
~~~ sql
> INSERT INTO bank.accounts VALUES (1, 1000.50);
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

노드 1의 SQL 클라이언트에서 나옵니다.

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

노드 2의 SQL 클라이언트에 연결합니다. 이번에는 포트를 지정하여야 합니다.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26258
~~~

{{site.data.alerts.callout_info}}
실제 환경에서는 모든 노드가 기본 포트 `26257`을 사용하기 때문에 `--host`를 설정할 필요가 없습니다.
{{site.data.alerts.end}}

동일한 `SELECT` 쿼리를 실행합니다.

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

보시다시피, 노드 1과 노드 2의 SQL 게이트웨이는 동일하게 동작합니다.

노드 2의 SQL 클라이언트에서 나옵니다.

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

## 4단계. 클러스터 모니터링

브라우저의 `http://localhost:8080` 또는, 노드 시작 시 표준 출력에서 `admin` 필드의 주소를 이용하여 [운영 UI](admin-ui-overview.html)에 접근할 수 있습니다. 그런 다음 왼쪽의 네비게이션 바에서 **Metrics**을 클릭합니다.

<img src="{{ 'images/v2.1/admin_ui_overview_dashboard.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

앞서 언급했듯이 CockroachDB는 백그라운드에서 자동으로 데이터를 복제합니다. 이전 단계에서 기록한 데이터가 성공적으로 복제되었는지 확인하려면 아래로 스크롤하여 **Replicas per Node**를 확인하십시오.

<img src="{{ 'images/v2.1/admin_ui_replicas_per_node.png' | relative_url }}" alt="CockroachDB Admin UI" style="border:1px solid #eee;max-width:100%" />

각 노느의 레플리카 카운트가 동일한 것은, 클러스터에 있는 모든 데이터가 3회 복제되었음(기본값)을 나타냅니다.

{{site.data.alerts.callout_info}}
단일 시스템에서 여로 노드를 실행하는 경우 용량 지표가 잘못될 수 있습니다. 자세한 내용은 [제한사항](known-limitations.html#available-capacity-metric-in-the-admin-ui)을 참조하십시오.
{{site.data.alerts.end}}

{{site.data.alerts.callout_success}}
CockroachDB의 자동 레플리케이션, 리밸런싱, 장애 내성 등에 더 자세히 알고 싶으면, [레플리케이션](demo-data-replication.html), [리밸런싱](demo-automatic-rebalancing.html), [장애 내성](demo-fault-tolerance-and-recovery.html)을 참조하십시오.
{{site.data.alerts.end}}

## 5단계. 클러스터 중지

테스트 클러스터를 마치려면 첫 번째 노드를 실행하는 터미널로 전환하여 **CTRL-C**를 누릅니다.

현재 2개의 노드가 온라인 상태여서 대부분의 복제본을 사용할 수 있으므로 클러스터가 계속 동작합니다. 클러스터에서 이 `실패`를 허용했는지 확인화려면 SQL 쉘을 노드 2 또는 3에 연결하십시오. 사용중인 터미널 또는 새 터미널에서 할 수 있습니다.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach sql --insecure --host=localhost:26258
~~~

{% include copy-clipboard.html %}
~~~ sql
> SELECT * FROM bank.accounts;
~~~

~~~
+----+---------+
| id | balance |
+----+---------+
|  1 |  1000.5 |
+----+---------+
(1 row)
~~~

SQL 쉘에서 나옵니다.

{% include copy-clipboard.html %}
~~~ sql
> \q
~~~

터미널로 전환하여 **CTRL-C**를 눌러 노드 2, 3을 중지합니다.

{{site.data.alerts.callout_success}}
노드 3의 경우 종료 프로세스가 더 오래 걸리고(약 1분) 노드가 강제로 종료됩니다. 3개 노드 중 1개만 남아 있으면 대부분의 복제본을 사용할 수 없으므로 클러스터가 더 이상 동작하지 않습니다. 종료 프로세스를 더 빨리 하려면 **CTRL-C**를 한번 더 누르십시오.
{{site.data.alerts.end}}

클러스터를 다시 시작할 계획이 없는 경우 노드의 데이터 저장소를 제거할 수 있습니다.

{% include copy-clipboard.html %}
~~~ shell
$ rm -rf cockroach-data node2 node3
~~~

## 6단계 클러스터 재시작

클러스터를 추가 테스트에 사용하려면 3개 노드 중 2개를 저장소 데이터와 함께 재시작해야 합니다.

첫 번째 노드를 `cockroach-data/`의 상위 디렉토리에서 다시 시작합니다.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--host=localhost:26257
~~~

{{site.data.alerts.callout_info}}
단 하나의 노드만 온라인이 되면 클러스터가 아직 동작하지 않으므로 두 번 째 노드를 다시 시작할 때까지 위 명령의 응답을 볼 수 없습니다.
{{site.data.alerts.end}}

새 터미널을 열고 두 번째 노드를 `node2/`의 상위 디렉토리에서 다시 시작합니다.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node2 \
--listen-addr=localhost:26258 \
--http-addr=localhost:8081 \
--join=localhost:26257
~~~

새 터미널을 열고 세 번째 노드를 `node3/`의 상위 디렉토리에서 다시 시작합니다.

{% include copy-clipboard.html %}
~~~ shell
$ cockroach start \
--insecure \
--store=node3 \
--listen-addr=localhost:26259 \
--http-addr=localhost:8082 \
--join=localhost:26257
~~~

## 다음은?

- [CockroachDB SQL](learn-cockroachdb-sql.html)과 [빌트인 SQL client](use-the-built-in-sql-client.html)에 대해 더 알아보기
- 선호하는 언어를 사용하여 [클라이언트 드라이버 설치](install-client-drivers.html)
- [애플리케이션을 CockroachDB와 만들기](build-an-app-with-cockroachdb.html)
- 자동 레플리케이션, 리밸런싱, 장애 내성, 클라우드 통합과 같은 [CockroachDB 코어 기능](demo-data-replication.html) 둘러보기.
