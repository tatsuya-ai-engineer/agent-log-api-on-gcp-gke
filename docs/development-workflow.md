# 開発運用

このリポジトリでは、Spec Driven Developmentを基本にする。
実装はSpecから始め、Issue、PR、検証結果をSpecへつなげる。

## 管理単位

**Spec**：作るものの仕様と受け入れ条件を定義する。

**Epic**：複数のIssueをまとめる中規模の開発テーマを表す。

**Milestone**：リリースまたは学習到達点を表す。

**Issue**：一つのPRで閉じられる作業単位を表す。

**PR**：Issueに対する実装、検証、ドキュメント更新をまとめる。

**ADR**：後から読み返す価値がある技術判断を記録する。

## Spec Driven Development

実装前に、該当するSpecへ目的、範囲、受け入れ条件を書く。
既存Specで表現できる変更なら、そのSpecを更新する。
新しい機能単位なら `specs/` に小さなSpecを追加する。

Specを新規作成または更新したら、コード実装へ進む前にユーザー承認を得る。
承認依頼では、目的、範囲、対象外、受け入れ条件、関連Issue、関連Epic、関連Milestoneを提示する。
ユーザーの明示承認を得るまでは、コード実装へ進まない。
既存Specで十分な場合も、関連Specと作業範囲を提示して承認を得る。

実装中に仕様が変わった場合、コードだけを変えずにSpecも更新する。
その変更が技術選定や責務分割に関わる場合はADRを追加する。

新しい開発セッションでは、最初に `docs/session-handoff.md` を読む。
Milestone、Epic、次のIssue、サービス境界、必読ファイルが変わった場合は、作業の最後に `docs/session-handoff.md` を更新する。

## Issueの粒度

Issueは、1日から2日で完了できる大きさにする。
Issueが複数のサービス、Kubernetes manifest、GCP設定を同時に変える場合は、原則として分割する。

Issueには、背景、やること、完了条件、変更予定、関連Spec、関連Epic、関連Milestoneを書く。
完了条件が曖昧なIssueには着手しない。

## Epicの粒度

Epicは、中規模な開発テーマを表すIssueとして作る。
Epic本文には、目的、対象外、子Issue、完了条件を置く。
子IssueはEpicにリンクする。

最初のEpicは次の単位で管理する。

| Epic | 内容 | Milestone |
|---|---|---|
| EPIC-001 Local API MVP | ローカルでAgentログAPIを動かす | `v0.1.0` |
| EPIC-002 Containerization | APIをDockerで実行できるようにする | `v0.2.0` |
| EPIC-003 Local Kubernetes | ローカルKubernetesでAPIを動かす | `v0.3.0` |
| EPIC-004 GKE Autopilot Deploy | GKE Autopilotへデプロイする | `v0.4.0` |
| EPIC-005 Ops Readiness | ConfigMap、Secret、Probe、Runbookを整える | `v0.5.0` |

## Kanban

GitHub Projectsを使う場合、列は最初は次の6つにする。

| 列 | 意味 |
|---|---|
| Backlog | いつか必要だが、まだ着手条件が揃っていない |
| Ready | Specと完了条件が揃い、着手できる |
| In Progress | 実装またはドキュメント作業中 |
| In Review | PRレビュー中 |
| Blocked | 外部要因で進められない |
| Done | PRがmergeされ、完了条件を満たした |

## Definition of Ready

Issueは、次の条件を満たしてから `Ready` に移す。

- 関連Specが明記されている。
- Specが作成または更新済みである。
- Specまたは作業範囲についてユーザー承認が記録されている。
- 完了条件がチェックリストで書かれている。
- 変更対象が `app`、`docs`、`k8s`、`deploy`、`tests` のどれかに分類されている。
- Secret値や本番認証情報を扱わない方針が明記されている。

## Definition of Done

Issueは、次の条件を満たしてから `Done` に移す。

- PRがmergeされている。
- 完了条件を満たしている。
- 必要なテストまたは動作確認が記録されている。
- Spec、README、Runbook、ADRのうち、影響を受けるドキュメントが更新されている。
- 必要に応じて `docs/session-handoff.md` が更新されている。

## BranchとPR

`main` は安定版として扱う。
作業は `feature/*`、`docs/*`、`infra/*`、`fix/*` のいずれかで行う。

PRには、関連Issue、関連Spec、確認したこと、未確認のことを書く。
API仕様、Kubernetes manifest、GCP設定を変えるPRでは、該当ドキュメントも同じPRで更新する。

ブランチ戦略の詳細は `docs/branch-strategy.md` に置く。
レビュー観点の詳細は `docs/review-guidelines.md` に置く。
