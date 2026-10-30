document.addEventListener('DOMContentLoaded', async () => {
  const cardsView = document.getElementById('cards-view');
  const tableView = document.getElementById('table-view');
  const tableBody = document.getElementById('table-body');
  const troopFilter = document.getElementById('troop-filter');
  const levelSearch = document.getElementById('level-search');
  const resultCount = document.getElementById('result-count');
  const emptyState = document.getElementById('empty-state');
  const resetButton = document.getElementById('reset-button');
  const viewButtons = document.querySelectorAll('.view-button');

  const rewardFields = [
    ['龍甲片', 'dragonArmor'],
    ['伝説名士の欠片', 'shards'],
    ['虎杢', 'wood'],
    ['賢才召募札', 'recruit'],
    ['捕獲縄', 'rope'],
    ['精研の巻物', 'scroll'],
    ['資源札', 'resource']
  ];

  let allData = [];
  let currentView = window.matchMedia('(max-width: 640px)').matches ? 'cards' : 'table';

  function setView(view) {
    currentView = view;
    cardsView.hidden = view !== 'cards';
    tableView.hidden = view !== 'table';
    viewButtons.forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    render();
  }

  function cardTemplate(item) {
    const rewards = rewardFields.map(([label, key]) => `
      <div class="reward-item">
        <span class="reward-name">${label}</span>
        <span class="reward-value">${item[key]}</span>
      </div>`).join('');
    return `
      <article class="reward-card">
        <div class="card-top">
          <span class="level-label">LEVEL ${item.level}</span>
          <span class="troop-badge troop-${item.troop}">${item.troop}</span>
        </div>
        <div class="power-block">
          <span class="power-caption">戦力値</span>
          <strong class="power-value">${item.power}</strong>
        </div>
        <div class="reward-grid">${rewards}</div>
      </article>`;
  }

  function tableRow(item) {
    return `<tr>
      <td><strong>Lv.${item.level}</strong></td>
      <td>${item.power}</td>
      <td><span class="troop-badge troop-${item.troop}">${item.troop}</span></td>
      <td>${item.dragonArmor}</td><td>${item.shards}</td><td>${item.wood}</td>
      <td>${item.recruit}</td><td>${item.rope}</td><td>${item.scroll}</td><td>${item.resource}</td>
    </tr>`;
  }

  function render() {
    const troop = troopFilter.value;
    const levelText = levelSearch.value.trim();
    const level = levelText === '' ? null : Number(levelText);
    const filtered = allData.filter(item => {
      const troopMatch = troop === 'all' || item.troop === troop;
      const levelMatch = level === null || item.level === level;
      return troopMatch && levelMatch;
    });

    resultCount.textContent = `${filtered.length}件表示 / 全${allData.length}件`;
    cardsView.innerHTML = filtered.map(cardTemplate).join('');
    tableBody.innerHTML = filtered.map(tableRow).join('');
    emptyState.hidden = filtered.length !== 0;
  }

  viewButtons.forEach(button => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });
  troopFilter.addEventListener('change', render);
  levelSearch.addEventListener('input', render);
  resetButton.addEventListener('click', () => {
    troopFilter.value = 'all';
    levelSearch.value = '';
    render();
  });

  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    allData = await response.json();
    allData.sort((a, b) => a.level - b.level);
    setView(currentView);
  } catch (error) {
    console.error('データの読み込みに失敗しました:', error);
    resultCount.textContent = 'データを読み込めませんでした';
    emptyState.hidden = false;
    emptyState.textContent = 'data.jsonを読み込めません。4つのファイルを同じフォルダに置いてください。';
  }
});
