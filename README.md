# 🌍 Borrow the Planet

### Borrow more. Own less. Trust travels.

**Borrow the Planet** is a Solana-powered resource-sharing marketplace designed to help people borrow and lend physical items within their communities instead of buying everything they need.

We aim to make sharing more accessible and trustworthy through transparent transactions, secure escrow, and **PlanetPass** — a portable trust credential designed to let users carry verified rental reputation across compatible marketplaces while keeping personal information private.

Starting with college communities, our vision is to build a global sharing economy where resources are used more efficiently and trust can travel with people.

---

## 🚩 The Problem

Many useful items sit unused while other people buy the same items for occasional use. Existing peer-to-peer sharing can also face trust issues:

- **Unused resources:** Items such as tools, electronics, books, and equipment often remain idle.
- **Trust barriers:** People may hesitate to lend valuable items to strangers.
- **Fragmented reputation:** A user's history on one marketplace may not carry over to another.
- **Unclear transactions:** Deposits, return conditions, and dispute handling can be confusing.

## 💡 Our Solution

Borrow the Planet combines a community-focused rental marketplace with blockchain-enabled transaction infrastructure and portable trust credentials.

### Core Features

- **🔎 Smart Discovery:** Find useful items available to borrow within a community.
- **🤝 Transparent Booking:** Make rental terms, deposits, and return expectations clear.
- **🔐 Solana Escrow:** Planned on-chain escrow and settlement to make transaction flows more transparent.
- **📸 Handover & Return:** Condition photos and checklists to help document the item's state.
- **🪪 PlanetPass:** A privacy-conscious, portable credential concept for verifying relevant rental history across compatible platforms.
- **🌱 Planet Impact Ledger:** Track sharing activity, item usage, and community participation.

> **Development status:** This repository is currently being set up. The features described above represent the project vision and planned capabilities; they should not be interpreted as already implemented unless corresponding code and tests are available.

---

## 🪪 PlanetPass — Trust That Travels

PlanetPass is our key differentiator.

It is designed to let users share relevant, verifiable rental credentials with compatible marketplaces instead of starting their reputation from zero on every platform.

Our intended principles:

- **Private by default:** Personal information and sensitive evidence stay off-chain.
- **User-controlled sharing:** Users choose when to present credentials and to whom.
- **Verifiable claims:** Receiving platforms can check credential issuer, signature, status, and history coverage.
- **Fair handling:** Allegations are not automatically treated as proven incidents; correction and appeal mechanisms are part of the design.
- **Honest verification:** If required history is missing, a platform should show “insufficient information” rather than automatically assigning a negative score.

PlanetPass is intended to support better-informed decisions, not guarantee that a borrower or lender will always behave responsibly.

---

## ⚙️ How It Is Intended to Work

1. **Discover** — A user finds an item available to borrow.
2. **Trust** — The parties review relevant profile information and rental terms.
3. **Book** — The borrower requests the item and agrees to the conditions.
4. **Escrow** — A Solana program is intended to manage eligible deposits and settlement rules.
5. **Handover** — Both parties document the item's condition.
6. **Return** — The item is returned and its condition is checked.
7. **Settle** — Funds are settled according to the agreed outcome and applicable dispute process.
8. **Credential** — A suitable rental credential may be issued for future verification, subject to the platform's policies and user consent.

Physical handovers, evidence review, and disputes still require real-world processes. Blockchain alone cannot establish the truth of an event or recover a missing item.

---

## 🏗️ Planned Technology Stack

The architecture is subject to change as development progresses.

| Layer | Planned Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Backend | TypeScript, Node.js |
| Database | PostgreSQL |
| Blockchain | Solana |
| Smart Contract | Rust with Anchor |
| Transaction Logic | On-chain escrow and settlement |
| Application Data | Off-chain listings, calendars, and evidence |
| Credentials | Signed, verifiable rental credentials |

Only public, non-sensitive transaction state should be considered for on-chain storage. Personal data, contact details, and sensitive evidence should remain off-chain.

---

## 🗺️ Roadmap

- [ ] Set up the project repository and development environment
- [ ] Build the initial marketplace UI
- [ ] Implement item listings and availability
- [ ] Develop booking and rental lifecycle flows
- [ ] Design and test Solana escrow functionality on devnet
- [ ] Implement handover and return evidence workflows
- [ ] Prototype PlanetPass credential issuance and verification
- [ ] Add dispute handling, correction, and appeal workflows
- [ ] Test cross-platform credential verification
- [ ] Pilot with a college community

---

## 🔒 Trust, Privacy & Safety

We want sharing to be safer without creating a public reputation blacklist.

Our design goals include:

- No sensitive personal information stored on-chain.
- Clear consent before sharing credentials with another platform.
- A distinction between allegations and substantiated findings.
- Correction and appeal paths for disputed records.
- Context-aware decisions instead of treating a trust score as a guarantee.
- Clear rental terms, evidence, and human review for disputes.

---

## 🌍 Vision

We believe the future is not only about owning more things, but making better use of the resources already around us.

**Borrow the Planet** aims to make borrowing easier, sharing safer, and trust more portable across communities.

**Built for the Solana ecosystem. Designed for a more collaborative world.**

---

## 📌 Project Status

This project is in its early setup and development stage. The repository will evolve as we build and test the marketplace, Solana program, and PlanetPass prototype.

Contributions, feedback, and collaboration are welcome as the project takes shape.

### Project Name
**Borrow the Planet**

### Core Differentiator
**PlanetPass — portable, privacy-conscious rental trust.**
