const header = document.getElementById('header');
const toggleButton = document.getElementById('tgleBtn');
const icon = document.getElementById('icon');

toggleButton.addEventListener('click', () => {
    if (header.style.backgroundColor === 'rgb(4, 205, 118)') {
        header.style.backgroundColor = '';
    } else {
        header.style.backgroundColor = '#04cd76'; 
    }
    if (icon.classList.contains('fa-sun')) {
        icon.classList.remove('fa-sun');
        icon.classList.add('fa-moon');
    } else {
        icon.classList.remove('fa-moon');
        icon.classList.add('fa-sun');
    }
});

