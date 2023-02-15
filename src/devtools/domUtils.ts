export const stringToDOM = (el: string) => {
  const container = document.createElement('div');
  container.innerHTML = el;
  return container.firstChild as HTMLElement;
}