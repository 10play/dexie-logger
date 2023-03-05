export const stringToDOM = (el) => {
    const container = document.createElement('div');
    container.innerHTML = el;
    return container.firstChild;
};
