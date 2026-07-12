# Roadmap

このロードマップは、中規模な開発状態を追うための管理表である。
詳細な仕様は `SPEC.md` と `specs/` に置く。

## 現在の状態

| 項目 | 状態 |
|---|---|
| Repository | Git初期化済み |
| Remote | `origin` 設定済み |
| Product Spec | `SPEC.md` 配置済み |
| README | 初版作成済み |
| App | `GET /health`、`POST /logs`、`GET /logs` 実装済み |
| Docker | 未実装 |
| Kubernetes | 未実装 |
| GCP | 未実装 |

## Milestones

| Milestone | 目的 | 完了条件 |
|---|---|---|
| `v0.1.0` | ローカルAPI完成 | `/health`、`POST /logs`、`GET /logs` がローカルで動く |
| `v0.2.0` | Docker化 | image buildとcontainer起動でAPIを確認できる |
| `v0.3.0` | ローカルKubernetes対応 | Deployment、Service、port-forwardでAPIを確認できる |
| `v0.4.0` | GKE Autopilot対応 | GKE上でAPIが動き、Cloud Loggingでログを確認できる |
| `v0.5.0` | 運用初期対応 | ConfigMap、Secret、Probe、Runbookが揃う |
| `v0.7.0` | 非同期ログ基盤 | Pub/Subとworkerで受信と処理を分離できる |
| `v0.8.0` | 分析基盤 | BigQueryに正規化ログを保存し、SQLで確認できる |

## Epics

| Epic | 目的 | 主な成果物 | 状態 |
|---|---|---|---|
| EPIC-001 Local API MVP | ローカルでAgentログAPIを動かす | FastAPI、基本テスト、README更新 | Ready候補 |
| EPIC-002 Containerization | APIをDockerで起動する | Dockerfile、docker build手順 | Backlog |
| EPIC-003 Local Kubernetes | ローカルKubernetesで起動する | Deployment、Service、port-forward手順 | Backlog |
| EPIC-004 GKE Autopilot Deploy | GKEへデプロイする | Artifact Registry、GKE、Cloud Logging確認 | Backlog |
| EPIC-005 Ops Readiness | 運用の芽を入れる | ConfigMap、Secret、Probe、Runbook | Backlog |

## 次に作るIssue

`v0.1.0` では、次のIssueを作る。

- DEV-004 `POST /logs` 実装。
- DEV-005 `GET /logs` 実装。
- TEST-001 API基本テスト追加。
- DOC-001 READMEにローカルAPI起動手順を書く。

## 依存関係

`v0.1.0` が完了してから `v0.2.0` に進む。
Docker化前にAPIの動作が安定していないと、コンテナ起因の問題とアプリ起因の問題を切り分けにくい。

`v0.2.0` が完了してから `v0.3.0` に進む。
Kubernetesではコンテナイメージを起動単位にするため、Docker化が先に必要になる。

`v0.3.0` が完了してから `v0.4.0` に進む。
ローカルKubernetesでDeploymentとServiceを理解してからGKEへ移す。
