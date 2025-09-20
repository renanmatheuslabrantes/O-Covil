async function injectHTML(path, target, options = {}) {
  const { replace = false, position } = options;

  // if (!(target instanceof HTMLElement)) {
  //   throw new Error('O parâmetro "target" deve ser um HTMLElement.');
  // }

  const res = await fetch(path, { credentials: 'same-origin' });
  if (!res.ok) {
    throw new Error(`Falha ao carregar "${path}": ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const template = document.createElement('template');
  template.innerHTML = html.trim(); // evita nós de texto iniciais

  const fragment = template.content; // DocumentFragment

  if (replace) {
    target.replaceChildren(fragment);
    return;
  }

  // Inserção por posição (1-baseada). Considera apenas filhos Element (target.children).
  if (typeof position === 'number' && Number.isFinite(position)) {
    const idx = Math.max(1, Math.floor(position)); // garante inteiro >= 1
    const children = target.children; // HTMLCollection de Element
    if (idx <= 1) {
      target.insertBefore(fragment, children[0] || null); // null = append se vazio
    } else if (idx > children.length) {
      target.appendChild(fragment); // além do fim => append
    } else {
      target.insertBefore(fragment, children[idx - 1]);
    }
  } else {
    // Sem posição => append no final
    target.appendChild(fragment);
  }
}
