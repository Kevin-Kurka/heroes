# Republic Protocol - Session Memory

- [Roadmap status](roadmap_status.md) — rev 8: 19/30 at Phase C; details + per-rev promotion notes
- [E2E coverage](e2e_coverage.md) — what specs exist + pass post-strip; corrects the stale "no full bilateral E2E" claim

## Project Architecture
- **Main workspace**: `/Cargo.toml` with `src/core/crypto`, `src/core/network`, `src/core/backend`, `src/core/protocol`
- **Demo workspace**: `/demo/Cargo.toml` (standalone)
- **Frontend**: `/src/wallet/web/` (React 18 + Vite 7 + shadcn/ui + Zustand)
- **citizen-app**: Excluded from workspace, local-first P2P transactions (native only)
- **citizen-app-wasm**: Excluded from workspace, WASM crypto bindings for browser

## Key Decisions Made
- Q695v branch merged into master (local-first architecture shift)
- WASM-in-browser chosen for prototype crypto (most ambitious option)
- Target audience: both investors AND technical people
- tsconfig `noUnusedLocals`/`noUnusedParameters` set to false (lint-level, not safety)
- Test files excluded from tsc build (checked by vitest instead)
- ESLint `no-explicit-any` and `no-unused-vars` set to warn (not error) for prototype
- **LIMITED VAULT RECOVERY**: Citizens may recover vaults through progressive re-sponsorship. Requires biometric re-verification + 3+N sponsor endorsements (N = recovery count). Each recovery increments difficulty. Recovery does NOT restore balance — citizen starts at 0 credits. No Shamir SSS, no recovery shares, no threshold reconstruction.
- **GOVERNANCE MODEL**: User is ctzn-1 (Founder role). ctzn-0 (Treasury) is protocol-controlled, not a person. Only Founder can approve citizens initially → automate to 24h veto window → then fully automated.
- **GENESIS ARCHITECTURE**: 5 pre-Merkle-root accounts: ctzn-0 (Treasury), ctzn-1 (Founder), oracle-1/2/3 (Sponsorship Oracles). Oracles auto-sponsor new citizens (86,400 credits each). Protocol accounts cannot be logged into. All CZ-XXX IDs migrated to ctzn-N/oracle-N scheme.
- **ID Scheme**: ctzn-0 (Treasury), ctzn-1 (Founder/Kevin Kurka), oracle-1/2/3 (Oracles), ctzn-2 (Mei-Lin), ctzn-3 (Dmitri), ctzn-4 (Priya), ctzn-5 (Kofi). Passwords: `republic_{id}` (e.g. `republic_ctzn-1`).
- **Phase timeouts**: All 3 phase transitions set to 1,000ms (fully automated, no human step).

## WASM Compatibility Notes
- **WASM-safe**: curve25519-dalek, chacha20poly1305, bulletproofs, merlin, sha3, blake3, subtle, zeroize, rand+getrandom/js
- **NOT WASM-safe**: pqcrypto-* (C FFI), blst (C FFI), rusqlite (C), libp2p (native networking), tokio (full)
- Use `js_sys::Date::now()` instead of `SystemTime::now()` in WASM
- Use `RefCell` instead of `RwLock` (single-threaded)
- Use `getrandom` with `js` feature for CSPRNG

## Common TypeScript Fix Patterns
- `Uint8Array<ArrayBufferLike>` → add `as BufferSource` for Web Crypto API calls
- BigInt `0n` not renderable in JSX → use `!== undefined` or `!== 0n` guard instead of truthy check
- `CryptoError` constructor takes 2 args (message, code), not 3
- `useState(null)` without type param causes `never` downstream → use `useState<T | null>(null)`

