# セッションハンドオフ

このファイルは、記憶がない新しい開発セッションが最初に読む入口である。
長い仕様はここに重複させず、現在地、次の作業、読む順番、更新ルールだけを置く。

## 現在の状態

| 項目 | 状態 |
|---|---|
| Repository | GitHub反映済み |
| Local branch | `main` が `origin/main` を追跡 |
| App | FastAPI雛形と `GET /health` 実装済み |
| Docker | 未実装 |
| Kubernetes | 未実装 |
| GCP | 未実装 |
| Current milestone | `v0.1.0 Local API` |
| Current epic | `EPIC-001 Local API MVP` |

## 最初に読むファイル

新しいセッションは、次の順番で読む。

1. `README.md`
2. `docs/session-handoff.md`
3. `docs/roadmap.md`
4. `specs/v0.1.0-local-api.md`
5. `services/agent-log-api/SPEC.md`
6. `docs/development-workflow.md`
7. `docs/branch-strategy.md`
8. `docs/review-guidelines.md`

全体方針を確認する必要がある場合は、`SPEC.md` も読む。

## 次の作業

次の開発は `v0.1.0 Local API` から始める。
次に扱うIssue候補は次の通りである。

- DEV-004 `POST /logs` 実装。
- DEV-005 `GET /logs` 実装。
- TEST-001 API基本テスト追加。
- DOC-001 READMEにローカルAPI起動手順を書く。

`services/agent-log-api/` 配下にFastAPIアプリを置いている。
`GET /health`、`POST /logs`、`GET /logs` の受け入れ条件は `specs/v0.1.0-local-api.md` に従う。

## 開発の進め方

作業はSpecから始める。
Issueまたは作業内容が曖昧な場合は、先にSpecかIssue案を更新する。
Specを新規作成または更新した場合、または既存Specで作業範囲を確定する場合は、コード実装へ進む前にユーザー承認を得る。

ブランチは `main` から切る。
ブランチ名は `docs/branch-strategy.md` に従う。

PRを作る前に、`docs/review-guidelines.md` に沿ってセルフレビューする。
PR本文では、関連Issue、関連Spec、Milestone、確認したこと、未確認のことを書く。

## 更新ルール

新しいセッションを始めたら、このファイルを読んで現在地を確認する。
機能開発を始める前に、必要なら「現在の状態」と「次の作業」を更新する。

PRをmergeした後、次のいずれかに該当する場合は、このファイルを更新する。

- Milestoneの状態が変わった。
- Epicの状態が変わった。
- 次に着手するIssueが変わった。
- サービス境界や主要ディレクトリが変わった。
- 新しいセッションが最初に読むべきファイルが増えた。

このファイルは、詳細仕様の置き場ではない。
仕様の本文は `SPEC.md`、`specs/`、`services/*/SPEC.md`、ADRに置く。

## GitHub運用

GitHub上のMilestone、Project、Label、初期Issueは `docs/github-setup.md` に記録している。
GitHub側を更新した場合は、必要に応じてこのファイルの「現在の状態」も更新する。

## 注意

Secret値、API Key、個人情報、認証トークンはcommitしない。
例示が必要な場合は、ダミー値または `*.example.*` を使う。
