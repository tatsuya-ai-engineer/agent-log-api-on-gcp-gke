# SPEC: Agent Log API on GCP / GKE

作成日: 2026-07-06  
想定リポジトリ名: `agent-log-api-on-gcp-gke`  
目的: Kubernetes と GCP を実装しながら学びつつ、将来の AI Agent 観測・ログ正規化・セキュリティ可視化プロダクトの種にする。

---

## 0. このSpecの位置づけ

このドキュメントは、学習用のメモではなく、GitHubでバージョン管理しながら育てるための開発Specである。

最初のゴールは「完璧な商用SaaS」ではなく、以下を満たす小さなMVPを作ること。

```text
AI Agentの操作ログをAPIで受け取り、Kubernetes上で安全に動かし、GCPの運用・監視・商用開発観点まで学ぶ。
```

---

## 1. プロジェクト概要

| 項目 | 内容 |
|---|---|
| プロジェクト名 | Agent Log API on GCP / GKE |
| リポジトリ名 | `agent-log-api-on-gcp-gke` |
| 主テーマ | AI Agent操作ログ受信APIをGKE上で動かす |
| クラウド | Google Cloud Platform |
| 実行基盤 | GKE Autopilot |
| アプリ | FastAPI または Node.js API |
| 最初の保存先 | メモリ / Cloud Logging |
| 将来の保存先 | Pub/Sub + BigQuery |
| 学習目的 | K8s、GCP、商用開発、運用、セキュリティ設計を実装で学ぶ |
| 将来のプロダクト文脈 | AI Agent観測、SaaSログ正規化、ポリシーチェック、監査ログ可視化 |

---

## 2. プロダクト仮説

| 観点 | 内容 |
|---|---|
| 想定ユーザー | 情シス、セキュリティ担当、AI活用推進チーム、監査担当、SaaS管理者 |
| 解きたい課題 | AI Agentが誰の代理で、どのツールを、いつ、どんな権限で操作したか分からない |
| 提供価値 | Agent操作ログを収集し、監査・可視化・リスク検知の土台を作る |
| 最初の価値検証 | `POST /logs` でログを受信し、`GET /logs` と `kubectl logs` で確認できる |
| 商用化時の価値 | Agent操作の監査証跡、異常検知、ポリシー違反検知、テナント別レポート |

---

## 3. MVPスコープ

### 3.1 最初に作るもの

| ID | 機能 | 内容 | 優先度 | 完了条件 |
|---|---|---|---|---|
| MVP-001 | ヘルスチェック | `GET /health` を返す | Must | `{"status":"ok"}` が返る |
| MVP-002 | ログ受信 | `POST /logs` でAgentログを受け取る | Must | JSONを受信し、アプリログに出力できる |
| MVP-003 | ログ一覧 | `GET /logs` で受信済みログを見る | Must | メモリ上のログ一覧を返せる |
| MVP-004 | Kubernetesデプロイ | APIをGKEまたはローカルK8sに載せる | Must | Deployment / Service が動く |
| MVP-005 | ConfigMap | `APP_ENV`, `LOG_LEVEL` を外出しする | Should | `/health` に環境名が含まれる |
| MVP-006 | Secret | ダミーAPIキーをSecretから渡す | Should | APIキー存在チェックができる |
| MVP-007 | Probe | liveness/readiness probe を設定する | Should | `kubectl describe pod` で確認できる |
| MVP-008 | GitHub管理 | GitHubでSpec、コード、manifestを管理する | Must | `main` ブランチに初期構成がある |

### 3.2 最初はやらないこと

| 項目 | 理由 |
|---|---|
| Cloud SQL | 永続化設計が重くなり、K8s学習から逸れる |
| BigQuery連携 | Phase 2以降でよい |
| Pub/Sub | 非同期化はMVP後でよい |
| Cloud Armor | 外部公開前でよい |
| Terraform | まずは手で理解する。IaCはPhase 3以降 |
| Helm | manifest理解後に導入する |
| Argo CD / GitOps | 最初から入れるとパイプライン芸人になる |
| マルチテナント本実装 | 最初は設計だけ残す |

---

## 4. 想定ログスキーマ

### 4.1 MVPログ

