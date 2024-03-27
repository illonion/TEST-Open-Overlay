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
let currentBestOf = 0, currentFirstTo = 0
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

// Warmup mode
let warmupMode = true
const warmupText = document.getElementById("warmupText")
function warmupToggle() {
    warmupMode = !warmupMode
    if (warmupMode) {
        warmupText.innerText = "ON"
        teamRedWinStars.style.display = "none"
        teamBlueWinStars.style.display = "none"
    } else {
        warmupText.innerText = "OFF"
        teamRedWinStars.style.display = "flex"
        teamBlueWinStars.style.display = "flex"
    }
}
warmupToggle()

// Json Bin Details
const playerJsonBinId = ""
const mappoolJsonBinId = ""
const jsonBinApiKey = "" // Changed the API Key
// Player information
let allPlayers
let allPlayersRequest = new XMLHttpRequest()
allPlayersRequest.onreadystatechange = () => {
    if (allPlayersRequest.readyState == XMLHttpRequest.DONE) {
        allPlayers = JSON.parse(allPlayersRequest.responseText).record
    }
}
allPlayersRequest.open("GET", `https://api.jsonbin.io/v3/b/${playerJsonBinId}`, false)
allPlayersRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
allPlayersRequest.send()
// Mappool information
let mappool
let allBeatmaps
let mappoolRequest = new XMLHttpRequest()
const roundName = document.getElementById("roundName")
mappoolRequest.onreadystatechange = () => {
    if (mappoolRequest.readyState == XMLHttpRequest.DONE) {
        mappool = JSON.parse(mappoolRequest.responseText).record
        allBeatmaps = mappool.beatmaps
        const currentRoundName = mappool.roundName
        roundName.setAttribute("src",`../_shared/logo/static/${currentRoundName.toLowerCase().replace(/ /g, "-")}.png`)
        switch(currentRoundName) {
            case "Round of 32": case "Round of 16":
                currentBestOf = 9
                currentFirstTo = 5
                break
            case "Quarterfinals": case "Semifinals":
                currentBestOf = 11
                currentFirstTo = 6
                break
            case "Finals": case "Grand Finals":
                currentBestOf = 13
                currentFirstTo = 7
                break
        }
        generateStarsDisplay()
    }
}
mappoolRequest.open("GET", `https://api.jsonbin.io/v3/b/${mappoolJsonBinId}`, false)
mappoolRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
mappoolRequest.send()

