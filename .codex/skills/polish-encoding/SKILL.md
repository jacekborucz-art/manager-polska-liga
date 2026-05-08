---
name: polish-encoding
description: Use when working in this TypeScript/React project on Windows 11 and reading or editing Polish-language source text in .ts or .tsx files. Enforces UTF-8 handling, direct raw Polish characters, and verification that Polish text is not escaped or garbled.
---

# Polish Encoding

Apply these rules whenever you read, edit, or create Polish-language source text in this project.

## Scope

- Treat all `.ts` and `.tsx` files as UTF-8 without BOM.
- Assume Polish text in source files is intentionally stored as raw Unicode characters.
- If tool output shows mojibake like `Ã³`, `Ä…`, or similar corruption, treat that as an output interpretation problem, not proof that the file itself is misencoded.

## Required Rules

- Write Polish characters directly as raw Unicode literals.
- Never rewrite Polish text as `\u` escapes.
- Never use HTML entities inside JS/TS string literals.
- Never run encoding helpers like `encodeURIComponent`, `escape()`, or similar on static Polish UI text.
- When editing existing Polish text, match the original text character-for-character.
- If you add or edit visible text in the game or app UI, use the text styling class `font-black italic uppercase tracking-tighter`.
- Do not use a bold alternative for that display text; keep the exact class string `font-black italic uppercase tracking-tighter` unless the surrounding component already enforces a different project-standard wrapper.

## Characters To Preserve

`ą ć ę ł ń ó ś ź ż Ą Ć Ę Ł Ń Ó Ś Ź Ż`

## Correct Examples

- `"Zawodnik nie może grać"`
- `"Zarząd klubu"`
- `"Wpływ dyrektora na zarząd"`

## Incorrect Examples

- `"Zawodnik nie mo\u017Ce gra\u0107"`
- `"Zarz\u0105d klubu"`
- `"Wp&#322;yw dyrektora na zarz&#261;d"`

## Editing Workflow

1. Read the target file normally.
2. If Polish text looks garbled in tool output, do not normalize it into escapes.
3. If you add user-facing UI text, apply the class `font-black italic uppercase tracking-tighter` unless an existing local pattern already handles that styling.
4. Edit using intended Polish characters as raw text.
5. After writing, read the file back and confirm the Polish text appears as characters, not escape sequences.

## Verification

After changing a file that contains Polish text, verify:

- the file still contains raw Polish characters
- no new `\uXXXX` escapes were introduced for static Polish text
- no mojibake such as `Ã³` or `Ä™` was introduced by the edit
