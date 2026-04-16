async function loadNavFooter()
{
    const navResponse = await fetch('navbar.html'); // fetch navbar template and store the code.
    const navHtml = await navResponse.text();
    document.getElementById('navbar-placeholder').innerHTML = navHtml; // fill in the navbar code for the page. basically require once from php

    const userString = localStorage.getItem('currentUser');
    const authArea = document.getElementById('auth-area');

    if(userString)
    {
        const user = JSON.parse(userString);

        authArea.innerHTML = `<span class="navbar-text me-3 text-light small"> Welcome, <strong>${user.username}</strong></span>
        <button class="btn btn-outline-danger btn-sm" onclick="logout()">Logout</button>`;
    }
    else
    {
        authArea.innerHTML = `<a href="login.html" class="btn btn-outline-primary btn-sm me-2">Login</a>
        <a href="signup.html" class="btn btn-primary btn-sm me-2">Create Account</a>`;
    }

    const currentPath = window.location.pathname.split("/").pop() || 'index.html'; //gets all links in the navbar
    document.querySelectorAll('.nav-link').forEach(link => 
    {
        if(link.getAttribute('href') === currentPath) // if the current link is active make it bold in the navbar.
        {
            link.classList.add('active'); 
        }
    });

    const footResponse = await fetch('footer.html');
    const footHtml = await footResponse.text();
    document.getElementById('footer-placeholder').innerHTML = footHtml;
}

function logout()
{
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', loadNavFooter);