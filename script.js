const IMAGE_STORAGE_KEY = "background_images";
const IMAGE_INDEX_KEY = "background_image_index";
const TOTAL_IMAGES = 50;
const SWITCH_INTERVAL = 10000; // 15 seconds
const UNSPLASH_API_URL = "https://api.unsplash.com/photos/random?count=100&client_id=pVOfyft4uIqDTj1G6DS0_-Q-NpoYqwIUveQtDRCgGTM";

document.addEventListener("DOMContentLoaded", () => {
    updateBackgroundImage();
});

function updateBackgroundImage() {
    chrome.storage.local.get([IMAGE_STORAGE_KEY, IMAGE_INDEX_KEY], (data) => {
        let images = data[IMAGE_STORAGE_KEY] || [];
        let index = data[IMAGE_INDEX_KEY] || 0;

        // If images are empty, fetch new images
        if (images.length === 0) {
            fetchNewImages();
            return;
        }

        // Set background to current image
        document.querySelector(".front").style.backgroundImage = `url(${images[index]})`;
        document.querySelector(".back").style.backgroundImage = `url(${images[index+1]})`;

        document.querySelector(".front").classList.add("fadeout");

        // Remove the displayed image
        images.splice(index, 1);

        // If no images left, fetch new ones
        if (images.length === 0) {
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
            let imageUrls = data.map(photo => photo.urls.raw);

            if (imageUrls.length === 0) {
                console.error("No images found in API response");
                return;
            }

            // Save images and reset index
            chrome.storage.local.set({ [IMAGE_STORAGE_KEY]: imageUrls, [IMAGE_INDEX_KEY]: 0 }, () => {
                updateBackgroundImage();
            });
        })
        .catch(error => {
            console.error("Error fetching images:", error);
        });
}


document.addEventListener("DOMContentLoaded", () => {
  fetch("https://bible-api.com/john+3:16")
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("bible-quote").innerText = data.text;
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
