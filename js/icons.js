const paths = {
  anvil: '<path d="M4 15h16l2 2v2H2v-2l2-2Zm4-7h8l2 5H6l2-5Zm1-4h6v4H9V4Z"/>',
  press: '<path d="M5 4h14v5H5zM3 10h18v5H3zM6 15h12v5H6z"/><path d="M9 2v2m6-2v2M9 10v5m6-5v5"/>',
  wheat: '<path d="M12 3v18M12 7c-4 0-5-3-5-4 4 0 5 3 5 4Zm0 4c4 0 5-3 5-4-4 0-5 3-5 4Zm0 4c-4 0-5-3-5-4 4 0 5 3 5 4Zm0 4c4 0 5-3 5-4-4 0-5 3-5 4Z"/>',
  crate: '<rect x="4" y="4" width="16" height="16" rx="1"/><path d="m4 8 8 5 8-5M12 13v7M7 5l5 3 5-3"/>',
  compass: '<circle cx="12" cy="12" r="8"/><path d="m15.5 8.5-2.4 5-4.6 2.1 2.4-5 4.6-2.1Z"/>',
  herb: '<path d="M12 21V11M12 13C5 12 5 5 5 5c7 0 7 8 7 8Zm0 2c7-1 7-8 7-8-7 0-7 8-7 8Z"/>',
  book: '<path d="M4 5c3-1 5 0 8 2v12c-3-2-5-3-8-2V5Zm16 0c-3-1-5 0-8 2v12c3-2 5-3 8-2V5Z"/>',
  hammer: '<path d="m14 4 6 6-3 3-2-2-8 8-3-3 8-8-2-2 4-2Z"/>',
  lyre: '<path d="M7 4h3v6c0 4-2 7-5 8M17 4h-3v6c0 4 2 7 5 8M7 4h10M8 14h8M7 20h10"/>',
  handshake: '<path d="m3 12 5-5 3 3 2-2 4 4-4 4-2-2-2 2-3-3-3-1v-3Z"/><path d="m14 14 2 2m-4-4 3 3m-5-5 3 3"/>',
  tree: '<path d="M12 21v-7M12 4c-5 0-7 4-7 7 3 0 5-1 7-3m0-4c5 0 7 4 7 7-3 0-5-1-7-3m0 4c-4 0-6 3-6 6 3 0 5-1 6-3m0-3c4 0 6 3 6 6-3 0-5-1-6-3"/>',
  scroll: '<path d="M7 4h9a3 3 0 1 1 0 6H8a3 3 0 1 0 0 6h9"/><path d="M7 4a3 3 0 1 0 0 6m9 0a3 3 0 1 1 0 6"/>',
  quill: '<path d="M19 3C11 4 7 8 6 16l-2 5 5-2C17 18 21 12 21 4l-2-1Z"/><path d="M8 17c3-4 6-7 10-10"/>',
  seal: '<circle cx="12" cy="10" r="6"/><path d="m9 15-2 6 5-3 5 3-2-6"/>',
  hourglass: '<path d="M6 3h12M6 21h12M7 3c0 5 3 5 5 9 2-4 5-4 5-9M7 21c0-5 3-5 5-9 2 4 5 4 5 9"/>',
  links: '<path d="M9 15 7 17a4 4 0 0 1-6-6l3-3a4 4 0 0 1 6 0l1 1M15 9l2-2a4 4 0 0 1 6 6l-3 3a4 4 0 0 1-6 0l-1-1M8 12h8"/>',
  torch: '<path d="M9 21h6M10 17h4v4h-4zM12 3c4 4 3 8 0 11-3-3-4-7 0-11Z"/>'
};

export function icon(name, className = '') {
  const markup = paths[name] || paths.seal;
  return `<svg class="icon ${className}" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${markup}</svg>`;
}