## Benchmark Results (March 2026 — Post ML-DSA-87 Upgrade)
- **Native server (release, 20-run avg)**: Total crypto 6.96ms (P50: 6.97, P95: 7.18), with network ~19ms
  - Phase 1 (sender): 0.19ms, Phase 2 (receiver): 0.26ms, Phase 3 (sender): 4.86ms (Bulletproof dominates), Phase 4 (receiver): 0.95ms
  - Throughput: ~144 txn/s single-thread, ~575 txn/s 4-core
- **WASM primitives (native release)**: ML-DSA-87 sign 716µs, verify 270µs, Bulletproof 4.82ms, Pedersen 58µs
- **Previous WASM-in-browser** (pre ML-DSA-87 upgrade): sender ~25ms, receiver ~5.3ms — browser re-bench pending
- WebSocket latency: ~3ms avg per hop
- Key derivation: ~58ms (PBKDF2-HMAC-SHA3, 100K iterations, not in tx path)
- Encrypted vault state: ~15.5 KB
- `bilateral-performance.test.ts` excluded from vitest (in vitest.config.ts exclude list)

## Bug Fixes Found via Benchmarking
- **demo-server.mjs routing bug**: Node.js server routed ALL messages by `receiver_id`. For `verify_tx`/`settle_tx`/`reject_tx`, must route to `sender_id` instead.
- **Commitment mismatch bug**: Sender generated separate Pedersen commitment and range proof with different blinding factors. Fix: use `rp.commitment_hex` from range proof as transaction commitment.

## Crypto Upgrade (March 2026 — Completed)
- **ML-DSA-65 → ML-DSA-87**: PK 1,952→2,592, SK 4,032→4,896, SIG 3,309→4,627 bytes. NIST Level 3→5.
- **ChaCha20-Poly1305 → XChaCha20-Poly1305**: Nonce 12→24 bytes. Same `chacha20poly1305` crate, `XChaCha20Poly1305`/`XNonce` types.
- PROTOCOL_IDENTITY string updated → protocol version hash changed (vaults from before are incompatible, expected pre-launch)
- All 4 Rust workspaces updated: main, demo, citizen-app-wasm, signaling-node
- WASM rebuilt with `wasm-pack build --target web`
- Mock transaction payload trace: `docs/MOCK_TRANSACTION_PAYLOAD_TRACE.md`

## Winterfell STARK Integration (March 2026 — Completed)
- **All 12 phases complete**: 1.0, 2A-2D, 3A-3C, 4A, 5A-5D, 6A, 7A-7B
- **Winterfell v0.13.1**: f128 field, ~100-bit security, Blake3-256 hash
- **winterfell-stark**: Now DEFAULT feature in republic-crypto
- **10-Column AIR** (VaultTransitionAir): balance accumulator, step counter, citizenship_bit, chain_link_lo, chain_link_hi, state_binding, protocol_rules, tx_binding, citizenship_binding, m_lock
- **20 boundary assertions**: Each column pinned at rows 0 and N-1; 2 transition constraints (balance step, step counter)
- **Columns 2-9 are constant**: Enforced via boundary assertions only (NOT transition constraints — zero polynomial issue)
- **5 binding validations** in `validate_bindings()`: chain_link (H(prev_proof_hash)), state_binding (H(old||new state)), protocol_rules (H(PROTOCOL_IDENTITY)), tx_binding (H(tx_id||amount||mint||ts)), citizenship_binding (H(citizenship_registry_root))
- **Genesis → Citizenship → Transaction chain**: citizenship_binding (column 8) cryptographically binds STARK proofs to the citizenship Merkle root, creating unbroken traceability back to Genesis
- **Domain tags** in `utils/mod.rs`: STATE_BINDING, PROTOCOL_RULES, TX_BINDING, CITIZENSHIP_BINDING (`b"REPUBLIC_CITIZEN_BIND"`)
- **Old custom FRI prover**: Deleted (~4,500 lines)
- **Old Bulletproof bundles**: Replaced by `RecursiveVaultProof`
- **vault_zkp.rs**: Rewritten to use Winterfell (send/receive mapping: receives use transfer=0, minted=received_amount)
- **WASM**: `citizen-app-wasm/src/stark.rs` with full 10-column Winterfell integration (no feature flag, always compiled)
- **Frontend**: STARK proof generation/verification integrated; `StarkProofData.citizenship_registry_root` passed to WASM which computes citizenship_binding internally
- **Test counts**: republic-crypto 591 pass/27 ignored (post-cleanup), demo pass, WASM 64 pass

