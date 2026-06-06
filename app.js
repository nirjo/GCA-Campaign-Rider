document.addEventListener('DOMContentLoaded', () => {
    const joinBtn = document.getElementById('cta-join-btn');
    const targetUrl = 'https://forms.gle/eQ4QZyUPA7s2X5Mr8';

    if (joinBtn) {
        joinBtn.addEventListener('click', () => {
            // Open the registration form in a new tab/window
            window.open(targetUrl, '_blank', 'noopener,noreferrer');
            console.log('Campaign Rider CTA clicked: opening Google Form in new window.');
        });
    }
});
