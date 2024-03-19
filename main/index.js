// Websocket
const socket = new ReconnectingWebSocket('ws://127.0.0.1:7270/')
socket.onclose = event => {
    console.log('Socket Closed Connection: ', event)
    socket.send('Client Closed!')
}
socket.onopen = () => {
    console.log('Successfully Connected')
}

// Star system
const teamRedWinStars = document.getElementById("teamRedWinStars")
const teamBlueWinStars = document.getElementById("teamBlueWinStars")
let currentBestOf = 9, currentFirstTo = 5
let currentStarRed = 2, currentStarBlue = 3
// Generate stars
function generateStarsDisplay() {
    if (currentStarRed > currentFirstTo) currentStarRed = currentFirstTo
    if (currentStarBlue > currentFirstTo) currentStarBlue = currentFirstTo
    if (currentStarRed < 0) currentStarRed = 0
    if (currentStarBlue < 0) currentStarBlue = 0

    // Generate or remove new (blank) stars
    teamRedWinStars.innerHTML = ""
    teamBlueWinStars.innerHTML = ""

    // Red stars
    createStars(teamRedWinStars, "teamRedWinStar", "teamRedWinStarFill", currentStarRed)
    createStars(teamRedWinStars, "teamRedWinStar", null, currentFirstTo - currentStarRed)

    // Blue stars
    createStars(teamBlueWinStars, "teamBlueWinStar", "teamBlueWinStarFill", currentStarBlue)
    createStars(teamBlueWinStars, "teamBlueWinStar", null, currentFirstTo - currentStarBlue)
}
function createStars(container, starClass, fillClass, count) {
    for (let i = 0; i < count; i++) {
        const teamWinStars = document.createElement("div");
        teamWinStars.classList.add("teamWinStar", starClass);
        if (fillClass && i < count) {
            teamWinStars.classList.add(fillClass);
        }
        container.append(teamWinStars);
    }
}
function changeStarCount(team, action) {
    if (team === "red" && action === "plus") currentStarRed++
    if (team === "red" && action === "minus") currentStarRed--
    if (team === "blue" && action === "plus") currentStarBlue++
    if (team === "blue" && action === "minus") currentStarBlue--
    generateStarsDisplay()
}
generateStarsDisplay()

// Warmup mode
const warmupText = document.getElementById("warmupText")
let warmupMode = true
function warmupToggle() {
    warmupMode = !warmupMode
    if (warmupMode) {
        warmupText.innerText = "ON"
        teamRedWinStars.style.display = "none"
        teamBlueWinStars.style.display = "none"
    } else {
        warmupText.innerText = "OFF"
        teamRedWinStars.style.display = "block"
        teamBlueWinStars.style.display = "block"
    }
}

// Now Playing Details
const nowPlayingMod = document.getElementById("nowPlayingMod")
const nowPlayingSongName = document.getElementById("nowPlayingSongName")
const nowPlayingDifficultyMapper = document.getElementById("nowPlayingDifficultyMapper")
const nowPlayingDifficulty = document.getElementById("nowPlayingDifficulty")
const nowPlayingMapper = document.getElementById("nowPlayingMapper")
const nowPlayingArtist = document.getElementById("nowPlayingArtist")
let currentSongName, currentMd5, currentId, foundMappoolMap
// Now Playing Details Wrapper
const nowPlayingSongNameWrapper = document.getElementById("nowPlayingSongNameWrapper")
const nowPlayingDifficultyMapperWrapper = document.getElementById("nowPlayingDifficultyMapperWrapper")
const nowPlayingArtistWrapper = document.getElementById("nowPlayingArtistWrapper")
// Now Playing Stats
const nowPlayingStatsCSNumber = document.getElementById("nowPlayingStatsCSNumber")
const nowPlayingStatsLENNumber = document.getElementById("nowPlayingStatsLENNumber")
const nowPlayingStatsARNumber = document.getElementById("nowPlayingStatsARNumber")
const nowPlayingStatsBPMNumber = document.getElementById("nowPlayingStatsBPMNumber")
const nowPlayingStatsODNumber = document.getElementById("nowPlayingStatsODNumber")
const nowPlayingStatsSRNumber = document.getElementById("nowPlayingStatsSRNumber")
// Now Playing Background
const nowPlayingBackground = document.getElementById("nowPlayingBackground")

