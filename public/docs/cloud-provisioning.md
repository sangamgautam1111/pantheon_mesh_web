# Pantheon Mesh: Cloud API Provisioning Whitepaper v1.0
## Secure Node Integration for External Foundation Models

### 1. Abstract
This document outlines the protocol for binding external foundation AI models (e.g., DeepSeek, OpenAI, Anthropic via standard or custom endpoints) into the **Pantheon Mesh**. It details the zero-knowledge vault mechanics, encryption at rest, and the "Smart Connect" handshake logic that ensures secure, incentivized compute distribution.

### 2. Infrastructure Tiers
| Feature | Local Ollama | Cloud API Node |
| :--- | :--- | :--- |
| **Data Residency** | 100% Local (Hardware) | External Provider |
| **Encryption** | mTLS / P2P Tunnel | AES-256 GCM (Vault) |
| **Trust Model** | Trustless / Self-Hosted | Managed Provider |
| **Latency** | Sub-10ms (Edge) | 200ms+ (Network) |

### 3. The Pantheon Vault Protocol
External API keys are sensitive assets. Pantheon implements a **Multi-Stage Sealing Protocol**:

1.  **Sanitization**: Keys are validated against the provider's health-check endpoint.
2.  **Encryption**: Keys are encrypted locally using **AES-256-GCM** with a hardware-bound master key (KMK).
3.  **Vault Storage**: Only the encrypted "blinded" blob and a cryptographic hash (SHA-256) are stored in the Mesh database.
4.  **Just-In-Time (JIT) Opening**: Keys are decrypted only within the ephemeral memory of the routing node during an active inference request.

### 4. Connection Handshake
To provision a cloud node, follow these steps:

1.  **Handshake Initialization**: Enter your API key in the `Connect` interface.
2.  **Automated Probing**: The Pantheon Bridge automatically detects the model architecture (e.g., GPT-4o, DeepSeek-V3).
3.  **Handshake Consensus**: The system verifies the key's authenticity and performance vitals.
4.  **Node Commissioning**: Click **"Provision Node with AES-256 Encryption"**. This seals the key into the Pantheon Vault and registers the node as an active "earning asset" in the mesh.

### 5. Revenue and Incentivized Compute
Every request routed to your provisioned cloud node generates a commission. 
- **Mesh Fee**: 20% (Maintains the global load balancer)
- **Node Payout**: 80% (Directly credited to your Developer Account)

### 6. Security Warning
- **API Scope**: Always use scoped API keys (restricted to specific models) when possible.
- **Revocation**: You can revoke access at any time through the Pantheon Dashboard, which immediately purges the encrypted key from the Vault.

---
*Pantheon Mesh | Distributed Intelligence. Institutional Security.*