```json
{
  "agent_id": "agent-001",
  "actor_user_id": "user-001@example.com",
  "tool_name": "gmail.search",
  "action": "read_email",
  "status": "success"
}
```

### 4.2 商用拡張ログ

| カラム | 型 | 説明 | MVP |
|---|---|---|---|
| `event_id` | string | イベントID | Later |
| `timestamp` | datetime | 発生時刻 | Later |
| `tenant_id` | string | テナントID | Later |
| `agent_id` | string | Agent識別子 | Must |
| `actor_user_id` | string | Agentを利用した人間ユーザー | Should |
| `tool_name` | string | 利用ツール名 | Must |
| `action` | string | 実行アクション | Must |
| `resource_type` | string | 操作対象種別 | Later |
| `resource_id` | string | 操作対象ID | Later |
| `status` | string | `success` / `failure` | Must |
| `latency_ms` | integer | 処理時間 | Later |
| `request_id` | string | リクエスト追跡ID | Later |
| `session_id` | string | セッションID | Later |
| `policy_result` | string | allow / deny / warn | Later |
| `risk_score` | float | リスクスコア | Later |
| `raw_payload` | json | 元ログ | Later |
| `schema_version` | string | スキーマバージョン | Should |

---

## 5. API仕様

| ID | Method | Path | 目的 | 認証 | 優先度 |
|---|---|---|---|---|---|
| API-001 | GET | `/health` | 死活監視 | 不要 | Must |
| API-002 | POST | `/logs` | Agentログ受信 | MVPでは不要 / 後でAPI Key | Must |
| API-003 | GET | `/logs` | 受信ログ一覧 | MVPでは不要 / 後でAPI Key | Must |
| API-004 | GET | `/env` | ConfigMap確認 | 不要 | Should |
| API-005 | GET | `/version` | アプリバージョン確認 | 不要 | Should |
| API-006 | GET | `/agents/{agent_id}/timeline` | Agent別タイムライン | API Key / OIDC | Later |
| API-007 | GET | `/metrics` | 簡易メトリクス | 内部用 | Later |

---

## 6. アーキテクチャ方針

### 6.1 基本思想

| 思想 | 内容 |
|---|---|
| 小さく始める | 最初はAPI単体 + GKE + Loggingに絞る |
| 状態を分離する | APIはステートレス。ログ保存は外部サービスへ逃がす |
| マネージドサービスを使う | GKE Autopilot、Cloud Logging、Artifact Registryなどを使う |
| 受信と処理を分ける | 将来はAPI受信と正規化処理をPub/Subで分離する |
| 監査を意識する | `agent_id`, `actor_user_id`, `tenant_id` を分けて考える |
| 商用化を見越す | SLO、Runbook、IAM、Secret、CI/CDを最初からSpecに残す |

### 6.2 Phase 1: 学習MVP

```text
Developer
  ↓ git push
GitHub
  ↓
Cloud Build
  ↓ build image
Artifact Registry
  ↓ pull image
GKE Autopilot
  ├─ Deployment: agent-log-api
  ├─ Service: agent-log-api
  ├─ ConfigMap: app-config
  └─ Secret: api-secret
  ↓
Cloud Logging / Cloud Monitoring
```

### 6.3 Phase 2: プロダクトβ

```text
Client / Agent
  ↓
HTTPS Load Balancer
  ↓
GKE Autopilot
  ↓
agent-log-api
  ↓
Pub/Sub topic: agent-logs
  ↓
log-normalizer-worker
  ↓
BigQuery: normalized_agent_logs
  ↓
Looker Studio / React Dashboard
```

### 6.4 Phase 3: 商用本番寄り

```text
Client / Agent
  ↓
Cloud Armor
  ↓
HTTPS Load Balancer
  ↓
GKE Gateway / Ingress
  ↓
agent-log-api
  ↓
Pub/Sub
  ↓
worker
  ↓
BigQuery

Security / Ops:
- IAM
- Workload Identity Federation for GKE
- Secret Manager
- Cloud Audit Logs
- Cloud Logging
- Cloud Monitoring
- Error Reporting
- Alerting
```

---

## 7. GCPコンポーネントSpec

