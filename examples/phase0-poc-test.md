# Phase 0 PoC Test - Simple Flashcards

This note demonstrates the Phase 0 Proof of Concept for the Flashly plugin.

## Math Flashcards

What is 2+2::4

What is the square root of 16::4

What is 10 * 5::50

## Science Flashcards

What is the speed of light::299,792,458 meters per second

What is H2O::Water

What is the powerhouse of the cell::Mitochondria

## Geography Flashcards

What is the capital of France::Paris

What is the largest ocean::Pacific Ocean

What is the tallest mountain::Mount Everest

---

## How to Test

1. Open this note in Obsidian
2. Run the command: "Scan Active Note (Phase 0 PoC)" from the command palette (Ctrl/Cmd + P)
3. The plugin will parse all Q::A format flashcards
4. A review modal will appear showing the first card
5. Click "Show Answer" to reveal the answer
6. Rate the card (Again, Hard, Good, or Easy)
7. See the next review date calculated by FSRS algorithm

## Expected Results

- ✅ Should find 9 flashcards
- ✅ Modal displays question and answer
- ✅ Rating buttons show different intervals
- ✅ FSRS algorithm calculates next review dates
- ✅ Success message shows when card is rated
