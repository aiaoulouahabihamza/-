// --- STATE AND TYPES ---

interface Dhikr {
  id: number;
  name: string;
  goal: number;
  dailyCount: number;
  color: string;
}

interface Achievement {
  id: 'beginner' | 'consistent' | 'master' | 'enlightened';
  name: string;
  icon: string;
  threshold: number;
  unlockedDate: string | null;
}

interface AppState {
  dhikrs: Dhikr[];
  activeDhikrId: number;
  totalCount: number;
  streak: number;
  lastVisitDate: string; // YYYY-MM-DD
  achievements: Achievement[];
  theme: 'light' | 'dark';
}

let state: AppState;

// --- ICONS (SVG) ---

const ICONS = {
    sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`,
    moon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`,
    add: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>`,
    share: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>`,
    badge: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16.22l-4.94 2.8 1.14-5.48-4.1-3.62 5.5-.66L12 4l2.4 5.26 5.5.66-4.1 3.62 1.14 5.48z"></path></svg>`,
    flame: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 9.5a5 5 0 1 0-5 5V9.5a5 5 0 1 0 5-5Z"></path><path d="M12 12a5 5 0 1 0 5 5V12a5 5 0 1 0-5 5Z"></path></svg>`,
};

// --- STATE MANAGEMENT ---

function getTodayDateString(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}

function getDefaultState(): AppState {
  const preferredTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  return {
    dhikrs: [
      { id: 1, name: 'سبحان الله', goal: 100, dailyCount: 0, color: '#a2d2ff' },
      { id: 2, name: 'الحمد لله', goal: 100, dailyCount: 0, color: '#bde0fe' },
      { id: 3, name: 'الله أكبر', goal: 100, dailyCount: 0, color: '#ffafcc' },
      { id: 4, name: 'لا إله إلا الله', goal: 100, dailyCount: 0, color: '#ffc8dd' },
    ],
    activeDhikrId: 1,
    totalCount: 0,
    streak: 0,
    lastVisitDate: getTodayDateString(),
    achievements: [
        { id: 'beginner', name: 'المبتدئ', icon: '🌱', threshold: 100, unlockedDate: null },
        { id: 'consistent', name: 'المواظب', icon: '💪', threshold: 1000, unlockedDate: null },
        { id: 'master', name: 'سيد التسبيح', icon: '👑', threshold: 10000, unlockedDate: null },
        { id: 'enlightened', name: 'الذاكر المستنير', icon: '🌟', threshold: 100000, unlockedDate: null },
    ],
    theme: preferredTheme,
  };
}

function saveState() {
  localStorage.setItem('subhatiState', JSON.stringify(state));
}

function loadState() {
  const savedState = localStorage.getItem('subhatiState');
  if (savedState) {
    state = JSON.parse(savedState);
  } else {
    state = getDefaultState();
  }
  
  // Daily reset and streak logic
  const today = new Date();
  const todayStr = getTodayDateString();
  const lastVisit = new Date(state.lastVisitDate);

  const diffTime = today.getTime() - lastVisit.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (state.lastVisitDate !== todayStr) {
    // Reset daily counts
    state.dhikrs.forEach(d => d.dailyCount = 0);
    
    // Update streak
    if (diffDays === 1) {
      state.streak += 1;
    } else if (diffDays > 1) {
      state.streak = 1;
    }
    state.lastVisitDate = todayStr;
  }
  // if it's the first visit of the day but streak is 0, set it to 1
  if (state.streak === 0) state.streak = 1;

  saveState();
}

// --- RENDERING ---

const root = document.getElementById('root') as HTMLDivElement;

function render() {
  if (!root) return;
  const activeDhikr = state.dhikrs.find(d => d.id === state.activeDhikrId) || state.dhikrs[0];
  document.documentElement.setAttribute('data-theme', state.theme);

  root.innerHTML = `
    <header class="header">
      <h1>سبحتي</h1>
      <button class="theme-toggle" aria-label="Toggle theme">
        ${state.theme === 'light' ? ICONS.moon : ICONS.sun}
      </button>
    </header>

    <main class="main-content">
      <div class="counter-wrapper">
        <div class="beads-ring"></div>
        <div class="counter-circle" role="button" tabindex="0">
          <div class="counter-number">${activeDhikr.dailyCount}</div>
          <div class="dhikr-name">${activeDhikr.name}</div>
        </div>
      </div>
      
      <section class="progress-section">
        <h2>تقدم اليوم</h2>
        <div class="dhikr-list">
          ${state.dhikrs.map(dhikr => `
            <div class="dhikr-item ${dhikr.id === activeDhikr.id ? 'active' : ''}" data-id="${dhikr.id}">
              <div class="dhikr-item-main">
                <div class="dhikr-color-dot" style="background-color: ${dhikr.color};"></div>
                <span class="dhikr-item-text">${dhikr.name}</span>
                <span class="dhikr-item-count">${dhikr.dailyCount}/${dhikr.goal}</span>
              </div>
              <div class="progress-bar-container">
                <div class="progress-bar-fill" style="width: ${Math.min((dhikr.dailyCount / dhikr.goal) * 100, 100)}%; background-color: ${dhikr.color};"></div>
              </div>
            </div>
          `).join('')}
        </div>
      </section>
    </main>
    
    <footer class="footer">
        <button class="footer-btn" id="streak-btn">
            ${ICONS.flame}
            <span class="streak-count">${state.streak}</span>
        </button>
        <button class="footer-btn" id="achievements-btn">
            ${ICONS.badge}
            <span>الأوسمة</span>
        </button>
        <button class="footer-btn" id="share-btn">
            ${ICONS.share}
            <span>مشاركة</span>
        </button>
        <button class="footer-btn" id="add-btn">
            ${ICONS.add}
            <span>إضافة</span>
        </button>
    </footer>
    <div class="modal-overlay"></div>
  `;
  
  renderBeads();
  attachEventListeners();
}