| ID | コンポーネント | 用途 | Phase | 必須度 | 備考 |
|---|---|---|---|---|---|
| GCP-001 | Google Cloud Project | リソース管理単位 | 1 | Must | dev用projectを作る |
| GCP-002 | IAM | 権限管理 | 1 | Must | 最小権限を意識する |
| GCP-003 | GKE Autopilot | Kubernetes実行基盤 | 1 | Must | ノード管理を軽くする |
| GCP-004 | Artifact Registry | コンテナイメージ保存 | 1 | Must | Docker imageを置く |
| GCP-005 | Cloud Build | CI/CD、ビルド | 1 | Should | 最初は手動でも可 |
| GCP-006 | Cloud Logging | アプリログ確認 | 1 | Must | `kubectl logs` と併用 |
| GCP-007 | Cloud Monitoring | メトリクス・アラート | 1 | Should | Phase 1では簡易でよい |
| GCP-008 | Secret Manager | 秘密情報管理 | 2 | Should | K8s Secretから段階移行 |
| GCP-009 | Pub/Sub | ログ受信の非同期化 | 2 | Should | APIと保存処理を分離 |
| GCP-010 | BigQuery | ログ分析基盤 | 2 | Should | 正規化ログ保存先 |
| GCP-011 | HTTPS Load Balancer | 外部公開 | 2 | Should | 本番寄りで導入 |
| GCP-012 | Cloud Armor | WAF / DDoS対策 | 3 | Should | 外部公開後に検討 |
| GCP-013 | Cloud Audit Logs | 管理操作監査 | 3 | Must | 商用では重要 |
| GCP-014 | Cloud Deploy | デプロイ管理 | 3 | Could | Cloud Build後に検討 |
| GCP-015 | Error Reporting | エラー集約 | 3 | Could | 運用高度化で導入 |

---

## 8. KubernetesリソースSpec

| ID | リソース | 用途 | Phase | 必須度 | 備考 |
|---|---|---|---|---|---|
| K8S-001 | Namespace | 環境・責務の分離 | 1 | Should | `dev` から開始 |
| K8S-002 | Deployment | API Pod管理 | 1 | Must | replicasは最初1 |
| K8S-003 | Service | Podへの安定アクセス | 1 | Must | ClusterIP or LoadBalancer |
| K8S-004 | ConfigMap | 設定外出し | 1 | Must | `APP_ENV`, `LOG_LEVEL` |
| K8S-005 | Secret | 秘密情報外出し | 1 | Should | 最初はdummy API key |
| K8S-006 | ServiceAccount | Workload権限単位 | 2 | Should | GCP IAM連携の前提 |
| K8S-007 | ReadinessProbe | 受信可能状態の確認 | 1 | Should | `/health` を利用 |
| K8S-008 | LivenessProbe | 生存確認 | 1 | Should | `/health` を利用 |
| K8S-009 | Resource Requests/Limits | リソース制御 | 2 | Should | 商用前には必須級 |
| K8S-010 | Ingress / Gateway | HTTPルーティング | 2 | Could | Load Balancer利用時 |
| K8S-011 | NetworkPolicy | Pod間通信制御 | 3 | Should | セキュリティ強化 |
| K8S-012 | HPA | オートスケール | 3 | Could | 負荷が見えてから |

---

## 9. リポジトリ構成

```text
agent-log-api-on-gcp-gke/
├── README.md
├── SPEC.md
├── docs/
│   ├── architecture.md
│   ├── runbook.md
│   ├── adr/
│   │   ├── 0001-use-gke-autopilot.md
│   │   ├── 0002-use-pubsub-for-log-ingestion.md
│   │   └── 0003-use-bigquery-for-log-analytics.md
│   └── diagrams/
├── app/
│   ├── main.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── tests/
├── k8s/
│   ├── namespace.yaml
│   ├── deployment.yaml
│   ├── service.yaml
│   ├── configmap.yaml
│   ├── secret.example.yaml
│   └── probes.yaml
├── deploy/
│   ├── cloudbuild.yaml
│   └── gcloud-commands.md
├── scripts/
│   ├── local_run.sh
│   ├── docker_build.sh
│   └── k8s_apply.sh
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── feature_request.md
    │   ├── bug_report.md
    │   └── architecture_decision.md
    └── pull_request_template.md
```