// Mod information
const modInfoContainer = document.getElementById("modInfoContainer")
const currentMod = document.getElementById("currentMod")
const modInfoText = document.getElementById("modInfoText")

// Team Sections
const teamRedSection = document.getElementById("teamRedSection")
const teamBlueSection = document.getElementById("teamBlueSection")
const teamRedScoreSection = document.getElementById("teamRedScoreSection")
const teamBlueScoreSection = document.getElementById("teamBlueScoreSection")

// Score Section
const teamRedCurrentScore = document.getElementById("teamRedCurrentScore")
const teamBlueCurrentScore = document.getElementById("teamBlueCurrentScore")
const currentScoreDifferenceNumber = document.getElementById("currentScoreDifferenceNumber")
const currentScoreBar = document.getElementById("currentScoreBar")
const currentScoreBarRed = document.getElementById("currentScoreBarRed")
const currentScoreBarBlue = document.getElementById("currentScoreBarBlue")
let currentScoreRed, currentScoreBlue, currentScoreDelta

// Chat Section
const chatDisplay = document.getElementById("chatDisplay")

// Map currentply playing
let gameplayDisplayed = false
let resultsDisplayed = false
let resultsShown = false

// Whenever socket sends a message
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    const message = data.message

    // todo: complete this typedef
    /**
     * @typedef {{
     *     online_id: number
     *     difficulty_name: string
     *     bpm: number
     *     star_rating: number
     *     metadata: {
     *         author: {
     *             username: string
     *         }
     *     }
     *     difficulty: {
     *         circle_size: number
     *         approach_rate: number
     *         overall_difficulty: number
     *     }
     *     beatmap_set: {
     *         online_id: number
     *     }
     * }} message
     */
    if (data.type === "Beatmap" && message.online_id !== 0 && message.metadata.title !== "no beatmaps available!") {
        foundMappoolMap = false
        currentId = message.online_id

        // Remove mod
        nowPlayingMod.style.display = "none"

        // Set background
        nowPlayingBackground.style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${message.beatmap_set.online_id}/covers/cover.jpg")`

        // Set metadata
        nowPlayingSongName.innerText = message.metadata.title
        nowPlayingDifficulty.innerText = message.difficulty_name
        nowPlayingMapper.innerText =  message.metadata.author.username
        nowPlayingArtist.innerText = message.metadata.artist

        adjustNowPlaying(nowPlayingSongName, nowPlayingSongNameWrapper)
        adjustNowPlaying(nowPlayingDifficultyMapper, nowPlayingDifficultyMapperWrapper)
        adjustNowPlaying(nowPlayingArtist, nowPlayingArtistWrapper)

        // put find beatmap function here

        if (!foundMappoolMap) {
            nowPlayingStatsCSNumber.innerText = `${message.difficulty.circle_size}`;
            let seconds = message.length / 1000
            nowPlayingStatsLENNumber.innerText = `${Math.floor(seconds / 60)}:${Math.round((num => (num < 10 ? '0' : '') + num)(seconds % 60))}`
            nowPlayingStatsARNumber.innerText = `${message.difficulty.approach_rate}`;
            nowPlayingStatsBPMNumber.innerText = `${Math.round(message.bpm)}`;
            nowPlayingStatsODNumber.innerText = `${message.difficulty.overall_difficulty}`;
            nowPlayingStatsSRNumber.innerText = `${Math.round(message.star_rating * 100) / 100}★`;
            modInfoContainer.style.left = "-330px"
        }
    }

    // For what information to show on left
    // UPDATE THIS WHEN I KNOW WHAT THE DATA LOOKS LIKE AND ADD THE TYPEDEF IN HERE TOO
    // if (data.type === "MultiplayerRoomState") {
    //     const currentStatus = message.room_state
    //     console.log(currentStatus)
    //     if (currentStatus === "Open") {

    //         resultsDisplayed = false
    //         teamRedSection.style.height = "100px"
    //         teamBlueSection.style.height = "100px"
    //         teamRedScoreSection.style.opacity = 0
    //         teamBlueScoreSection.style.opacity = 0
    //         chatDisplay.style.left = "15px"
    //         currentScoreBar.style.opacity = 0            

    //     } else if (currentStatus === "WaitingForLoad" || currentStatus === "Playing") {

    //         resultsDisplayed = false
    //         teamRedSection.style.height = "175px"
    //         teamBlueSection.style.height = "175px"
    //         teamRedScoreSection.style.opacity = 1
    //         teamBlueScoreSection.style.opacity = 1
    //         chatDisplay.style.left = "-335px"
    //         currentScoreBar.style.opacity = 0

    //     } else if (currentStatus === "Results" && !resultsDisplayed) {

    //         resultsDisplayed = true
    //         setTimeout(() => {
    //             teamRedSection.style.height = "100px"
    //             teamBlueSection.style.height = "100px"
    //             teamRedScoreSection.style.opacity = 0
    //             teamBlueScoreSection.style.opacity = 0
    //             chatDisplay.style.left = "15px"
    //             currentScoreBar.style.opacity = 0
    //         }, 15000)
    //     }
    // }

    if (data.type === "MultiplayerGameplay") {
        /**
         * @typedef {{
         *     player_states: {
         *         string: {
         *             team_id: number
         *             total_score: number
         *             username: string
         *             user_id: number
         *             slot_index: number
         *             accuracy: number
         *             mods: [{}]
         *             combo: number
         *             highest_combo: number
         *             user_state: string
         *         }
         *     }
         * }} message
         */

        // let scoreRed = Object.values(message.player_states).filter(s => s.team_id === 0).map(s => s.total_score).reduce((a, b) => a + b);
        // let scoreBlue = Object.values(message.player_states).filter(s => s.team_id === 1).map(s => s.total_score).reduce((a, b) => a + b);
        // let scoreDelta = Math.abs(scoreRed - scoreBlue);
        // console.log(`score: ${scoreRed} vs ${scoreBlue} (delta: ${scoreDelta})`);

        // Check if map is found playing
        gameplayDisplayed = false
        resultsDisplayed = false

        // Check for gameplay and whether results are displayed
        for (let key in message.player_states) {
            const user_state = message.player_states[key].user_state
            if (user_state === "Playing" || user_state === "ReadyForGameplay") {
                gameplayDisplayed = true
                resultsShown = false
            }
            if (user_state === "Results") {
                resultsDisplayed = true
            }
        }

        if (gameplayDisplayed) {
            // Gameplay showing
            resultsDisplayed = false
            teamRedSection.style.height = "175px"
            teamBlueSection.style.height = "175px"
            teamRedScoreSection.style.opacity = 1
            teamBlueScoreSection.style.opacity = 1
            chatDisplay.style.left = "-335px"
            currentScoreBar.style.opacity = 1
        } else if (resultsDisplayed && !resultsShown) {
            // Results showing
            resultsShown = true

            // Generate star resutls
            if (!warmupMode) {
                if (currentScoreRed > currentScoreBlue) {
                    changeStarCount('red','plus')
                } else if (currentScoreBlue > currentScoreRed) {
                    changeStarCount('blue','plus')
                }
            }

            // Show chat after 15 seconds
            setTimeout(() => {
                teamRedSection.style.height = "100px"
                teamBlueSection.style.height = "100px"
                teamRedScoreSection.style.opacity = 0
                teamBlueScoreSection.style.opacity = 0
                chatDisplay.style.left = "15px"
                currentScoreBar.style.opacity = 0
            }, 15000)
        }
    }
}

function adjustNowPlaying(element, wrapperElement, foundMappoolMap) {
    const modDisplayedWidth = foundMappoolMap? 0 : 70
    const wrapperElementWidth = 400 + modDisplayedWidth
    wrapperElement.style.left = `${90 - modDisplayedWidth}px`
    wrapperElement.style.width = `${wrapperElementWidth}px`

    element.classList.remove("nowPlayingTextAnimationShort")
    element.classList.remove("nowPlayingTextAnimationLong")

    if (element.getBoundingClientRect().width > wrapperElementWidth) {
        if (foundMappoolMap) {
            element.classList.add("nowPlayingTextAnimationShort")
        } else {
            element.classList.add("nowPlayingTextAnimationLong")
        }
    }
}