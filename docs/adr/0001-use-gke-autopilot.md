# ADR-0001: GKE Autopilotを使う

## Status

Accepted

## Context

このプロジェクトは、Kubernetesを学びながらGCP上でAgentログAPIを動かすことを目的にしている。
ノード管理そのものより、Deployment、Service、ConfigMap、Secret、Probe、Cloud Loggingとの接続を理解することを優先する。

## Decision

GKEの実行基盤にはGKE Autopilotを使う。

## Consequences

GKE Standardよりノード管理の自由度は下がる。
その代わり、学習初期の運用負荷を抑えながらKubernetesリソースを扱える。

## Alternatives

Cloud Runは、APIを小さく公開する用途では有力である。
しかし、Kubernetes manifestとGKEの運用を学ぶ目的から外れる。

GKE Standardは、ノード構成を細かく制御できる。
しかし、Phase 1ではノード運用まで扱うと学習対象が広がりすぎる。

minikubeやkindは、ローカル学習には使える。
ただし、GCPの運用、Cloud Logging、Artifact Registryとの接続までは扱えない。