---

## 10. GitHub運用Spec

### 10.1 ブランチ戦略

| ブランチ | 用途 | ルール |
|---|---|---|
| `main` | 安定版 | 直接push禁止。PR経由で更新 |
| `develop` | 開発統合 | Phase 1では省略可 |
| `feature/*` | 機能追加 | 例: `feature/add-health-api` |
| `fix/*` | バグ修正 | 例: `fix/health-response` |
| `docs/*` | ドキュメント更新 | 例: `docs/update-spec` |
| `infra/*` | K8s/GCP変更 | 例: `infra/add-gke-manifest` |

### 10.2 タグ運用

| タグ | 意味 |
|---|---|
| `v0.1.0` | ローカルAPI完成 |
| `v0.2.0` | Docker化完成 |
| `v0.3.0` | ローカルK8s / minikube完成 |
| `v0.4.0` | GKE Autopilotデプロイ完成 |
| `v0.5.0` | ConfigMap / Secret / Probe対応 |
| `v0.6.0` | Cloud Build + Artifact Registry対応 |
| `v0.7.0` | Pub/Sub連携 |
| `v0.8.0` | BigQuery連携 |
| `v1.0.0` | 商用βに近いMVP |

### 10.3 Issueラベル

| ラベル | 意味 |
|---|---|
| `type:feature` | 機能追加 |
| `type:bug` | バグ |
| `type:docs` | ドキュメント |
| `type:infra` | GCP / K8s / CI/CD |
| `type:security` | セキュリティ |
| `type:ops` | 運用・監視 |
| `priority:must` | 必須 |
| `priority:should` | 重要 |
| `priority:could` | 後でよい |
| `phase:1-mvp` | Phase 1対象 |
| `phase:2-beta` | Phase 2対象 |
| `phase:3-commercial` | Phase 3対象 |

### 10.4 PRテンプレート

```md
## 概要

## 変更内容
- [ ] app
- [ ] k8s
- [ ] gcp
- [ ] docs
- [ ] tests

## 確認したこと
- [ ] ローカルで動作確認した
- [ ] Docker buildできた
- [ ] Kubernetes manifestを確認した
- [ ] SecretをGitに含めていない
- [ ] README / SPECを更新した

## 関連Issue

## 備考
```

---

## 11. 開発フェーズSpec

| Phase | 目的 | 主な成果物 | 完了条件 |
|---|---|---|---|
| Phase 0 | 設計準備 | `SPEC.md`, `README.md`, repo作成 | GitHubに初期Specがある |
| Phase 1 | API + K8s学習MVP | FastAPI, Dockerfile, K8s manifest | GKEまたはローカルK8sでAPIが動く |
| Phase 2 | GCP CI/CD | Cloud Build, Artifact Registry | GitHub pushからimage buildできる |
| Phase 3 | 設定・Secret・Probe | ConfigMap, Secret, Probe | 環境値とヘルスチェックが動く |
| Phase 4 | 非同期ログ基盤 | Pub/Sub, worker | API受信と保存処理を分離できる |
| Phase 5 | 分析基盤 | BigQuery schema | 正規化ログをクエリできる |
| Phase 6 | 可視化 | React / Looker Studio | Agent別ログを見られる |
| Phase 7 | 商用運用準備 | SLO, Alert, Runbook | 障害時の対応手順がある |

---

## 12. 開発タスク表