## Codebase Cleanup (March 2026 — Completed)
- **Deleted aspirational modules**: acceleration/, attestation/, stealth/, mobile_zkp/, biometric/fido2_integration, biometric/transaction_signature
- **Deleted 31+ dead docs**: root-level duplicates, phase reports, PURE_MAC docs, backend/frontend report cruft, old crypto test reports
- **Deleted bin runners**: test_runner, simple_test_runner, stark_test_runner, stealth_test_runner
- **Deleted aspirational examples**: stealth_demo, stealth_simple_demo, mobile_zkp_demo, pop_verification_demo
- **Deleted integration tests**: privacy_features_test.rs, simple_e2e_test.rs, crypto/zkp_comprehensive.rs
- **Updated TRANSACTION_PROTOCOL.md**: Corrected to 10-column AIR, added Dual-Envelope Escrow + nonce ping-pong, removed fabricated metrics
- **Cargo.toml cleaned**: Removed GPU/platform/attestation features and optional deps (cuda, ocl, vulkano, metal, etc.)

## Protocol Versioning Governance (March 2026 — Completed)
- **ctzn-1 ML-DSA-87 signing**: Protocol version updates must be signed by Founder's genesis keypair
- **Migration**: `demo/migrations/008_protocol_versions.sql` — protocol_versions table with version_label, protocol_identity, ml_dsa_signature, signed_by
- **Functions in governance.rs**: `sign_protocol_version_update()`, `verify_protocol_version_signature()`, `register_protocol_version()`, `seed_initial_protocol_version()`
- **API routes**: `GET /api/v1/governance/protocol-versions`, `POST /api/v1/governance/protocol-version` (Founder-only)
- **On-read verification**: GET handler re-verifies ML-DSA-87 signatures before returning version list
- **Auto-seed**: v1.0 seeded on first startup if table empty

## VLH → Nullifier Migration (April 2026 — Completed)
- **VLH system fully removed**: vlh_handlers.rs deleted, VLH fields removed from VaultState/SealedVault, all VLH methods removed from crypto-bridge.ts
- **Nullifier derivation**: `SHA3-256("republic_nullifier:" || signing_key[0..32] || sequence_number_le_bytes)` — computed inside WASM kernel
- **Server stores only opaque hashes**: `nullifier_set` table (TEXT PK, inserted_at), no citizen_id, no metadata — O(T) growth
- **SealedVaultV5**: New format without VLH fields, auto-migration from V4/V3
- **STARK tx_binding**: Extended from 6→7 fields (added nullifier), prevents nullifier substitution
- **KERNEL_VERSION**: Bumped v1.0→v1.1 (anti_ds:nullifier, tx_binding_fields:7)
- **Bulk envelope key fetch**: `GET /api/v1/registry/envelope-keys/bulk` at vault unlock prevents per-tx intent leakage
- **Nullifier endpoint**: `POST /api/v1/nullifiers/submit` — 30/hour rate limit, atomic INSERT for collision detection
- **Migration file**: `demo/migrations/017_nullifier_set.sql`
- **All tests pass**: 219 demo, 104 WASM, tsc clean, ESLint clean

