// empty input fields don't submit; they get told off instead
export const EMPTY_HINT = 'lol, type something stoopid';

// shows the hint under an empty field and shakes it; returns true when the field was empty
export function nudgeIfEmpty(input: HTMLInputElement, hint: HTMLElement): boolean {
  if (input.value.trim()) {
    hint.hidden = true;
    return false;
  }
  hint.textContent = EMPTY_HINT;
  hint.hidden = false;
  // restart the shake even if it is already playing
  input.classList.remove('shake');
  void input.offsetWidth;
  input.classList.add('shake');
  input.focus({ preventScroll: true });
  return true;
}

// the hint goes away as soon as something is typed
export function clearHintOnInput(input: HTMLInputElement, hint: HTMLElement): void {
  input.addEventListener('input', () => {
    if (input.value.trim()) hint.hidden = true;
  });
}
