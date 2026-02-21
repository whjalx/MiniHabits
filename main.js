// main.js - Logic for Mini Habits Suite

// State
let habits = [];
let editingHabitId = null;
let currentModalMiniHabits = [];

// DOM Elements
const currentDateDisplay = document.getElementById('currentDateDisplay');
const habitsContainer = document.getElementById('habitsContainer');
const habitModal = document.getElementById('habitModal');
const addHabitBtn = document.getElementById('addHabitBtn');
const closeModalBtns = document.querySelectorAll('.close-modal');
const saveHabitBtn = document.getElementById('saveHabitBtn');
const habitNameInput = document.getElementById('habitName');
const miniHabitInput = document.getElementById('miniHabitInput');
const addMiniHabitBtn = document.getElementById('addMiniHabitBtn');
const modalMiniHabitsList = document.getElementById('modalMiniHabitsList');
const modalTitle = document.getElementById('modalTitle');
const toastContainer = document.getElementById('toastContainer');

const exportBtn = document.getElementById('exportBtn');
const importBtnTrigger = document.getElementById('importBtnTrigger');
const importInput = document.getElementById('importInput');

// Init
function init() {
    // Set Header Date
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateDisplay.textContent = new Date().toLocaleDateString('es-ES', options);

    loadData();
    renderHabits();
    setupEventListeners();
}

// Data Management
function loadData() {
    const data = localStorage.getItem('miniHabitsData');
    if (data) {
        try {
            habits = JSON.parse(data);
        } catch (e) {
            console.error("Error parsing data", e);
            habits = [];
        }
    } else {
        // Migration from old app or initialize empty
        habits = [];
    }
}

function saveData() {
    localStorage.setItem('miniHabitsData', JSON.stringify(habits));
}

// UI Rendering
function renderHabits() {
    habitsContainer.innerHTML = '';

    if (habits.length === 0) {
        habitsContainer.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; color: var(--text-secondary); padding: 3rem;">
                <i class="fa-solid fa-leaf" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <p>No tienes ningún hábito configurado. ¡Comienza creando uno!</p>
            </div>
        `;
        return;
    }

    const todayStr = new Date().toISOString().split('T')[0];

    habits.forEach(habit => {
        const card = document.createElement('div');
        card.className = 'habit-card';

        // Calculate progress for today
        const total = habit.miniHabits.length;
        const completed = habit.miniHabits.filter(mh => mh.completedDates && mh.completedDates.includes(todayStr)).length;
        const progressPercent = total === 0 ? 0 : (completed / total) * 100;

        card.innerHTML = `
            <div class="habit-header">
                <div class="habit-title">${escapeHTML(habit.title)}</div>
                <div class="habit-actions">
                    <button onclick="deleteHabit('${habit.id}')" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
                </div>
            </div>
            <ul class="mini-habits-list">
                ${habit.miniHabits.map(mh => {
            const isCompleted = mh.completedDates && mh.completedDates.includes(todayStr);
            return `
                    <li class="mini-habit-item ${isCompleted ? 'completed' : ''}" onclick="toggleMiniHabit('${habit.id}', '${mh.id}')">
                        <div class="checkbox"></div>
                        <span>${escapeHTML(mh.title)}</span>
                    </li>
                    `;
        }).join('')}
            </ul>
            <div class="progress-bar-container">
                <div class="progress-bar" style="width: ${progressPercent}%"></div>
            </div>
        `;
        habitsContainer.appendChild(card);
    });
}

function renderModalMiniHabits() {
    modalMiniHabitsList.innerHTML = '';
    currentModalMiniHabits.forEach(mh => {
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${escapeHTML(mh.title)}</span>
            <button type="button" onclick="removeDraftMiniHabit('${mh.id}')"><i class="fa-solid fa-xmark"></i></button>
        `;
        modalMiniHabitsList.appendChild(li);
    });
}

