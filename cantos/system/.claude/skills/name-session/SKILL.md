---
name: name-session
description: Use when you want to name the current session based on the active assistant and topics covered so far.
user-invocable: true
---

Look at the conversation so far — what assistant is active, what topics have been discussed, what work has been done.

Output exactly one line in this format:

**Session: [AssistantName] | [Short title]**

- AssistantName: the active assistant (Cantos, Folio, Lyren, Pylon). Use Cantos if no assistant has been activated.
- Short title: 3–5 words capturing what this session has actually been about, not what it started as.

Output nothing else.
