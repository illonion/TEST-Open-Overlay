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
let currentStarRed = 0, currentStarBlue = 0
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
    if (!warmupMode) {
        if (team === "red" && action === "plus") currentStarRed++
        if (team === "red" && action === "minus") currentStarRed--
        if (team === "blue" && action === "plus") currentStarBlue++
        if (team === "blue" && action === "minus") currentStarBlue--
        generateStarsDisplay()
    }
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

const rotatingInfoTexts = document.getElementById("rotatingInfoTexts")
const rotatingInfos = rotatingInfoTexts.querySelectorAll(".rotating-info")
let currentRotatingInfoIndex = 0
rotatingInfos[currentRotatingInfoIndex].style.opacity = 1

function startInterval() {
    rotatingInfos[currentRotatingInfoIndex].style.opacity = 0
    currentRotatingInfoIndex = (currentRotatingInfoIndex + 1) % rotatingInfos.length
    rotatingInfos[currentRotatingInfoIndex].style.opacity = 1
}
setInterval(startInterval, 4500)

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
let scoreAnimation = {
    teamRedCurrentScore: new CountUp(teamRedCurrentScore, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    teamBlueCurrentScore: new CountUp(teamBlueCurrentScore, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    currentScoreDifferenceNumber: new CountUp(currentScoreDifferenceNumber, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." })
}

// Chat Section
const chatDisplay = document.getElementById("chatDisplay")
let chatLength = 0

// Map currentply playing
let gameplayDisplayed = false
let resultsDisplayed = false
let resultsShown = false

// Whenever socket sends a message
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    const message = data.message

    console.log(data.type)
    console.log(message)

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

        // Check if map is found playing
        gameplayDisplayed = false
        resultsDisplayed = false

        // Check for gameplay and whether results are displayed
        for (let key in message.player_states) {
            const user_state = message.player_states[key].user_state
            const score = message.player_states[key].total_score
            if (user_state === "Playing" || user_state === "ReadyForGameplay") {
                gameplayDisplayed = true
                resultsShown = false
            }
            if (user_state === "Results") {
                resultsDisplayed = true
            }

            if (team_id === 0) currentScoreRed += score
            else if (team_id === 1) currentScoreBlue += score
        }

        // Set score information
        
        scoreAnimation.teamRedCurrentScore.update(currentScoreRed)
        scoreAnimation.teamBlueCurrentScore.update(currentScoreBlue)

        // Set score difference information
        currentScoreDelta = Math.abs(currentScoreRed - currentScoreBlue)
        scoreAnimation.currentScoreDifferenceNumber.update(currentScoreDelta)
        let movingScoreBarDifferencePercent = Math.min(currentScoreDelta / 1000000, 1)
        let movingScoreBarRectangleWidth = xMath.max(Math.pow(movingScoreBarDifferencePercent, 0.5) * 0.8 * 484, 484)
        if (currentScoreRed > currentScoreBlue) {
            currentScoreBarRed.style.width = `${movingScoreBarRectangleWidth}px`
            currentScoreBarBlue.style.width = "0px"
            currentScoreDifferenceNumber.style.backgroundColor = "var(--teamRedColour)"
            currentScoreDifferenceNumber.style.color = "white"
        } else if (currentScoreRed === currentScoreBlue) {
            currentScoreBarRed.style.width = "0px"
            currentScoreBarBlue.style.width = "0px"
            currentScoreDifferenceNumber.style.backgroundColor = "white"
            currentScoreDifferenceNumber.style.COLOR = "black"
        } else if (currentScoreBlue > currentScoreRed) {
            currentScoreBarRed.style.width = "9px"
            currentScoreBarBlue.style.width = `${movingScoreBarRectangleWidth}px`
            currentScoreDifferenceNumber.style.backgroundColor = "var(--teamBlueColour)"
            currentScoreDifferenceNumber.style.COLOR = "white"
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

    if (data.type === "MultiplayerChatState") {
        /**
         * @typedef {{
        *     chat_messages: {
        *         number: {
        *             message_content: string
        *             message_time: datetime
        *             sender_name: string
        *         }
        *     }
        * }} message
        */

        if (chatLength !== message.chat_messages.length) {
            (chatLength === 0 || chatLength > message.chat_messages.length) ? (chatDisplay.innerHTML = "", chatLEngth = 0) : null

            for (let i = chatLength; i < message.chat_messages.length; i++) {
                // TODO: Add teams to chat messages
                // Container
                const chatMessageContainer = document.createElement("div")
                chatMessageContainer.classList.add("chatMessageContainer")

                // Time
                let dateTime = new Date(Date.parse(message.chat_messages[i].message_time))
                const messageTime = document.createElement("div")
                messageTime.classList.add("messageTime")
                messageTime.innerText = `${dateTime.getUTCHours()}:${dateTime.getUTCMinutes()}`

                // Name
                const messageUser = document.createElement("div")
                messageUser.classList.add("messageUser")
                messageUser.innerText = message.chat_messages[i].sender_name

                // Content
                const messageContent = document.createElement("div")
                messageContent.classList.add("messageContent")
                messageContent.innerText = message.chat_messages[i].message_content

                chatMessageContainer.append(messageTime, messageUser, messageContent)
                chatDisplay.append(chatMessageContainer)
            }

            chatDisplay.scrollTop = chatDisplay.scrollHeight;
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