## RDNP v2 Phase 1 (April 2026 — Completed)
- **citizen-app-core crate**: Shared types, constants, registry logic (excluded from main workspace like citizen-app-wasm)
- **SignedRegistryEntry**: Self-authenticating ML-DSA-87 signed entries with canonical message format
- **Shard architecture**: 4-bit depth (16 shards), SHA3-256 prefix routing, Merkle trees per shard
- **Demo server**: `demo/migrations/018_registry_shards.sql`, `demo/src/shard_handlers.rs` with 4 REST endpoints
- **Shard API**: GET manifest, GET shard, GET delta, POST entry (ML-DSA-87 signature verification)
- **Frontend RDNP modules**: `src/lib/rdnp/` — types.ts, shard-store.ts (IndexedDB), registry-lookup.ts (4-layer cache), shard-sync.ts
- **Bulk fetch replaced**: vault.ts uses `initShardSync()` (dynamic import) instead of `getEnvelopeKeysBulk()`
- **KernelTransactionFlow**: Uses `lookupEnvelopeKeys()` from registry-lookup (memory → IDB → shard → per-citizen fallback)
- **WASM exports**: `verify_registry_entry()`, `compute_shard_id()`, `create_signed_registry_entry()` added
- **SignatureContext::RegistryEntry**: New ML-DSA-87 domain prefix `b"REPUBLIC-REGISTRY-ENTRY:"`
- **All tests pass**: 27 core, 104 WASM, 219 demo, tsc clean, ESLint clean

## RDNP v2 Phase 2 — Proof-Carrying Shard Kernel (April 2026 — Completed)
- **ShardKernel FSM**: 6-method state machine in `citizen-app-core/src/rdnp/kernel.rs` (begin_operation, compute_transition, attach_proof, commit_operation, apply_remote, get_state)
- **10-Column ShardTransitionAir**: Mirrors VaultTransitionAir — entry_count accumulator, step counter, operation_type, chain_link_lo/hi, shard_state_binding, kernel_rules, operation_binding, global_state_binding, shard_id_field
- **WASM shard STARK**: `citizen-app-wasm/src/shard_stark.rs` — genesis/extend/verify proof chain, 6 WASM exports
- **Native shard STARK**: `src/core/crypto/src/stark/shard_air.rs` — same AIR, uses SystemTime, citizen-app-core added as optional dep behind winterfell-stark
- **Frontend shard-kernel.ts**: TypeScript wrapper with IndexedDB proof chain storage, WASM bridge
- **Demo server**: Proof chain storage (migration 019), `GET /api/v1/registry/shards/:shard_id/proofs`, background STARK proof generation on entry submission
- **No quorum**: Mathematical proofs replace voting — STARK proof + ML-DSA-87 sig = self-verifying gossip
- **CRDT conflict resolution**: BTreeMap sorted by citizen_id, LWW version-based superseding, deterministic Merkle roots
- **Orphan rule fix**: Free functions instead of impl blocks for citizen-app-core types in WASM crate
- **All tests pass**: 51 core, 110 WASM (2 ignored), 7 native shard_air, 219 demo, tsc clean, ESLint clean

## VSA Global Scale (April 2026 — ALL 6 PHASES COMPLETE)
- **Phase 1**: Poseidon-in-circuit STARK AIR — 12-column AIR enforcing Poseidon round functions as transition constraints (65 rounds/hash × 34 hashes = 2210 rows padded to 4096)
- **Phase 2**: Incremental Merkle Tree — O(log N) inserts via `IncrementalMerkleTree` (hash-agnostic closure design, BTreeMap sparse storage, depth 10 prototype / 33 production)
- **Phase 3**: Hierarchical Bucket PIR — 256×256 = 65,536 buckets (shard_id = byte 0, sub_bucket_id = byte 1 of slot_id). Sub-bucket download ~8.8 MB at 8B scale
- **Phase 4**: Distributed Node Architecture — `node_registry` table, `VsaReceipt` extended with `act_root_hex`/`act_root_timestamp_ms`, cross-node receipt validation, `validate_vsa_receipt` WASM export, `GET /api/v1/nodes`
- **Phase 5**: Epoch-Based Batching — 10s epochs (VSA_EPOCH_DURATION_MS), background epoch processing task, `EpochSummary` type with ML-DSA-87 signing, epoch summary/entries/recent endpoints
- **Phase 6**: ACT Authority Replication — `GET /api/v1/act/state` for full IMT state transfer, standby polling task (5s interval, 30s failover), `ACT_LEADER_URL` env var for standby mode
- **Migrations**: 022 (act_imt), 023 (hierarchical_buckets), 024 (node_registry), 025 (vsa_epochs)
- **Test counts**: 95 core, 119 WASM (2 ignored), 219 demo, tsc clean
- **Plan file**: `/Users/kmk/.claude/plans/majestic-forging-lightning.md`