// Find beatmap
function findMapInBeatmaps(id) {
    for (let i = 0; i < allBeatmaps.length; i++) {
        if (id == allBeatmaps[i].beatmapID) return allBeatmaps[i]
    }
    return
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
const funMods = [
    { modAbbreviation: "BR", modMessage: "The whole playing field spins slightly! It's on a barrel!"},
    { modAbbreviation: "TC", modMessage: "Circles are gone, the players have to rely on the (bigger) approach circles!"},
    { modAbbreviation: "WG", modMessage: "The circles are wiggling! Can the players stay focused on the moving targets?"},
    { modAbbreviation: "GR", modMessage: "The circles are moving closer... Make sure to hit it at the right timing! Don't forget about the note underneath!"},
    { modAbbreviation: "RP", modMessage: "The circles are moving away! Can the players catch them before time runs out?"},
    { modAbbreviation: "DP", modMessage: "The circles are growing and expanding. Almost 3D!"},
]

// Team Sections
const teamRedSection = document.getElementById("teamRedSection")
const teamBlueSection = document.getElementById("teamBlueSection")
const teamRedScoreSection = document.getElementById("teamRedScoreSection")
const teamBlueScoreSection = document.getElementById("teamBlueScoreSection")

// Score Section
const teamRedCurrentScore = document.getElementById("teamRedCurrentScore")
const teamBlueCurrentScore = document.getElementById("teamBlueCurrentScore")
const currentScoreDifference = document.getElementById("currentScoreDifference")
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

// Team Details
const teamRedBanner = document.getElementById("teamRedBanner")
const teamBlueBanner = document.getElementById("teamBlueBanner")
const teamRedName = document.getElementById("teamRedName")
const teamBlueName = document.getElementById("teamBlueName")
const teamRedSeedNumber = document.getElementById("teamRedSeedNumber")
const teamBlueSeedNumber = document.getElementById("teamBlueSeedNumber")
let currentTeamRedName, currentTeamBlueName

// Chat Section
const chatDisplay = document.getElementById("chatDisplay")
let chatLength = 0

// Map currentply playing
let resultsDisplayed = false

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

        // put find beatmap function here
        const currentMap = findMapInBeatmaps(currentId)
        if (currentMap) {
            nowPlayingStatsCSNumber.innerText = `${Math.round(parseFloat(currentMap.cs) * 10) / 10}`
            nowPlayingStatsLENNumber.innerText = `${Math.floor(currentMap.songLength / 60)}:${(num => (num < 10 ? '0' : '') + num)(Math.round(currentMap.songLength) % 60)}`
            nowPlayingStatsARNumber.innerText = `${Math.round(parseFloat(currentMap.ar) * 10) / 10}`
            nowPlayingStatsBPMNumber.innerText = `${Math.round(parseFloat(currentMap.bpm) * 10) / 10}`
            nowPlayingStatsODNumber.innerText = `${Math.round(parseFloat(currentMap.od) * 10) / 10}`
            nowPlayingStatsSRNumber.innerText = `${Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100}★`

            nowPlayingMod.style.display = "block"
            nowPlayingMod.innerText = `${currentMap.mod}${currentMap.order}`

            if (currentMap.hasOwnProperty("additional_mod")) {
                let newMod = currentMap.additional_mod
                currentMod.innerText = newMod
                for  (let i = 0; i < funMods.length; i++) {
                    if (funMods[i].modAbbreviation === newMod) {
                        modInfoText.innerText = funMods[i].modMessage
                        break
                    }
                }
                modInfoContainer.style.left = "0px"
            } else {
                modInfoContainer.style.left = "-330px"
            }
        } else {
            nowPlayingStatsCSNumber.innerText = `${message.difficulty.circle_size}`;
            let seconds = message.length / 1000
            nowPlayingStatsLENNumber.innerText = `${Math.floor(seconds / 60)}:${Math.round((num => (num < 10 ? '0' : '') + num)(seconds % 60))}`
            nowPlayingStatsARNumber.innerText = `${message.difficulty.approach_rate}`
            nowPlayingStatsBPMNumber.innerText = `${Math.round(message.bpm)}`
            nowPlayingStatsODNumber.innerText = `${message.difficulty.overall_difficulty}`
            nowPlayingStatsSRNumber.innerText = `${Math.round(message.star_rating * 100) / 100}★`
            modInfoContainer.style.left = "-330px"
        }

        adjustNowPlaying(nowPlayingSongName, nowPlayingSongNameWrapper, currentMap)
        adjustNowPlaying(nowPlayingDifficultyMapper, nowPlayingDifficultyMapperWrapper, currentMap)
        adjustNowPlaying(nowPlayingArtist, nowPlayingArtistWrapper, currentMap)
    }

    // For what information to show on left
    // UPDATE THIS WHEN I KNOW WHAT THE DATA LOOKS LIKE AND ADD THE TYPEDEF IN HERE TOO
    if (data.type === "MultiplayerRoomState") {
    /**
     * @typedef {{
     *     room_name: string
     *     room_state: string
     * }} message
     */
    
        // Room state
        if (message.room_state == "Open" || message.room_state == "Closed") {
            // Chat showing
            resultsDisplayed = false
            teamRedSection.style.height = "100px"
            teamBlueSection.style.height = "100px"
            teamRedScoreSection.style.opacity = 0
            teamBlueScoreSection.style.opacity = 0
            chatDisplay.style.left = "15px"
            currentScoreBar.style.opacity = 0
        } else if (message.room_state == "WaitingForLoad" || message.room_state == "Playing") {
            // Gameplay showing
            resultsDisplayed = false
            teamRedSection.style.height = "175px"
            teamBlueSection.style.height = "175px"
            teamRedScoreSection.style.opacity = 1
            teamBlueScoreSection.style.opacity = 1
            chatDisplay.style.left = "-335px"
            currentScoreBar.style.opacity = 1
        } else if (message.room_state == "Results" && !resultsDisplayed) {
            // Show chat after 20 seconds
            resultsDisplayed = true
            setTimeout(() => {
                teamRedSection.style.height = "100px"
                teamBlueSection.style.height = "100px"
                teamRedScoreSection.style.opacity = 0
                teamBlueScoreSection.style.opacity = 0
                chatDisplay.style.left = "15px"
                currentScoreBar.style.opacity = 0
            }, 20000)
        }

        // Room Name
        const roomName = message.room_name
        currentTeamRedName = roomName.split("(")[1].split(")")[0]
        currentTeamBlueName = roomName.split("(")[2].split(")")[0]
        teamRedName.innerText = currentTeamRedName
        teamBlueName.innerText = currentTeamBlueName

        for (let i = 0; i < allPlayers.length; i++) {
            if (currentTeamRedName === allPlayers[i].team_name) {
                teamRedBanner.style.backgroundImage = `url("${allPlayers[i].banner_url}")`
                teamRedSeedNumber.innerText = `#${allPlayers[i].seed}`
            } else if (currentTeamBlueName === allPlayers[i].team_name) {
                teamBlueBanner.style.backgroundImage = `url("${allPlayers[i].banner_url}")`
                teamBlueSeedNumber.innerText = `#${allPlayers[i].seed}`
            }
        }
    }

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

        currentScoreRed = 0
        currentScoreBlue = 0

        let currentRedCount = 0
        let currentBlueCount = 0
        let currentRedTotalAccuracy = 0
        let currentBlueTotalAccuracy = 0
        let currentRedAvgAccuracy = 0
        let currentBlueAvgAccuracy = 0

        // Check for gameplay and whether results are displayed
        for (let key in message.player_states) {
            const player = message.player_states[key]
            const score = player.total_score
            const accuracy = player.accuracy

            if (player.team_id === 0) {
                currentScoreRed += parseInt(score)
                currentRedTotalAccuracy += accuracy
                currentRedCount++
            }
            else if (player.team_id === 1) {
                currentScoreBlue += parseInt(score)
                currentBlueTotalAccuracy += accuracy
                currentBlueCount++
            }
        }

        // Set average accuracies
        currentRedAvgAccuracy = currentRedTotalAccuracy / currentRedCount
        currentBlueAvgAccuracy = currentBlueTotalAccuracy / currentBlueCount

        // Set score information
        scoreAnimation.teamRedCurrentScore.update(currentScoreRed)
        scoreAnimation.teamBlueCurrentScore.update(currentScoreBlue)

        // Set score difference information
        currentScoreDelta = Math.abs(currentScoreRed - currentScoreBlue)
        scoreAnimation.currentScoreDifferenceNumber.update(currentScoreDelta)
        let movingScoreBarDifferencePercent = Math.min(currentScoreDelta / 1000000, 1)
        let movingScoreBarRectangleHeight = Math.min(Math.pow(movingScoreBarDifferencePercent, 0.5) * 0.8 * 484, 484)
        if (currentScoreRed > currentScoreBlue) {
            currentScoreBarRed.style.height = `${movingScoreBarRectangleHeight}px`
            currentScoreBarBlue.style.height = "0px"
            currentScoreDifference.style.backgroundColor = "var(--teamRedColour)"
            currentScoreDifference.style.color = "white"
            currentScoreDifferenceNumber.style.color = "white"
        } else if (currentScoreRed === currentScoreBlue) {
            currentScoreBarRed.style.height = "0px"
            currentScoreBarBlue.style.height = "0px"
            currentScoreDifference.style.backgroundColor = "white"
            currentScoreDifference.style.color = "black"
            currentScoreDifferenceNumber.style.color = "black"
        } else if (currentScoreBlue > currentScoreRed) {
            currentScoreBarRed.style.height = "0px"
            currentScoreBarBlue.style.height = `${movingScoreBarRectangleHeight}px`
            currentScoreDifference.style.backgroundColor = "var(--teamBlueColour)"
            currentScoreDifference.style.color = "white"
            currentScoreDifferenceNumber.style.color = "white"
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
        *             team_id: number
        *         }
        *     }
        * }} message
        */

        if (chatLength !== message.chat_messages.length) {
            (chatLength === 0 || chatLength > message.chat_messages.length) ? (chatDisplay.innerHTML = "", chatLEngth = 0) : null

            for (let i = chatLength; i < message.chat_messages.length; i++) {
                // TODO: Add teams to chat messages
                let currentClass = "unknownTeamChat"
                if (message.chat_messages[i].team_id === 0) {
                    currentClass = "redTeamChat"
                } else if (message.chat_messages[i].team_id === 1) {
                    currentClass = "blueTeamChat"
                }

                // Container
                const chatMessageContainer = document.createElement("div")
                chatMessageContainer.classList.add("chatMessageContainer")

                // Time
                let dateTime = new Date(Date.parse(message.chat_messages[i].message_time))
                const messageTime = document.createElement("div")
                messageTime.classList.add("messageTime")
                messageTime.innerText = `${dateTime.getUTCHours().toString().padStart(2, '0')}:${dateTime.getUTCMinutes().toString().padStart(2, '0')}`

                // Name
                const messageUser = document.createElement("div")
                messageUser.classList.add("messageUser", currentClass)
                messageUser.innerText = message.chat_messages[i].sender_name

                // Content
                const messageContent = document.createElement("div")
                messageContent.classList.add("messageContent", currentClass)
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