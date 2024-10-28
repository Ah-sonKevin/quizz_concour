document.addEventListener('DOMContentLoaded', function() {
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
            // Set the title if it exists
            const title = document.querySelector('title').textContent;
            if (title) {
                document.querySelector('#header-placeholder title').textContent = title;
            }
        });
});