## DNN — Distributed Nullifier Network (April 2026 — ALL 4 PHASES COMPLETE)
- **Phase A**: Core types + NullifierKernel FSM in `citizen-app-core/src/dnn/` (types, kernel, routing, envelope modules). K=7 replication, 4-of-7 quorum, 8,192 slots × 128 bytes = 1 MB/node, XOR-distance DHT routing
- **Phase B**: Demo server endpoints (`demo/src/dnn_handlers.rs`), migration 026. 6 endpoints: rotate, lookup, manifest, bucket, prune, nodes. Background dummy rotation + expiry cleanup tasks. `RESPONSE_PAD_SIZE=512` for traffic analysis resistance
- **Phase C**: WASM integration — `SealedVaultV6` (DNN fields: rotation_counter, routing_tag, node_ids, last_rotation_epoch). DNN nullifier derivation: `SHA3-256("REPUBLIC_DNN_NULLIFIER:" || sk[0..32] || vault_state_hash || rotation_counter_le)`. New methods: `prepareRotation()`, `confirmRotation()`, `getDnnState()`. Frontend: `'rotating'` phase added before `'announcing'` in KernelTransactionFlow. Receiver async rotation after settlement ACK
- **Phase D**: Dummy traffic (`prepareDummyRotation()`), annual expiry (`checkDnnExpiry()`), fixed-size I/O (512-byte padding). Cover traffic indistinguishable from real rotations
- **KERNEL_VERSION**: v1.2 (`anti_ds:nullifier+vsa, tx_binding_fields:8`)
- **Test counts**: 145 core, 119 WASM (2 ignored), 221 demo, tsc clean

## Decentralized Citizenship Protocol (April 2026 — Approved)
- [Decentralized Citizenship](project_decentralized_citizenship.md) — DNN-hidden enrollment, OPRF nullifiers, quorum verification

## Documentation Refresh (April 2026)
- **Migration range**: CLAUDE.md now reflects 001–029 (was 001–017)
- **Demo source files**: 35 (CLAUDE.md previously said 30)
- **WASM test count**: 124 test functions (previously "119 tests" in MEMORY.md)
- **Demo test count**: 221 test functions (unchanged, matches MEMORY.md)
- **Shard endpoints**: 5 REST endpoints wired (manifest, shard, delta, proofs, submit_entry) — MEMORY.md previously said "4"
- **CLAUDE.md kernel methods**: all 6 confirmed exported from citizen-app-wasm/src/vault.rs (initiate_send, process_incoming_proposal, process_acceptance, process_commitment, finalize_settlement, get_kernel_state + DNN helpers prepare_rotation, get_dnn_state)

