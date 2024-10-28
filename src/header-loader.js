document.addEventListener('DOMContentLoaded', function() {
    const headerHTML = `
        <head>
            <link rel="manifest" href="/manifest.json">
            <meta name="theme-color" content="#2196F3">
            <script>
                if ('serviceWorker' in navigator) {
                    navigator.serviceWorker.register('/service-worker.js')
                        .then(registration => {
                            console.log('ServiceWorker registration successful');
                        })
                        .catch(err => {
                            console.log('ServiceWorker registration failed: ', err);
                        });
                }
            </script>
            <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" href="/style.css">
            <title></title>
        </head>
        <nav>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="quiz.html">Quiz</a></li>
            </ul>
        </nav>`;

    // Parse the HTML content
    const parser = new DOMParser();
    const doc = parser.parseFromString(headerHTML, 'text/html');
    
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
});

// Export if needed
export {};
