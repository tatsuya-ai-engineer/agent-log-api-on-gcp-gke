# Services

このディレクトリには、将来のマイクロサービス境界ごとにコードとサービスSpecを置く。
Phase 1では `agent-log-api` だけを実装する。

## サービス境界

| Service | 役割 | Phase |
|---|---|---|
| `agent-log-api` | Agent操作ログをHTTPで受信する | 1 |
| `log-normalizer-worker` | Pub/Subからログを読み、正規化して保存する | 4 |
| `dashboard` | Agentログを検索、可視化する | 6 |

## 方針

サービスごとに `README.md` または `SPEC.md` を置く。
共通スキーマは、サービス内部へ閉じずに `schemas/` へ分離する予定である。

Phase 1ではサービスを分けすぎない。
ただし、API受信とログ正規化は失敗特性が違うため、Phase 4以降でPub/Subを境界に分離する。