## Hardening Plan Completion (April 2026 — `resolute-hardening-anvil`)
- Plan: `/Users/kmk/.claude/plans/resolute-hardening-anvil.md` — 27 tasks, all completed on branch `hardening/resolute-anvil`
- 15 commits from `91188fc` baseline
- Test totals: 709 main + 230 demo + 738 frontend = **1,677 tests passing**
- Phase 1 (docs): CLAUDE.md migration range refreshed to 001–029, SECURITY_AUDIT_STATUS flagged 7 unaudited subsystems, STARK verification boundary documented
- Phase 2 (citizenship tests): 12 new vitest tests covering SponsorSelection, BiometricCapture, ApplicationReview, EnhancedProcessingStatus. Found that EnhancedProcessingStatus uses **hardcoded mock data** instead of real API fetch — frontend gap to address.
- Phase 3 (cleanup): deleted 2,274 LOC of orphaned code in `src/core/protocol/` (simple_lib + crypto_stubs + compression). Workspace builds clean.
- Phase 4 (DNN tests): 5 new pure-helper tests for rotation validation, padding, rate-limit math, expiry math. Required minor refactor to extract pure helpers from handlers.
- Phase 5 (panic audit): baseline = 1693 unwraps + 126 expects + 19 panics. Original audit was wrong about hotspots — `nullifier_handlers`, `dnn_handlers`, `shard_handlers`, `vault_handlers` all already clean (`unwrap_or` only). Real hotspots: metrics.rs (42), treasury_protocol.rs (41), protocol_wallet.rs (37), stark_verifier.rs (24). Deferred conversion to follow-up plan. Added `DemoError` type ready for use.
- Phase 5 (FK constraints): migration 030 backfilled FKs on `vaults` and `vault_backups`; 13 other tables documented in `fk_audit_pending` table for follow-up data-hygiene pass.
- Phase 6 (ops docs): added `docs/operations/DEPLOYMENT.md`, `docs/operations/DISASTER_RECOVERY.md`, `docs/security/AUDIT_SCOPE.md`.
- Critical re-framings: (1) STARK proofs are audit artifacts not validation gates per intentional design, (2) demo server is signaling-only — no settlement processing, no STARK verification gate to add, (3) nullifier endpoint is opaque-hash-only by privacy design.

## RDNP v2 Phases 3-5 (April 2026 — `tranquil-gossiping-shard` via `luminous-shipping-keystone`)
- Plan: `/Users/kmk/.claude/plans/tranquil-gossiping-shard.md` — 9 tasks, executed under PR #38
- Phase 3 (gossip transport — Tasks 3.1–3.4): `demo/src/peers.rs` (PeerRegistry, PeerInfo, PeerStatus, parse from `SEED_NODES` env), `demo/src/rdnp_gossip.rs` (background poll task with 10s interval + 5s timeout + 3-failure quarantine, manifest reconciliation via per-shard delta pull with ML-DSA-87 verify, push-on-write notify fan-out + receiver path).
- Phase 4 (peer discovery — Tasks 4.1+4.2): recursive BFS over known peers' `/api/v1/nodes` every 60s, capped at 100 peers. Single-seed bootstrap satisfied automatically.
- Phase 5 (rebalancing — Tasks 5.1+5.2): `citizen-app-core/src/rdnp/assignment.rs` `shards_for_node(id, total_nodes)` (modulo for prototype, consistent hashing TBD), `broadcast_goodbye` POST to all peers' `/api/v1/nodes/goodbye`, receivers mark Quarantined.
- Phase 5 Task 5.3 (multi-node integration test) DEFERRED — would need axum_test scaffolding for 3 in-process servers. Helpers individually unit-tested (5 rdnp_gossip + 8 assignment tests pass). Tracked in V010_FOLLOWUP_DEBT.
- New routes: `POST /api/v1/registry/entries/notify`, `POST /api/v1/nodes/goodbye`.

