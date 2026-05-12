document.addEventListener('DOMContentLoaded', () => {
    const videoElement = document.getElementById('camera-feed');
    const scanBtn = document.getElementById('scan-btn');
    const resultsPanel = document.getElementById('results-panel');
    const locationData = document.getElementById('location-data');
    const aiData = document.getElementById('ai-data');

    // 1. Start the device camera
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: "environment" } // Prefers back camera on mobile
            });
            videoElement.srcObject = stream;
        } catch (error) {
            console.error("Camera access denied or unavailable.", error);
            alert("Please allow camera access to scan items.");
        }
    }

    startCamera();

    // 2. Handle the Scan Action
    scanBtn.addEventListener('click', () => {
        // Show the results panel loading state
        resultsPanel.classList.remove('hidden');
        scanBtn.innerText = "Scanning...";
        scanBtn.disabled = true;

        // Get Location
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude.toFixed(4);
                    const lng = position.coords.longitude.toFixed(4);
                    locationData.innerText = `Lat: ${lat}, Lng: ${lng} (Verified Endpoint)`;
                },
                (error) => {
                    locationData.innerText = "Location access denied.";
                }
            );
        } else {
            locationData.innerText = "Geolocation not supported.";
        }

        // Simulate sending image to Gemini API
        // WARNING: Never put your real Gemini API key in client-side JavaScript!
        setTimeout(() => {
            aiData.innerHTML = `
                Estimated Use: 2.5 Years<br>
                Carbon Lifecycle Savings: <strong>40% Reduction</strong><br>
                Status: Added to Immutable Ledger
            `;
            scanBtn.innerText = "Scan Another Asset";
            scanBtn.disabled = false;
        }, 2500); // Fakes a 2.5 second network request
    });
});