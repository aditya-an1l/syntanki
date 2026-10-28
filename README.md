<div align="center">
  <img src="./media/logo.svg" width="250" height="250" alt="Syntanki Logo">
</div>
<div align="center">
  <h1>Syntanki</h1>
  <p>Spaced repetition for coding interviews. Paste code, get atomic recall cards. Offline-first, no AI.</p>
</div>

<div align="center">
  <p>
    <a href="https://github.com/aditya-an1l/syntanki/pulse">
      <img alt="Last commit" src="https://img.shields.io/github/last-commit/aditya-an1l/syntanki?style=for-the-badge&logo=git&color=1DA1F2&logoColor=FFFFFF&labelColor=000000"/>
    </a>
    <a href="https://github.com/aditya-an1l/syntanki/blob/main/LICENSE">
      <img alt="License" src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=opensourceinitiative" />
    </a>
    <a href="https://github.com/aditya-an1l/syntanki/stargazers">
      <img alt="Stars" src="https://img.shields.io/github/stars/aditya-an1l/syntanki?style=for-the-badge&logo=starship&color=1DA1F2&logoColor=FFFFFF&labelColor=000000" />
    </a>
    <a href="https://github.com/aditya-an1l/syntanki/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/aditya-an1l/syntanki?style=for-the-badge&logo=gitbook&color=FF4136&logoColor=FFFFFF&labelColor=000000" />
    </a>
    <a href="https://github.com/aditya-an1l/syntanki/actions/workflows/ci.yml">
      <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/aditya-an1l/syntanki/ci.yml?branch=main&style=for-the-badge&logo=githubactions&logoColor=FFFFFF&labelColor=000000&color=1DA1F2" />
    </a>
    <a href="https://github.com/aditya-an1l/syntanki">
      <img alt="Repo Size" src="https://img.shields.io/github/repo-size/aditya-an1l/syntanki?color=1DA1F2&label=SIZE&logo=files&style=for-the-badge&logoColor=FFFFFF&labelColor=000000" />
    </a>
    <a href="https://twitter.com/intent/follow?screen_name=aditya_an1l">
      <img alt="follow on X" src="https://img.shields.io/twitter/follow/aditya_an1l?style=for-the-badge&logo=x&color=1DA1F2&logoColor=FFFFFF&labelColor=000000" />
    </a>
  </p>
</div>

## Overview

Syntanki is an Anki-for-code PWA. Paste code (or import from a public GitHub repo) and it deterministically generates atomic cloze-code cards scheduled with FSRS, reviewed offline-first in the browser (IndexedDB). It acts as a spaced-repetition system for coding interviews — DSA, LeetCode, and language fundamentals — with zero AI required by default.

## Features

- **Deterministic cloze parser** — Regex/heuristic tokenizer turns code snippets into atomic cloze cards without AI. Supports Python, JS/TS, Java, C++, Rust, Go, Ruby, CSS, SQL, Bash, and HTML with auto-detection.
- **FSRS scheduling** — Uses the ts-fsrs library for research-backed stability/difficulty scheduling. One fact per card, 10-second rule enforced.
- **Offline-first PWA** — Service worker precaches routes; all decks, cards, and reviews live in IndexedDB. Works on iOS Add-to-Home-Screen with no network after install.
- **Shiki syntax highlighting** — Code on cards is syntax-highlighted at runtime.
- **JSON export / import** — Versioned deck backups preserving FSRS state and review history. Doubles as manual cross-device sync (opt-in, Last-Write-Wins by client timestamp).
- **GitHub import** — Paste a public repo URL; README code blocks become cards.
- **Newbie onboarding** — Guided 3-step flow: welcome → first deck → first review.

## Installation

```bash
# Clone the repository:
git clone https://github.com/aditya-an1l/syntanki.git
cd syntanki

# Install dependencies:
npm install

# Run the dev server:
npm run dev

# Build for production:
npm run build
```

## Usage

1. **Create a deck** — Click "Create/Import" on the home page, or let curated starter decks seed on first load.
2. **Import code** — Paste a snippet on the Import page; cards are generated and language is auto-detected. Or import from a public GitHub repo URL.
3. **Review** — Click "Review" on a deck. Grade each card (Again / Hard / Good / Easy). FSRS reschedules it based on your performance.
4. **Track progress** — View stats: retention %, due counts, and a 30-day retention curve.
5. **Back up** — Export any deck to JSON; import it on another device to sync manually.

## Running Tests

```bash
# Run the test suite:
npm test
```

## Notes

- **No AI by default** — Card generation is deterministic. AI instructor features are optional and off by default; BYOK keys live in browser localStorage only.
- **No backend** — All data stays local in IndexedDB. No server, no auth, no cloud sync in V1.
- **Offline-first** — Review queue, decks, and stats work with no network after first install.
