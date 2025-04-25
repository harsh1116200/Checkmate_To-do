document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const errorMessage = document.getElementById('error-message');

    // Clear previous error message
    errorMessage.textContent = '';
    errorMessage.style.display = 'none';

    // Simple validation
    if (!email || !password) {
        errorMessage.textContent = 'Both fields are required.';
        errorMessage.style.display = 'block';
        return;
    }

    if (!validateEmail(email)) {
        errorMessage.textContent = 'Please enter a valid email.';
        errorMessage.style.display = 'block';
        return;
    }

    try {
        // Send login request to backend
        const response = await fetch('http://localhost:3000/login', { // Change to your deployed URL if needed
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (response.ok) {
            // Store JWT token in localStorage
            localStorage.setItem('token', data.token);

            // Redirect to dashboard
            window.location.href = 'index1.html';
        } else {
            errorMessage.textContent = data.error || 'Invalid email or password.';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.textContent = 'Server error. Please try again later.';
        errorMessage.style.display = 'block';
    }
});

// Email validation function
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return re.test(String(email).toLowerCase());
}