function renderBeads() {
    const ring = document.querySelector('.beads-ring');
    if (!ring) return;
    ring.innerHTML = '';
    const activeDhikr = state.dhikrs.find(d => d.id === state.activeDhikrId) || state.dhikrs[0];
    const beadCount = 33;
    const currentBead = (activeDhikr.dailyCount -1) % beadCount;
    
    for (let i = 0; i < beadCount; i++) {
        const angle = (i / beadCount) * 360;
        const bead = document.createElement('div');
        bead.className = `bead ${i === currentBead ? 'active' : ''}`;
        bead.style.transform = `rotate(${angle}deg) translate(140px)`;
        ring.appendChild(bead);
    }

    const rotation = -((activeDhikr.dailyCount-1) / beadCount) * 360;
    (ring as HTMLElement).style.transform = `rotate(${rotation}deg)`;
}

// --- EVENT HANDLERS & LOGIC ---

function attachEventListeners() {
    document.querySelector('.theme-toggle')?.addEventListener('click', handleThemeToggle);
    document.querySelector('.counter-circle')?.addEventListener('click', handleCount);
    document.querySelectorAll('.dhikr-item').forEach(item => {
        item.addEventListener('click', () => handleDhikrSwitch(parseInt(item.getAttribute('data-id')!)));
    });
    document.getElementById('add-btn')?.addEventListener('click', showAddDhikrModal);
    document.getElementById('achievements-btn')?.addEventListener('click', showAchievementsModal);
    document.getElementById('share-btn')?.addEventListener('click', handleShare);
}

function handleThemeToggle() {
    state.theme = state.theme === 'light' ? 'dark' : 'light';
    saveState();
    render();
}

function handleCount() {
    const activeDhikr = state.dhikrs.find(d => d.id === state.activeDhikrId);
    if (activeDhikr) {
        activeDhikr.dailyCount++;
        state.totalCount++;
        checkAchievements();
        saveState();
        render(); // Re-render for simplicity, could optimize to only update numbers
        if (navigator.vibrate) {
            navigator.vibrate(50); // Haptic feedback
        }
    }
}

function handleDhikrSwitch(id: number) {
    state.activeDhikrId = id;
    saveState();
    render();
}

function handleShare() {
    const activeDhikr = state.dhikrs.find(d => d.id === state.activeDhikrId) || state.dhikrs[0];
    const shareText = `أتممت ${activeDhikr.dailyCount} تسبيحة من "${activeDhikr.name}" اليوم في تطبيق سبحتي! 🙏`;
    if (navigator.share) {
        navigator.share({
            title: 'مشاركة إنجازي',
            text: shareText,
        });
    } else {
        navigator.clipboard.writeText(shareText).then(() => alert('تم نسخ الإنجاز إلى الحافظة!'));
    }
}


function checkAchievements() {
    state.achievements.forEach(ach => {
        if (!ach.unlockedDate && state.totalCount >= ach.threshold) {
            ach.unlockedDate = new Date().toLocaleDateString('ar-EG');
            // Can add a notification here later
        }
    });
}

// --- MODALS ---

function renderModal(title: string, content: string) {
    const modalOverlay = document.querySelector('.modal-overlay') as HTMLElement;
    modalOverlay.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2>${title}</h2>
                <button class="close-btn">&times;</button>
            </div>
            <div class="modal-body">${content}</div>
        </div>
    `;
    modalOverlay.classList.add('visible');
    modalOverlay.querySelector('.close-btn')?.addEventListener('click', () => modalOverlay.classList.remove('visible'));
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('visible');
        }
    });
}

function showAddDhikrModal() {
    const content = `
        <form id="add-dhikr-form">
            <input type="text" id="new-dhikr-name" placeholder="اسم الذكر" required>
            <input type="number" id="new-dhikr-goal" placeholder="الهدف اليومي" required min="1">
            <div class="modal-actions">
                <button type="button" class="btn-secondary">إلغاء</button>
                <button type="submit" class="btn-primary">إضافة</button>
            </div>
        </form>
    `;
    renderModal('إضافة ذكر جديد', content);
    
    const form = document.getElementById('add-dhikr-form');
    form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('new-dhikr-name') as HTMLInputElement;
        const goalInput = document.getElementById('new-dhikr-goal') as HTMLInputElement;
        
        const newDhikr: Dhikr = {
            id: Date.now(),
            name: nameInput.value,
            goal: parseInt(goalInput.value),
            dailyCount: 0,
            color: `#${Math.floor(Math.random()*16777215).toString(16).padStart(6, '0')}` // Random color
        };
        state.dhikrs.push(newDhikr);
        saveState();
        render();
        (document.querySelector('.modal-overlay') as HTMLElement).classList.remove('visible');
    });
    
    form?.querySelector('.btn-secondary')?.addEventListener('click', () => {
        (document.querySelector('.modal-overlay') as HTMLElement).classList.remove('visible');
    });
}

function showAchievementsModal() {
    const content = `
        <div class="achievements-list">
            ${state.achievements.map(ach => `
                <div class="achievement-item ${ach.unlockedDate ? 'unlocked' : ''}">
                    <div class="icon">${ach.icon}</div>
                    <div class="name">${ach.name}</div>
                    <div class="date">${ach.unlockedDate || `أكمل ${ach.threshold} تسبيحة`}</div>
                </div>
            `).join('')}
        </div>
    `;
    renderModal('الأوسمة والإنجازات', content);
}


// --- INITIALIZATION ---

function main() {
  loadState();
  render();
}

main();
