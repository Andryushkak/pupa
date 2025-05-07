document.addEventListener("DOMContentLoaded", function() {
    
    setTimeout(function() {
        window.location.href = "/home";
    }, 3000);

    
    const letters = document.querySelectorAll(".letter-animation");
    letters.forEach(letter => {
        const delay = Math.random() * 2;
        letter.style.animationDelay = `${delay}s`;
    });
});
