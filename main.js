let listMiniHabit = [];
const addMiniHabit = () => {
    const newMiniHabit = document.getElementById('MiniHabit').value;
    const miniHabitList = document.getElementById('miniHabitList');
    const newMiniHabitElement = document.createElement('p');
    newMiniHabitElement.textContent = newMiniHabit;
    miniHabitList.appendChild(newMiniHabitElement);
    listMiniHabit.push(newMiniHabit);
    document.getElementById('MiniHabit').value = '';
    console.log(listMiniHabit);
};

const addHabit = () => {
    const newHabit = document.getElementById('newHabit').value;
    localStorage.setItem(newHabit, JSON.stringify(listMiniHabit));
    hfu = localStorage.getItem('hfu');
    localStorage.setItem('hfu', hfu += " " + newHabit );
} 

if (localStorage.getItem('hfu') === null) {
    localStorage.setItem('hfu', ' ');
}