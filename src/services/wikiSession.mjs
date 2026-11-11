// The controller is independent from React so request/storage races can be tested.
export function createWikiSession({
  initial,
  apply,
  validate,
  getVersion,
  loadPublic,
  loadPreview,
  storage
}) {
  const key = 'renblood:wiki:preview',
    listeners = new Set();
  let publicPackage = initial,
    pending = null,
    generation = 0;
  let state = {
    previewId: null,
    warning: ''
  };
  const emit = () => listeners.forEach(listener => listener());
  const remember = id => {
    try {
      const target = storage();
      id ? target.setItem(key, id) : target.removeItem(key);
      return '';
    } catch {
      return id ? 'L’aperçu reste ouvert dans cet onglet ; sa reprise automatique est indisponible sur ce navigateur.' : '';
    }
  };
  async function refresh({
    fresh = false
  } = {}) {
    if (fresh && pending) {
      try {
        await pending;
      } catch {}
    }
    if (!pending) pending = Promise.resolve().then(loadPublic).then(value => {
      const next = validate(value);
      if (!state.previewId && next.registry.version !== getVersion()) apply(next);
      publicPackage = next;
      return structuredClone(next);
    }).finally(() => {
      pending = null;
    });
    return pending;
  }
  function begin(value, id) {
    const next = validate(value),
      previous = state;
    generation++;
    state = {
      previewId: id,
      warning: ''
    };
    try {
      apply(next);
    } catch (error) {
      state = previous;
      throw error;
    }
    state = {
      ...state,
      warning: remember(id)
    };
    emit();
  }
  async function end({
    reload = true
  } = {}) {
    generation++;
    state = {
      previewId: null,
      warning: ''
    };
    remember(null);
    apply(publicPackage);
    emit();
    if (reload) await refresh({
      fresh: true
    });
  }
  async function resume(active = () => true) {
    let id;
    try {
      id = storage().getItem(key);
    } catch {
      return;
    }
    if (!id || id === state.previewId) return;
    const expected = ++generation;
    try {
      const value = await loadPreview(id);
      if (generation !== expected || !active()) return;
      begin(value, id);
    } catch {
      if (generation === expected && active()) {
        remember(null);
        state = {
          previewId: null,
          warning: 'L’aperçu n’est plus disponible. La version publique reste affichée.'
        };
        emit();
      }
    }
  }
  return {
    refresh,
    begin,
    end,
    resume,
    cancelResume: () => {
      generation++;
    },
    subscribe: callback => {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },
    snapshot: () => state
  };
}
