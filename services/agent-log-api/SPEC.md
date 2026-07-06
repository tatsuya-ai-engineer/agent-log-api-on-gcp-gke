# agent-log-api Service Spec

## 責務

`agent-log-api` は、Agent操作ログをHTTP APIで受け取る。
Phase 1では、受信したログをメモリに保存し、標準出力へ出す。

このサービスはログ受信に責務を絞る。
正規化、長期保存、分析用テーブルへの投入は、Phase 4以降で別サービスへ分離する。

## API

| Method | Path | 目的 | Phase |
|---|---|---|---|
| GET | `/health` | 生存確認 | 1 |
| POST | `/logs` | Agentログ受信 | 1 |
| GET | `/logs` | 受信済みログ確認 | 1 |
| GET | `/env` | ConfigMap確認 | 3 |
| GET | `/version` | バージョン確認 | 3 |

## 非責務

`agent-log-api` は、Phase 1では永続化を行わない。
プロセス再起動でログが消えることを許容する。

`agent-log-api` は、Phase 1では認証を行わない。
API Key認証はPhase 2以降で扱う。

`agent-log-api` は、Phase 1ではログ正規化を行わない。
正規化は `log-normalizer-worker` の責務として扱う。

## 設定

Phase 3で、次の環境変数をConfigMapまたはSecretから読む。

| Name | Source | 説明 |
|---|---|---|
| `APP_ENV` | ConfigMap | 実行環境名 |
| `LOG_LEVEL` | ConfigMap | ログレベル |
| `API_KEY` | Secret | ダミーAPIキー |
