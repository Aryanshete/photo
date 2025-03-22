document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
});

function checkExistingSession() {
    const token = localStorage.getItem('token');
    if (token) {
        window.location.href = '/dashboard.html';
    } else {
        setupEventListeners();
    }
}

function setupEventListeners() {
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();
            
            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                window.location.href = '/dashboard.html';
            } else {
                alert('Login failed: ' + data.message);
            }
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
}