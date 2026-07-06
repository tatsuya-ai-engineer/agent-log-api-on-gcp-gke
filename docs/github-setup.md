# GitHub運用セットアップ

このファイルは、GitHub上に作るMilestone、Project、Label、初期Issueを記録する。
`gh` の認証が有効になったら、この内容をGitHubへ反映する。

## Milestones

| Name | Description |
|---|---|
| `v0.1.0 Local API` | ローカル環境でAgentログAPIを動かす |
| `v0.2.0 Docker` | APIをDockerで起動できるようにする |
| `v0.3.0 Local Kubernetes` | ローカルKubernetesでAPIを動かす |
| `v0.4.0 GKE Autopilot` | GKE Autopilotへデプロイする |
| `v0.5.0 Ops Readiness` | ConfigMap、Secret、Probe、Runbookを整える |

## Project Columns

| Column | Meaning |
|---|---|
| Backlog | いつか必要だが、まだ着手条件が揃っていない |
| Ready | Specと完了条件が揃い、着手できる |
| In Progress | 実装またはドキュメント作業中 |
| In Review | PRレビュー中 |
| Blocked | 外部要因で進められない |
| Done | PRがmergeされ、完了条件を満たした |

## Labels

| Label | Meaning |
|---|---|
| `type:epic` | 中規模な開発テーマ |
| `type:feature` | 機能追加 |
| `type:bug` | 不具合 |
| `type:docs` | ドキュメント |
| `type:infra` | GCPまたはKubernetes変更 |
| `type:test` | テスト |
| `type:architecture` | ADR対象の技術判断 |
| `type:security` | セキュリティ |
| `type:ops` | 運用と監視 |
| `priority:must` | 必須 |
| `priority:should` | 重要 |
| `priority:could` | 後でよい |
| `phase:1-mvp` | Phase 1対象 |
| `phase:2-beta` | Phase 2対象 |
| `phase:3-commercial` | Phase 3対象 |

## Initial Epic

Title:

```text
EPIC-001: Local API MVP
```

Body:

```md
## 目的

ローカル環境でAgentログAPIを動かす。

## 範囲

- `GET /health`
- `POST /logs`
- `GET /logs`
- API基本テスト
- READMEの起動手順

## 対象外

- Docker
- Kubernetes
- GCP
- API Key認証
- 永続化

## 子Issue

- [ ] DEV-003 FastAPI雛形作成
- [ ] DEV-004 `POST /logs` 実装
- [ ] DEV-005 `GET /logs` 実装
- [ ] TEST-001 API基本テスト追加
- [ ] DOC-001 READMEにローカルAPI起動手順を書く

## 完了条件

- [ ] ローカルでAPIを起動できる
- [ ] `/health` がHTTP 200を返す
- [ ] `POST /logs` でログを保存できる
- [ ] `GET /logs` で保存済みログを確認できる
- [ ] 基本テストが通る

## 関連

- Spec: `specs/v0.1.0-local-api.md`
- Milestone: `v0.1.0 Local API`
```

## Initial Issues

| Issue | Labels | Milestone |
|---|---|---|
| DEV-003 FastAPI雛形作成 | `type:feature`, `priority:must`, `phase:1-mvp` | `v0.1.0 Local API` |
| DEV-004 `POST /logs` 実装 | `type:feature`, `priority:must`, `phase:1-mvp` | `v0.1.0 Local API` |
| DEV-005 `GET /logs` 実装 | `type:feature`, `priority:must`, `phase:1-mvp` | `v0.1.0 Local API` |
| TEST-001 API基本テスト追加 | `type:test`, `priority:should`, `phase:1-mvp` | `v0.1.0 Local API` |
| DOC-001 READMEにローカルAPI起動手順を書く | `type:docs`, `priority:should`, `phase:1-mvp` | `v0.1.0 Local API` |