| ID | タスク | 種別 | Phase | 優先度 | 完了条件 |
|---|---|---|---|---|---|
| DEV-001 | GitHub repoを作成 | Dev | 0 | Must | repoが作成される |
| DEV-002 | `SPEC.md` を配置 | Docs | 0 | Must | mainにcommitされる |
| DEV-003 | FastAPI雛形作成 | App | 1 | Must | `/health` が返る |
| DEV-004 | `/logs` POST実装 | App | 1 | Must | JSONを受信できる |
| DEV-005 | `/logs` GET実装 | App | 1 | Must | 保存済みログを返せる |
| DEV-006 | Dockerfile作成 | App | 1 | Must | docker build成功 |
| DEV-007 | Kubernetes Deployment作成 | K8s | 1 | Must | Podが起動する |
| DEV-008 | Kubernetes Service作成 | K8s | 1 | Must | port-forwardでアクセス可能 |
| DEV-009 | ConfigMap作成 | K8s | 3 | Should | APP_ENVを読み込める |
| DEV-010 | Secret作成 | K8s | 3 | Should | dummy API keyを読める |
| DEV-011 | Probe設定 | K8s | 3 | Should | describe podで確認可能 |
| DEV-012 | Artifact Registry作成 | GCP | 2 | Should | image repositoryがある |
| DEV-013 | Cloud Build設定 | GCP | 2 | Should | cloudbuild.yamlでbuild可能 |
| DEV-014 | GKE Autopilot作成 | GCP | 1 | Must | clusterが作成される |
| DEV-015 | GKEへdeploy | GCP/K8s | 1 | Must | GKE上でAPIが動く |
| DEV-016 | Cloud Logging確認 | Ops | 1 | Must | アプリログが確認できる |
| DEV-017 | Pub/Sub topic作成 | GCP | 4 | Could | `agent-logs` topicがある |
| DEV-018 | Worker実装 | App | 4 | Could | Pub/Subからログ処理できる |
| DEV-019 | BigQuery schema作成 | Data | 5 | Could | テーブルが作成される |
| DEV-020 | Runbook作成 | Ops | 7 | Should | `docs/runbook.md` がある |

---

## 13. 運用Spec

### 13.1 最初に見るログ

| 観点 | 内容 |
|---|---|
| APIログ | `POST /logs` の受信内容 |
| エラーログ | 例外、validation error |
| K8sログ | `kubectl logs` |
| GCPログ | Cloud Logging |
| デプロイログ | Cloud Build logs |

### 13.2 最初に見るメトリクス

| メトリクス | 意味 | Phase |
|---|---|---|
| request_count | リクエスト数 | 1 |
| error_count | エラー数 | 1 |
| p95_latency | p95レイテンシ | 2 |
| pod_restart_count | Pod再起動回数 | 1 |
| pubsub_backlog | 未処理メッセージ数 | 4 |
| normalization_error_count | 正規化失敗数 | 4 |
| bq_insert_error_count | BigQuery保存失敗数 | 5 |

### 13.3 初期SLO案

| SLO | 目標 | Phase |
|---|---|---|
| Availability | 月間99.5% | 7 |
| Latency | `POST /logs` p95 < 500ms | 7 |
| Freshness | 95%のログが60秒以内に保存される | 7 |
| Correctness | 正規化失敗率1%未満 | 7 |

---

## 14. セキュリティSpec

| ID | 観点 | 方針 | Phase |
|---|---|---|---|
| SEC-001 | API認証 | MVPではなし、次にAPI Key、将来OIDC | 2 |
| SEC-002 | Secret管理 | GitにSecretを置かない。`secret.example.yaml` のみ管理 | 1 |
| SEC-003 | GCP権限 | IAM最小権限 | 1 |
| SEC-004 | Pod権限 | ServiceAccountを分ける | 2 |
| SEC-005 | GCP APIアクセス | Workload Identity Federation for GKEを検討 | 2 |
| SEC-006 | テナント分離 | `tenant_id` をログスキーマに含める | 3 |
| SEC-007 | 監査ログ | Cloud Audit Logsを確認する | 3 |
| SEC-008 | 外部公開保護 | Cloud Armorを検討 | 3 |
| SEC-009 | 画像スキャン | Artifact Registry / build pipelineで検討 | 3 |
| SEC-010 | データ保持 | 保存期間と削除方針を定義 | 3 |

---

## 15. 商用開発で残すべきドキュメント

| ドキュメント | 目的 | ファイル |
|---|---|---|
| README | セットアップと概要 | `README.md` |
| Spec | 開発仕様 | `SPEC.md` |
| Architecture | アーキテクチャ説明 | `docs/architecture.md` |
| ADR | 技術選定理由 | `docs/adr/*.md` |
| API Spec | API仕様 | `docs/api.md` or OpenAPI |
| Runbook | 障害対応手順 | `docs/runbook.md` |
| Security Notes | セキュリティ方針 | `docs/security.md` |
| Cost Notes | コスト見積もり | `docs/cost.md` |
| Release Notes | リリース履歴 | `CHANGELOG.md` |

