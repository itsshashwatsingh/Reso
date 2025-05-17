// Ensure this script runs after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  const cardContainer = document.getElementById("cardcontainer");

  // Function to load albums
  async function loadAlbums() {
    try {
      // Fetch the list of album folders
      const res = await fetch("/songs/index.json");
      const folders = await res.json();

      // Iterate over each folder to fetch its metadata and render the card
      for (const folder of folders) {
        try {
          const metaRes = await fetch(`/songs/${folder}/info.json`);
          const meta = await metaRes.json();

          // Create the card element
          const card = document.createElement("div");
          card.className = "card";
          card.dataset.folder = folder;
          card.innerHTML = `
            <img src="/songs/${folder}/cover.gif" alt="${meta.title} Cover">
            <div class="play">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#af2896"/>
                <path d="M18 34V14L34 24L18 34Z" fill="black"/>
              </svg>
            </div>
            <h2>${meta.title}</h2>
            <p>${meta.discription}</p>
          `;

          // Append the card to the container
          cardContainer.appendChild(card);

          // Add click event listener to the card
          card.addEventListener("click", async () => {
            const songs = await getsongs(`/songs/${folder}`);
            playMusic(songs[0]);
          });
        } catch (error) {
          console.error(`Error loading metadata for folder: ${folder}`, error);
        }
      }
    } catch (error) {
      console.error("Error loading album list:", error);
    }
  }

  // Invoke the function to load albums
  loadAlbums();
});
