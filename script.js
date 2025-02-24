const IMAGE_STORAGE_KEY = "background_images";
const IMAGE_INDEX_KEY = "background_image_index";
const TOTAL_IMAGES = 50;
const SWITCH_INTERVAL = 5000; // 15 seconds
const UNSPLASH_API_URL = `https://api.unsplash.com/photos/random?query=Christianity,bible,church,god,jesus,christ,saint&count=${TOTAL_IMAGES}&client_id=pVOfyft4uIqDTj1G6DS0_-Q-NpoYqwIUveQtDRCgGTM`;

const container = document.getElementById("background-container");

document.addEventListener("DOMContentLoaded", () => {
    updateBackgroundImage();
});

function preloadImage(url, callback) {
    const img = new Image();
    img.src = url;
    img.onload = () => callback(url);
}

function updateBackgroundImage() {
    chrome.storage.local.get([IMAGE_STORAGE_KEY, IMAGE_INDEX_KEY], (data) => {
        let images = data[IMAGE_STORAGE_KEY] || [];
        let index = data[IMAGE_INDEX_KEY] || 0;

        // If images are empty, fetch new images
        if (images.length <= 1) {
            fetchNewImages();
            return;
        }

        // Set background to current image

        preloadImage(images[index].url, (newImageUrl) => {
            // Smoothly transition between images
            const newBg = document.createElement("div");
            newBg.className = "bg-layer";
            newBg.style.backgroundImage = `url(${newImageUrl})`;
      
            container.appendChild(newBg);
      
            // Fade out previous background after transition
            setTimeout(() => {
              const layers = container.querySelectorAll(".bg-layer");
              if (layers.length > 1) {
                layers[0].style.opacity = "0";
                setTimeout(() => layers[0].remove(), 2000);
              }
            }, 2000);
          });

        document.querySelector("#author-link").textContent = images[index].authorName;
        document.querySelector("#author-link").href = images[index].portfolioUrl;

        // Remove the displayed image
        images.splice(index, 1);

        // If no images left, fetch new ones
        if (images.length <= 1) {
            fetchNewImages();
        } else {
            // Store updated images and reset index
            chrome.storage.local.set({ [IMAGE_STORAGE_KEY]: images, [IMAGE_INDEX_KEY]: 0 });
            setTimeout(updateBackgroundImage, SWITCH_INTERVAL);
        }
    });
}

function fetchNewImages() {
    fetch(UNSPLASH_API_URL)
        .then(response => response.json())
        .then(data => {
            let imageUrls = data.map(photo => ({
                url: photo.urls.raw,
                authorName: photo.user.name,
                portfolioUrl: photo.user.links.portfolio
            }));

            if (imageUrls.length === 0) {
                console.error("No images found in API response");
                return;
            }

            // Save images and reset index **WITHOUT calling updateBackgroundImage immediately**
            chrome.storage.local.set({ [IMAGE_STORAGE_KEY]: imageUrls, [IMAGE_INDEX_KEY]: 0 });

            // The next `updateBackgroundImage()` call will happen naturally via setTimeout
        })
        .catch(error => {
            console.error("Error fetching images:", error);
        });
}



document.addEventListener("DOMContentLoaded", () => {
  fetch("https://bible-api.com/data/web/random")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("verse").innerText = data.random_verse.text;
      document.getElementById("reference").innerText = `${data.random_verse.book} ${data.random_verse.chapter}:${data.random_verse.verse}`
    })
    .catch(() => {
      document.getElementById("bible-quote").innerText =
        "Could not load quote.";
    });

  document.getElementById("donate-button").addEventListener("click", () => {
    let amount = prompt("Enter donation amount (USD):");
    if (amount && !isNaN(amount) && amount > 0) {
      window.open(
        `https://buy.stripe.com/test_donation_link?amount=${amount * 100}`,
        "_blank"
      );
    } else {
      alert("Please enter a valid amount.");
    }
  });
});