---

## 16. ADR候補

### ADR-0001: GKE Autopilotを使う

| 項目 | 内容 |
|---|---|
| 背景 | K8sを学びつつ、ノード管理の負荷を下げたい |
| 決定 | GKE Autopilotを使う |
| 代替案 | Cloud Run, GKE Standard, minikube |
| 理由 | K8sリソースを学べる一方で、ノード運用をGCP側に寄せられる |
| トレードオフ | GKE Standardほど細かいノード制御はしない |

### ADR-0002: Pub/Subでログ受信と処理を分離する

| 項目 | 内容 |
|---|---|
| 背景 | API受信とログ正規化・保存を密結合にしたくない |
| 決定 | Phase 2以降でPub/Subを使う |
| 代替案 | APIから直接BigQuery、Cloud SQL |
| 理由 | バッファリング、リトライ、非同期処理がしやすい |
| トレードオフ | コンポーネントが増える |

### ADR-0003: BigQueryを分析基盤にする

| 項目 | 内容 |
|---|---|
| 背景 | Agentログは集計・監査・分析用途が強い |
| 決定 | 正規化ログはBigQueryに保存する |
| 代替案 | Cloud SQL, Elasticsearch, Cloud Storage |
| 理由 | SQL分析とダッシュボード連携に向く |
| トレードオフ | OLTP的な更新処理には向かない |

---

## 17. 参考にする公式ドキュメント

- GKE Autopilot overview: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview
- GKE Workload Identity Federation: https://docs.cloud.google.com/kubernetes-engine/docs/concepts/workload-identity
- Cloud Build documentation: https://docs.cloud.google.com/build/docs
- Cloud Build deploy to GKE: https://docs.cloud.google.com/build/docs/deploying-builds/deploy-gke
- Artifact Registry with Cloud Build: https://docs.cloud.google.com/artifact-registry/docs/configure-cloud-build
- Google Cloud Well-Architected Framework: https://docs.cloud.google.com/architecture/framework

---

## 18. 最初の実装マイルストーン

### v0.1.0: ローカルAPI完成

- [ ] `GET /health`
- [ ] `POST /logs`
- [ ] `GET /logs`
- [ ] READMEにcurl例を書く

### v0.2.0: Docker化

- [ ] Dockerfile作成
- [ ] `docker build` 成功
- [ ] `docker run` でAPI確認

### v0.3.0: ローカルK8s対応

- [ ] Deployment作成
- [ ] Service作成
- [ ] port-forward確認
- [ ] Pod削除後の自動復旧確認

### v0.4.0: GKE Autopilot対応

- [ ] GCP Project作成
- [ ] Artifact Registry作成
- [ ] GKE Autopilot cluster作成
- [ ] GKEにdeploy
- [ ] Cloud Logging確認

### v0.5.0: 商用運用の芽

- [ ] ConfigMap対応
- [ ] Secret対応
- [ ] Probe対応
- [ ] request_id対応
- [ ] Runbook初版作成

---

## 19. このSpecの運用ルール

1. 仕様変更は必ず `SPEC.md` を更新する。
2. アーキテクチャ判断はADRに残す。
3. Secret値はGitHubにcommitしない。
4. GCPリソース名はREADMEまたはdocsに記録する。
5. `main` への直接pushは禁止する。
6. MVPでは完璧さより、動くことと説明できることを優先する。
7. 商用化を意識するが、最初から商用全部盛りにはしない。

---

## 20. 直近のToDo

| 順番 | ToDo | 完了条件 |
|---|---|---|
| 1 | GitHub repo作成 | `agent-log-api-on-gcp-gke` がある |
| 2 | `SPEC.md` を配置 | このファイルをcommitする |
| 3 | `README.md` 初版作成 | 目的と起動方法が書いてある |
| 4 | FastAPI雛形作成 | `/health` が動く |
| 5 | Dockerfile作成 | image buildできる |
| 6 | K8s manifest作成 | Deployment / Serviceがある |
| 7 | ローカルK8sで動作確認 | port-forwardでcurlできる |
| 8 | GCP構築メモ作成 | `deploy/gcloud-commands.md` がある |

