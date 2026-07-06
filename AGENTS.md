# Agent Instructions

このリポジトリで作業するエージェントは、最初に `docs/session-handoff.md` を読む。
次に、作業内容に応じて `README.md`、`docs/roadmap.md`、該当する `specs/`、`services/*/SPEC.md` を読む。

実装はSpec Driven Developmentで進める。
仕様変更が発生した場合は、コードだけを変えずにSpecも更新する。

ブランチ戦略は `docs/branch-strategy.md` に従う。
レビュー観点は `docs/review-guidelines.md` に従う。

PRをmergeした後、Milestone、Epic、次のIssue、サービス境界、必読ファイルが変わった場合は `docs/session-handoff.md` を更新する。

Secret値、API Key、個人情報、認証トークンはcommitしない。
