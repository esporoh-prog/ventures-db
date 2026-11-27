// Published links are owned by the idea database. A profile stays usable when it is offline.
window.loadIdeaLinks = async function (section, key, language) {
  const base = 'https://smotrini-idea-base-main.vercel.app';
  const ru = language === 'ru';
  const element = (tag, text) => {
    const el = document.createElement(tag);
    if (text) el.textContent = text;
    return el;
  };
  function link(text, path) {
    const el = element('a', text);
    el.href = new URL(path, base).href;
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
    return el;
  }
  try {
    const response = await fetch(base + '/api/startup-links?' + new URLSearchParams({startup: key}), {signal: AbortSignal.timeout(25000)});
    if (!response.ok) throw new Error('unavailable');
    const data = await response.json();
    if (!section.isConnected) return;
    if (!data.enabled) {
      const tab = document.getElementById('pt-ideas');
      if (tab.getAttribute('aria-selected') === 'true') showProfileTab('overview', true);
      tab.remove();
      section.closest('[role="tabpanel"]').remove();
      return;
    }
    section.replaceChildren(element('h3', ru ? 'Идеи команды' : 'Team ideas'));
    function renderList(links) {
      const ul = element('ul');
      for (const idea of links) {
        if (!/^\/(?:idea\/|\?item=)/.test(idea.href)) continue;
        const li = element('li');
        li.append(link(idea.name, idea.href), element('small', idea.status + ' · ' + idea.reason));
        if (idea.decision) li.append(element('p', idea.decision));
        ul.append(li);
      }
      return ul;
    }
    const primary = data.links.filter(item => item.kind !== 'related');
    if (primary.length) section.append(renderList(primary));
    else section.append(element('p', ru ? 'Прямых связей с идеями пока нет.' : 'No direct idea matches yet.'));
    const related = data.links.filter(item => item.kind === 'related');
    if (related.length) {
      const details = element('details');
      details.append(element('summary', (ru ? 'Смежные идеи' : 'Related ideas') + ' · ' + related.length), renderList(related));
      section.append(details);
    }
    section.append(link(ru ? 'Создать идею на основе стартапа ↗' : 'Create an idea from this startup ↗', '/new?' + new URLSearchParams({startup:key})));
    section.hidden = false;
  } catch {
    if (!section.isConnected) return;
    section.replaceChildren(element('p', ru ? 'Связи с базой идей временно недоступны.' : 'Idea links are temporarily unavailable.'));
    const retry = element('button', ru ? 'Повторить' : 'Retry');
    retry.type = 'button';
    retry.onclick = () => { retry.disabled = true; window.loadIdeaLinks(section, key, language); };
    section.append(retry);
    section.hidden = false;
  }
};
