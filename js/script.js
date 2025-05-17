let currentSong = new Audio();
let songs;
let currfolder;
let currentSongIndex = 0;

function formatSeconds(inputSeconds) {
    if (isNaN(inputSeconds) || inputSeconds < 0) {
        return "00:00";
    }
    const totalSeconds = Math.floor(Number(inputSeconds)); // Remove decimal part safely
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;

    const formattedMins = String(mins).padStart(2, '0');
    const formattedSecs = String(secs).padStart(2, '0');

    return `${formattedMins}:${formattedSecs}`;
}

async function getsongs(folder) {
    if (folder.startsWith("/")) folder = folder.slice(1);
    currfolder = folder;
    let a = await fetch(`/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    const fileLinks = div.querySelectorAll('#files li a');
    songs = [];

    for (let index = 0; index < fileLinks.length; index++) {
        const element = fileLinks[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }


    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
            <img class="invert" src="img/music.svg" alt="">
            <div class="songinfo">
                <div>${decodeURIComponent(song)}</div>
                <div>harry</div>
            </div>
            <div class="playnow">
                <span>Play Now</span> 
                <img class="invert position" src="img/play.svg" alt="">
            </div>
        </li>`;
    }

    // Attach event listeners to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach((e, index) => {
        e.addEventListener("click", () => {
            if (songs && songs[index]) {  // Add check to ensure songs array and index exist
                const track = songs[index];
                playMusic(track, false);
            }
        });
    });

    return songs;  // Make sure to return the songs array
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currfolder}/` + track;
    currentSongIndex = songs.indexOf(track);

    if (!pause) {
        currentSong.play();
        play.src = "img/pause.svg";
    } else {
        currentSong.pause();
        play.src = "img/play.svg";
    }

    document.querySelector(".songinfo2").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    updateButtonStates(currentSongIndex);
};

async function DisplayAlbums() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")

    let cardcontainer = document.querySelector(".cardcontainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        // Exclude root directory and the /songs directory itself
        if (e.href.includes("/songs/") && !e.href.endsWith("/songs/") && !e.href.endsWith("/songs")) {
            let folder = e.href.split("/").slice(-1)[0]
            // get meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            cardcontainer.innerHTML = cardcontainer.innerHTML + ` <div data-folder="${folder}" class="card">
                        <img src="songs/${folder}/cover.gif">
                   <div class="play">
                    <svg  width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="24" cy="24" r="24" fill=" #af2896"/>
                    <path d="M18 34V14L34 24L18 34Z" fill="black"/>
                  </svg>
                  </div>
                        <h2>${response.title}</h2>
                   <p>${response.discription}</p>
                    </div>`
        }
    };

    // load the playlist whenever the card is clicked 

    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0]);
        })
    })
}

// Function to update button states
function updateButtonStates(currentIndex) {
    // Set previous button state
    if (currentIndex <= 0) {
        previous.disabled = true;
        previous.style.opacity = "0.5";
    } else {
        previous.disabled = false;
        previous.style.opacity = "1";
    }

    // Set next button state
    if (currentIndex >= songs.length - 1) {
        next.disabled = true;
        next.style.opacity = "0.5";
    } else {
        next.disabled = false;
        next.style.opacity = "1";
    }
}

async function main() {
    // get lists of all songs
    await getsongs("songs/favorites");

    playMusic(songs[0], true)

    await DisplayAlbums()

    const play = document.querySelector("#play");

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.src = "img/pause.svg";  // switch icon to pause BEFORE playing
            currentSong.play();
        } else {
            play.src = "img/play.svg";   // switch icon to play BEFORE pausing
            currentSong.pause();
        }
    });

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.
            duration) * 100 + "%";
    })

    //add eventlistner to seekbar 
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add toggle functionality to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        const leftMenu = document.querySelector(".left");
        const isOpen = leftMenu.style.left === "0px" || getComputedStyle(leftMenu).left === "0px";

        if (isOpen) {
            leftMenu.style.left = "-120%"; // Close
        } else {
            leftMenu.style.left = "0";     // Open
        }
    });

    // add event listener to previous and next
    next.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            return;
        }

        if (currentSongIndex < songs.length - 1) {
            currentSongIndex++;
            playMusic(songs[currentSongIndex]);
        }
    });

    previous.addEventListener("click", () => {
        if (!songs || songs.length === 0) {
            return;
        }

        if (currentSongIndex > 0) {
            currentSongIndex--;
            playMusic(songs[currentSongIndex]);
        }
    });

    // Call this initially to set the correct button states
    function initializeButtons() {
        let initialIndex = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        updateButtonStates(initialIndex);
    }

    // Call this when your player loads
    initializeButtons();

    // add an event to volume
    document.querySelector(".volume-slider").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100
    })

    document.addEventListener("click", e => {
        if (e.target.classList.contains("volume-btn")) {
            if (e.target.src.includes("volume.svg")) {
                e.target.src = e.target.src.replace("volume.svg", "mute.svg");
                currentSong.volume = 0;
                document.querySelector(".volume-slider").value = 0;
            } else {
                e.target.src = e.target.src.replace("mute.svg", "volume.svg");
                currentSong.volume = 0.50;
                document.querySelector(".volume-slider").value = 50;
            }
        }
    })
    document.querySelector(".volume-slider").addEventListener("change", (e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
        const volumeBtn = document.querySelector(".volume-btn");
        if (e.target.value == 0) {
            // Change to mute icon
            if (volumeBtn.src.includes("volume.svg")) {
                volumeBtn.src = volumeBtn.src.replace("volume.svg", "mute.svg");
            }
        } else {
            // Change to volume icon
            if (volumeBtn.src.includes("mute.svg")) {
                volumeBtn.src = volumeBtn.src.replace("mute.svg", "volume.svg");
            }
        }
    })
}

main()