## Anonymous-VSA STARK Proof (May 2026 — branch `spec-anon-vsa-stark`, 12 tasks COMPLETE)
- Plan: `docs/superpowers/plans/2026-05-12-anon-vsa-stark-proof-impl.md` (1556 lines, in-repo)
- Replaces SHA3 placeholder in `prepare_anonymous_vsa` with real Winterfell STARK proof that the server's `verify_anon_citizenship_proof` accepts.
- WASM-side prover `citizen-app-wasm/src/anon_citizenship_stark.rs` is byte-identical to native (`ProofOptions(28,16,4,Quadratic,8,31,...)`). Cross-crate round-trip test `citizen-app-wasm/tests/cross_verify.rs` is the AIR-drift canary (single-leaf + two-leaf cases).
- New server endpoint: `GET /api/v1/act/path/by-leaf/:leaf_hex` (`demo/src/vsa_handlers.rs:get_act_path_by_leaf`). Migration 032: `idx_act_leaves_value_hex`.
- New WASM exports on ProtocolVault: `prepare_anonymous_vsa(biometric, merkle_path_json)`, `compute_anon_leaf_hex`, `compute_anon_secret_hex`, `compute_vsa_slot_id_hex(biometric)`, `compute_vault_state_hash`. TS bridge wrappers in `src/wallet/web/src/lib/wasm/crypto-bridge.ts`.
- Web Worker pre-compute: `src/wallet/web/src/lib/vsa/vsa-worker.ts` + `vsa-worker.client.ts`. Worker receives primitive inputs (anon_secret_hex, path siblings, slot_id, vault_state_hash, act_root) and calls `generate_anon_citizenship_proof_wasm`. 15s timeout.
- Zustand cache: `src/wallet/web/src/lib/vsa/vsa-cache.ts`. Invalidation: vault_state_hash mismatch, act_root mismatch, 60s TTL. 6 unit tests.
- Vault store wiring (`src/wallet/web/src/stores/vault.ts`): `primeVsaCache` fires on `initializeVault` success; cache cleared + re-primed on `settleOutbound` / `settleInbound` / `releaseOutbound` / `releaseInbound` / `dispose`.
- KernelTransactionFlow (`src/wallet/web/src/features/bilateral/KernelTransactionFlow.tsx:136-184`) consumes cache on `'announcing'`; falls back inline (path fetch + WASM proof) on miss; existing try/catch backstop preserved.
- E2E `src/wallet/web/tests/e2e/vsa-real-proof.spec.ts` — Chromium-only; asserts `/api/v1/act/path/by-leaf/` request fires within 15s of vault unlock (worker pipeline canary). Does NOT exercise full bilateral send (existing E2E never has).
- Anon-secret derivation matches **demo server**: `SHA3-256("republic_anon_leaf_seed:" || citizen_id)`. NOT `citizen_app_core::compute_anon_secret(signing_key)`. Out of scope to migrate per spec.
- Final test counts: demo 262, WASM 119 lib + 2 cross_verify, main workspace lib 616, frontend vitest 798 (42 files), E2E 1.
- Known follow-ups: (a) Task 4's wasm-only test gate is inverted (`cfg(target_arch="wasm32")` — never runs); cross-crate test compensates. (b) `create_test_app_state` duplicated in `vault_handlers.rs` and `vsa_handlers.rs` — drift risk. Both logged in TaskCreate.

## Active Plan
- **Full feature plan**: `/Users/kmk/.claude/plans/virtual-growing-wilkinson.md` — ALL PHASES COMPLETE
- **Production readiness**: `/Users/kmk/.claude/plans/production-readiness.md` — security hardening + decentralization
- **Prototype plan**: `/Users/kmk/.claude/plans/proud-whistling-locket.md`
- **VSA Global Scale**: `/Users/kmk/.claude/plans/majestic-forging-lightning.md` — ALL 6 PHASES COMPLETE
- **DNN**: `/Users/kmk/.claude/plans/majestic-forging-lightning.md` — ALL 4 PHASES COMPLETE (A-D)
- **RDNP v2**: Phase 1-2 complete (April 2026). Phase 3-5 complete via `tranquil-gossiping-shard.md` under PR #38 (Tasks 3.1–3.4, 4.1, 4.2, 5.1, 5.2 done; Task 5.3 multi-node integration test deferred).
- **Production readiness**: `/Users/kmk/.claude/plans/sparkling-growing-wave.md` — Phase 0-1 are production gates
- **Hardening anvil**: `/Users/kmk/.claude/plans/resolute-hardening-anvil.md` — ALL 27 TASKS COMPLETE