// Logic Actions
function toggleMiniHabit(habitId, miniHabitId) {
    const todayStr = new Date().toISOString().split('T')[0];
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const miniHabit = habit.miniHabits.find(mh => mh.id === miniHabitId);
    if (!miniHabit) return;

    if (!miniHabit.completedDates) {
        miniHabit.completedDates = [];
    }

    if (miniHabit.completedDates.includes(todayStr)) {
        miniHabit.completedDates = miniHabit.completedDates.filter(d => d !== todayStr);
    } else {
        miniHabit.completedDates.push(todayStr);
        // Play success sound or vibe? We'll just show a toast if fully completed
        checkHabitCompletion(habit, todayStr);
    }

    saveData();
    renderHabits();
}

function checkHabitCompletion(habit, todayStr) {
    const total = habit.miniHabits.length;
    const completed = habit.miniHabits.filter(mh => mh.completedDates && mh.completedDates.includes(todayStr)).length;
    if (total > 0 && total === completed) {
        showToast(`¡Excelente! Has completado todos los mini hábitos de "${habit.title}" hoy.`);
    }
}

function deleteHabit(id) {
    if (confirm('¿Seguro que deseas eliminar este hábito?')) {
        habits = habits.filter(h => h.id !== id);
        saveData();
        renderHabits();
        showToast('Hábito eliminado');
    }
}

// Modal Form handling
function openModal() {
    editingHabitId = null;
    modalTitle.textContent = "Nuevo Hábito";
    habitNameInput.value = '';
    miniHabitInput.value = '';
    currentModalMiniHabits = [];
    renderModalMiniHabits();
    habitModal.classList.remove('hidden');
    habitNameInput.focus();
}

function closeModal() {
    habitModal.classList.add('hidden');
}

function addDraftMiniHabit() {
    const val = miniHabitInput.value.trim();
    if (val) {
        currentModalMiniHabits.push({
            id: generateId(),
            title: val,
            completedDates: []
        });
        miniHabitInput.value = '';
        renderModalMiniHabits();
        miniHabitInput.focus();
    }
}

// Needed because it's called from inline HTML
window.removeDraftMiniHabit = function (id) {
    currentModalMiniHabits = currentModalMiniHabits.filter(mh => mh.id !== id);
    renderModalMiniHabits();
}
window.deleteHabit = deleteHabit;
window.toggleMiniHabit = toggleMiniHabit;

function saveHabit() {
    const title = habitNameInput.value.trim();
    if (!title) {
        alert("Por favor ingresa un nombre para el hábito.");
        return;
    }

    if (currentModalMiniHabits.length === 0) {
        alert("Agrega al menos un mini hábito.");
        return;
    }

    const newHabit = {
        id: editingHabitId || generateId(),
        title: title,
        miniHabits: currentModalMiniHabits,
        createdAt: new Date().toISOString()
    };

    if (editingHabitId) {
        const index = habits.findIndex(h => h.id === editingHabitId);
        habits[index] = newHabit;
    } else {
        habits.push(newHabit);
    }

    saveData();
    renderHabits();
    closeModal();
    showToast('Hábito guardado correctamente');
}

// Import & Export
function exportData() {
    const dataStr = JSON.stringify(habits, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

    const exportFileDefaultName = `minihabits_backup_${new Date().toISOString().split('T')[0]}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    showToast('Datos exportados exitosamente');
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const contents = e.target.result;
            const parsed = JSON.parse(contents);
            if (Array.isArray(parsed)) {
                // Basic validation
                habits = parsed;
                saveData();
                renderHabits();
                showToast('Datos importados correctamente');
            } else {
                throw new Error("Invalid format");
            }
        } catch (error) {
            console.error(error);
            alert("Error al importar el archivo. El formato no es válido.");
        }
        // clear input
        event.target.value = '';
    };
    reader.readAsText(file);
}

// Utilities
function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Event Listeners
function setupEventListeners() {
    addHabitBtn.addEventListener('click', openModal);

    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Close on overlay click
    habitModal.addEventListener('click', (e) => {
        if (e.target === habitModal) {
            closeModal();
        }
    });

    addMiniHabitBtn.addEventListener('click', addDraftMiniHabit);

    miniHabitInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addDraftMiniHabit();
        }
    });

    saveHabitBtn.addEventListener('click', saveHabit);

    exportBtn.addEventListener('click', exportData);

    importBtnTrigger.addEventListener('click', () => {
        importInput.click();
    });

    importInput.addEventListener('change', importData);
}

// Run app
document.addEventListener('DOMContentLoaded', init);