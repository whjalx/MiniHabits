

  let habits = JSON.parse(localStorage.getItem('habits')) || [];
  habits.push(habit);
  localStorage.setItem('habits', JSON.stringify(habits));

  // Limpiar el formulario
  habitFinalInput.value = '';
  miniHabitsInput.value = '';
  progressiveHabitsContainer.innerHTML = '';

  alert('El hábito ha sido guardado exitosamente.');
});

// Manejar el clic en el botón "Agregar hábitos progresivos"
addProgressiveHabitButton.addEventListener('click', function() {
  const input = document.createElement('input');
  input.type = 'text';
  input.classList.add('progressive-habit');
  input.placeholder = 'Hábito progresivo';
  progressiveHabitsContainer.appendChild(input);
});

// Manejar el clic en el botón "Lista de hábitos / Agregar más hábitos"
viewHabitsButton.addEventListener('click', function() {
  populateHabitList();
  habitListContainer.style.display = 'block';
  document.getElementById('main-container').style.display = 'none';
});

// Manejar el clic en el botón "Hábitos por cumplir hoy"
viewTodayHabitsButton.addEventListener('click', function() {
  populateHabitList();
  habitListContainer.style.display = 'block';
  document.getElementById('main-container').style.display = 'none';
});

// Mostrar los hábitos en la lista
function populateHabitList() {
  const habits = JSON.parse(localStorage.getItem('habits')) || [];

  habitList.innerHTML = '';

  habits.forEach(function(habit) {
    const li = document.createElement('li');
    li.innerHTML = `<input type="checkbox"> ${habit.habitFinal} (${habit.miniHabits})`;

    habitList.appendChild(li);
  });
}
