# ブランチ戦略

このリポジトリでは、軽量なtrunk-based developmentを採用する。
`main` を常に動く状態に保ち、短命ブランチからPRで取り込む。

## 基本方針

`main` は安定版として扱う。
通常の開発では、`main` へ直接pushしない。

`develop` ブランチはPhase 1では作らない。
開発人数が増え、複数の機能をまとめて検証する必要が出た場合に再検討する。

作業ブランチは、1つのIssueまたは1つの小さなSpec変更に対応させる。
複数のEpicをまたぐブランチは作らない。

## ブランチ名

| Prefix | 用途 | 例 |
|---|---|---|
| `feature/` | 機能追加 | `feature/dev-003-health-api` |
| `fix/` | 不具合修正 | `fix/health-response-status` |
| `docs/` | ドキュメント更新 | `docs/branch-strategy` |
| `infra/` | Kubernetes、GCP、CI/CD変更 | `infra/add-k8s-service` |
| `test/` | テスト追加または修正 | `test/api-basic-cases` |
| `chore/` | 開発補助、整理、設定 | `chore/update-templates` |
| `spike/` | 調査用の一時作業 | `spike/pubsub-client` |

`spike/` は調査用である。
調査結果を本線に入れる場合は、必要な差分だけを通常のブランチへ移す。

## PRの単位

PRは、レビューできる大きさに保つ。
1つのPRで、アプリ実装、Kubernetes manifest、GCP設定をまとめて大きく変えない。

ただし、動作確認に必要な最小限のドキュメント更新は同じPRに含める。
API仕様を変えるPRでは、関連Specとテストも同じPRで更新する。

## マージ方式

通常のPRはSquash mergeで `main` に取り込む。
PR単位で意味のある履歴を残し、途中の試行錯誤コミットを `main` に残さないためである。

例外として、複数コミットの履歴自体に意味がある変更ではMerge commitを使ってよい。
この例外は、リリース準備や大きな移行作業に限る。

Rebase mergeは標準にはしない。
履歴は直線的になるが、PR単位の境界が見えにくくなるためである。

## マージ条件

PRは、次の条件を満たしてからmergeする。

- 関連Issue、関連Spec、MilestoneがPR本文に書かれている。
- Definition of Doneを満たしている。
- 必要なテストまたは動作確認結果がPRに記録されている。
- 未解決のレビューコメントが残っていない。
- Secret値、個人情報、本番認証情報を含んでいない。
- API、schema、Kubernetes、GCPに影響がある場合、該当ドキュメントが更新されている。

Phase 1では、作業者が1人の場合でもセルフレビューをPR本文に残す。
複数人で作業する場合は、少なくとも1人の承認を得てからmergeする。

## 保護ルール

GitHub上では、`main` に次の保護を設定する。

- Pull request経由の更新を必須にする。
- 1件以上のレビュー承認を必須にする。
- CIを導入した後は、必須チェックを設定する。
- Force pushを禁止する。
- Branch deletionを禁止する。

Phase 1の初期だけは、repo初期化のために直接反映を許容した。
以後の開発はPR経由に戻す。

## タグ

Milestoneが完了したら、`v0.1.0` のようなタグを切る。
タグは、README、Spec、テスト、動作確認が揃った時点で作成する。

タグを切る前に、`docs/roadmap.md` の状態を更新する。
