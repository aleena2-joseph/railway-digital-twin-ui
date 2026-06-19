document.addEventListener("DOMContentLoaded", () => {

    const loginForm = document.getElementById("login-form");
    const loginBtn = document.getElementById("login-btn");
    const toggleBtn = document.getElementById("toggle-visibility");
    const passwordInput = document.getElementById("password");

    // Show / hide access key
    if (toggleBtn && passwordInput) {
        toggleBtn.addEventListener("click", () => {
            const isPassword = passwordInput.type === "password";
            passwordInput.type = isPassword ? "text" : "password";
            toggleBtn.setAttribute("aria-pressed", String(isPassword));
            toggleBtn.setAttribute("aria-label", isPassword ? "Hide access key" : "Show access key");
        });
    }

    // No authentication (demo only) — redirect to dashboard
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();

        loginBtn.classList.add("is-loading");
        loginBtn.querySelector(".btn-label").textContent = "Logging in…";
        loginBtn.disabled = true;

        setTimeout(() => {
            window.location.href = "index.html";
        }, 450);
    });

});