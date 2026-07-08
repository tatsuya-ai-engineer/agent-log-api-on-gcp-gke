# Implementation Index

このファイルは、実装、修正、テスト追加、インフラ変更、ドキュメント変更など、リポジトリに変更を加える前に確認する目次である。
詳細仕様はここに重複させず、作業内容ごとに読むべきファイルへの導線だけを置く。

## 必ず確認する順番

変更作業を始める前に、次の順番で確認する。

1. `docs/session-handoff.md`
2. `docs/roadmap.md`
3. 作業対象の `specs/*.md`
4. 作業対象サービスの `services/*/SPEC.md`
5. `docs/development-workflow.md`
6. `docs/branch-strategy.md`
7. `docs/review-guidelines.md`

全体方針や将来構成に影響する場合は、`SPEC.md` も確認する。
サービス境界に影響する場合は、`services/README.md` も確認する。

## 作業タイプ別の参照先

| 作業タイプ | 主な参照先 |
|---|---|
| API実装 | `specs/v0.1.0-local-api.md`, `services/agent-log-api/SPEC.md` |
| APIスキーマ変更 | `SPEC.md`, `specs/v0.1.0-local-api.md`, `services/agent-log-api/SPEC.md` |
| サービス境界変更 | `services/README.md`, `services/*/SPEC.md`, `SPEC.md` |
| Docker変更 | `SPEC.md`, `docs/roadmap.md`, 作業対象サービスの `SPEC.md` |
| Kubernetes変更 | `SPEC.md`, `docs/roadmap.md`, `docs/review-guidelines.md` |
| GCP変更 | `SPEC.md`, `docs/roadmap.md`, `docs/review-guidelines.md` |
| テスト追加 | 作業対象の `specs/*.md`, 作業対象サービスの `SPEC.md` |
| README更新 | `README.md`, `docs/session-handoff.md`, 関連する `specs/*.md` |
| 開発運用変更 | `docs/development-workflow.md`, `docs/branch-strategy.md`, `docs/review-guidelines.md` |
| GitHub運用変更 | `docs/github-setup.md`, `docs/development-workflow.md` |

## 現在の主要Spec

| 対象 | ファイル | 位置づけ |
|---|---|---|
| 全体仕様 | `SPEC.md` | プロダクト仮説、全体構成、GCP/Kubernetes方針 |
| 現行Milestone | `specs/v0.1.0-local-api.md` | `v0.1.0 Local API` の範囲と受け入れ条件 |
| サービス境界 | `services/README.md` | 将来のマイクロサービス境界 |
| agent-log-api | `services/agent-log-api/SPEC.md` | `agent-log-api` の責務、API、非責務 |

## 作業前チェック

- 現在のMilestone、Epic、次のIssueを `docs/session-handoff.md` で確認した。
- 作業対象のSpecとサービスSpecを確認した。
- 既存Specで作業範囲を説明できるか確認した。
- Specを新規作成または更新する場合は、コード実装前にユーザー承認を得る。
- ブランチ名は `docs/branch-strategy.md` に従う。
- Secret値、API Key、個人情報、認証トークンを扱わない方針を確認した。

## 作業後チェック

- 受け入れ条件に対するテストまたは動作確認を行った。
- API、schema、Kubernetes、GCP、サービス境界に影響する変更では、関連Specを更新した。
- README、Runbook、ADR、ハンドオフの更新が必要か確認した。
- PR前に `docs/review-guidelines.md` に沿ってセルフレビューした。
