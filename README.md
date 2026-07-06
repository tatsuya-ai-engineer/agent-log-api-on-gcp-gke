# Agent Log API on GCP / GKE

AI Agentの操作ログを受け取る小さなAPIを作り、KubernetesとGoogle Cloudを実装しながら学ぶためのリポジトリです。
将来的には、AI Agent観測、ログ正規化、監査ログ可視化、ポリシーチェックの土台に育てます。

## 目的

このプロジェクトの最初の目的は、商用SaaSを一気に作ることではありません。
`POST /logs` でAgent操作ログを受け取り、Kubernetes上で安全に動かし、GCPの運用と監視まで説明できる状態にすることです。

## MVPスコープ

- `GET /health` でヘルスチェックを返す。
- `POST /logs` でAgent操作ログを受け取る。
- `GET /logs` で受信済みログを確認する。
- Dockerイメージとしてビルドできるようにする。
- KubernetesのDeploymentとServiceで起動できるようにする。
- ConfigMap、Secret、liveness probe、readiness probeを段階的に追加する。

## 想定ログ

```json
{
  "agent_id": "agent-001",
  "actor_user_id": "user-001@example.com",
  "tool_name": "gmail.search",
  "action": "read_email",
  "status": "success"
}
```

## 想定構成

Phase 1では、FastAPIアプリをDocker化し、ローカルKubernetesまたはGKE Autopilot上で動かします。
ログは最初はメモリとアプリログに出します。
Cloud Loggingでは、Podの標準出力に出たログを確認します。

```text
Client
  -> agent-log-api
  -> stdout
  -> kubectl logs / Cloud Logging
```

Phase 2以降では、Pub/SubとBigQueryを使ってログ受信と分析基盤を分離します。

```text
Client / Agent
  -> agent-log-api
  -> Pub/Sub
  -> log-normalizer-worker
  -> BigQuery
```

## リポジトリ構成予定

```text
.
├── README.md
├── SPEC.md
├── docs/
├── app/
├── k8s/
├── deploy/
├── scripts/
└── .github/
```

## 起動方法

現時点では、リポジトリ初期化と仕様配置まで完了しています。
アプリ実装後は、次のような手順で確認できる状態を目指します。

```sh
cd app
pip install -r requirements.txt
uvicorn main:app --reload
```

```sh
curl http://localhost:8000/health
```

```sh
curl -X POST http://localhost:8000/logs \
  -H "Content-Type: application/json" \
  -d '{"agent_id":"agent-001","actor_user_id":"user-001@example.com","tool_name":"gmail.search","action":"read_email","status":"success"}'
```

```sh
curl http://localhost:8000/logs
```

## 開発フェーズ

| Version | 内容 |
|---|---|
| `v0.1.0` | ローカルAPI完成 |
| `v0.2.0` | Docker化 |
| `v0.3.0` | ローカルKubernetes対応 |
| `v0.4.0` | GKE Autopilot対応 |
| `v0.5.0` | ConfigMap、Secret、Probe対応 |

## ドキュメント

- [SPEC.md](./SPEC.md): 開発仕様。
- [docs/development-workflow.md](./docs/development-workflow.md): SDD、Epic、Milestone、Kanban、PR運用。
- [docs/branch-strategy.md](./docs/branch-strategy.md): ブランチ戦略、マージ方式、保護ルール。
- [docs/review-guidelines.md](./docs/review-guidelines.md): マージレビュー観点。
- [docs/roadmap.md](./docs/roadmap.md): MilestoneとEpicの現在地。
- [docs/github-setup.md](./docs/github-setup.md): GitHub上に作るMilestone、Project、Label、初期Issue。
- [specs/v0.1.0-local-api.md](./specs/v0.1.0-local-api.md): ローカルAPI完成までの詳細Spec。
- [services/README.md](./services/README.md): マイクロサービス境界。
- [services/agent-log-api/SPEC.md](./services/agent-log-api/SPEC.md): `agent-log-api` のサービスSpec。
- `docs/architecture.md`: アーキテクチャ説明予定。
- `docs/runbook.md`: 運用手順予定。
- `docs/security.md`: セキュリティ方針予定。

## 開発運用

このリポジトリでは、Spec Driven Developmentを基本にします。
実装前に該当Specへ目的、範囲、受け入れ条件を書き、IssueとPRをSpecに紐づけます。

中規模の開発状態は、EpicとMilestoneで管理します。
日々の作業状態は、GitHub ProjectsのKanbanで管理する想定です。

最初の開発対象は `v0.1.0 Local API` です。
詳細は [specs/v0.1.0-local-api.md](./specs/v0.1.0-local-api.md) を参照します。

## 運用ルール

- 仕様変更は `SPEC.md` に反映する。
- アーキテクチャ判断はADRに残す。
- Secret値はGitに含めない。
- MVPでは、完璧さより動くことと説明できることを優先する。
