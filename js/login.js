document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        // No authentication (demo only)
        // Redirect to dashboard

        window.location.href = "index.html";
    });

});