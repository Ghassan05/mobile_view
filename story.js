let currentScene = 0;
let currentDialogue = 0;
let storyData = {};
let audioPlaying = false;

const background = document.getElementById('background');
const charactersContainer = document.getElementById('characters');
const characterName = document.getElementById('character-name');
const dialogueText = document.getElementById('dialogue-text');
const startButton = document.getElementById('start-button');
const storyContainer = document.getElementById('story-container');
const transitionVideo = document.getElementById('transition-video');

startButton.addEventListener('click', () => {
    storyContainer.style.display = 'block';
    startButton.style.display = 'none';
    loadStory();
});

function loadScene(scene) {
    background.style.display = 'none';
    transitionVideo.style.display = 'block';
    transitionVideo.play();

    // Hide all characters
    document.querySelectorAll('.character').forEach(char => {
        char.style.display = 'none';
    });

    setTimeout(() => {
        transitionVideo.style.display = 'none';
        background.style.display = 'block';
        background.src = `images/${scene.background}`;
        charactersContainer.innerHTML = '';

        scene.characters.forEach(char => {
            if (char.visible) {
                const charDiv = document.createElement('div');
                charDiv.classList.add('character');
                charDiv.id = char.name;

                const charImg = document.createElement('img');
                charImg.src = `images/${char.name}.jpg`;
                charDiv.appendChild(charImg);

                const dialogueDiv = document.createElement('div');
                dialogueDiv.classList.add('dialogue');
                dialogueDiv.id = `dialogue-${char.name}`;
                charDiv.appendChild(dialogueDiv);

                const nameDiv = document.createElement('div');
                nameDiv.classList.add('character-name');
                nameDiv.innerText = char.name;
                charDiv.appendChild(nameDiv);

                charactersContainer.appendChild(charDiv);
            }
        });

        currentDialogue = 0;
        showDialogue(scene.dialogue[currentDialogue]);
    }, 5000); // Wait for 5 seconds (5000 milliseconds) for the transition video to play
}

function showDialogue(dialogue) {
    if (audioPlaying) return;

    const charDiv = document.getElementById(dialogue.character);
    const dialogueDiv = document.getElementById(`dialogue-${dialogue.character}`);

    if (!charDiv) {
        console.error(`Character div not found for ${dialogue.character}`);
        return;
    }
    if (!dialogueDiv) {
        console.error(`Dialogue div not found for ${dialogue.character}`);
        return;
    }

    dialogueDiv.innerText = dialogue.text;

    // Check for trigger word and overlay emoji
    if (dialogue.trigger) {
        overlayEmoji(charDiv, dialogue.trigger);
    }

    charDiv.style.display = 'block';
    playAudio(dialogue.audio, () => {
        setTimeout(nextDialogue, 500); // Adding a small delay to ensure smooth transition
    });
}

function overlayEmoji(charDiv, trigger) {
    const emojiDiv = document.createElement('div');
    emojiDiv.classList.add('emoji-overlay');
    emojiDiv.innerText = trigger === 'despise' ? '😢' : trigger === 'fired' ? '😡' : '';

    charDiv.appendChild(emojiDiv);

    setTimeout(() => {
        emojiDiv.remove();
    }, 2000); // Display emoji for 2 seconds
}

function nextDialogue() {
    const scene = storyData.scenes[currentScene];

    if (currentDialogue < scene.dialogue.length - 1) {
        currentDialogue++;
        showDialogue(scene.dialogue[currentDialogue]);
    } else {
        currentScene++;
        if (currentScene < storyData.scenes.length) {
            loadScene(storyData.scenes[currentScene]);
        } else {
            console.log('End of story');
        }
    }
}

function playAudio(audioFile, callback) {
    const audio = new Audio(audioFile);
    audioPlaying = true;
    audio.play();
    audio.onended = () => {
        audioPlaying = false;
        callback();
    };
    audio.onerror = (e) => {
        console.error("Error playing audio file:", audioFile, e);
        audioPlaying = false;
        callback();
    };
}

function loadStory() {
    fetch('story.json')
        .then(response => response.json())
        .then(data => {
            storyData = data;
            loadScene(storyData.scenes[currentScene]);
        })
        .catch(error => console.error('Error loading story:', error));
}

document.addEventListener('DOMContentLoaded', () => {
    loadStory();
});
