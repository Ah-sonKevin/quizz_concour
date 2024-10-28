function loadCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = '/style.css';
    document.head.appendChild(link);
}

document.addEventListener('DOMContentLoaded', function() {
    loadCSS();
    fetch('/header.html')
        .then(response => response.text())
        .then(data => {
            // Parse the HTML content
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, 'text/html');
            
            // Get head content
            const headContent = doc.querySelector('head').innerHTML;
            document.head.insertAdjacentHTML('beforeend', headContent);
            
            // Get nav content
            const navContent = doc.querySelector('nav').outerHTML;
            document.getElementById('header-placeholder').innerHTML = navContent;
            
            // Set the title if it exists in the main document
            const title = document.querySelector('title').textContent;
            if (title) {
                document.title = title;
            }
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
});

// Export if needed
export {};
