window.addEventListener('scroll', () => {
    const messengerIcon = document.querySelector('.messenger-icon');
    if (window.scrollY > 100) {
        messengerIcon.style.opacity = '0';
    } else {
        messengerIcon.style.opacity = '1';
    }
});