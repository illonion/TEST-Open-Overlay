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
document.cookie = `currentStarRed=${currentStarRed}; path=/`
document.cookie = `currentStarBlue=${currentStarBlue}; path=/`
// Generate stars
function generateStarsDisplay() {
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
        const teamWinStars = document.createElement("div")
        teamWinStars.classList.add("teamWinStar", starClass)
        if (fillClass && i < count) teamWinStars.classList.add(fillClass)
        container.append(teamWinStars)
    }
}
function changeStarCount(team, action) {
    if (!warmupMode) {
        if (team === "red" && action === "plus") currentStarRed++
        if (team === "red" && action === "minus") currentStarRed--
        if (team === "blue" && action === "plus") currentStarBlue++
        if (team === "blue" && action === "minus") currentStarBlue--

        if (currentStarRed > currentFirstTo) currentStarRed = currentFirstTo
        if (currentStarBlue > currentFirstTo) currentStarBlue = currentFirstTo
        if (currentStarRed < 0) currentStarRed = 0
        if (currentStarBlue < 0) currentStarBlue = 0
        generateStarsDisplay()

        // Set cookies
        document.cookie = `currentStarRed=${currentStarRed}; path=/`
        document.cookie = `currentStarBlue=${currentStarBlue}; path=/`

        // Set match winner
        if (currentStarRed === currentFirstTo) {
            document.cookie = `currentMatchWinner=${currentTeamRedName}; path=/`
            document.cookie = `currentMatchWinnerColour=red; path=/`
        } else if (currentStarBlue === currentFirstTo) {
            document.cookie = `currentMatchWinner=${currentTeamBlueName}; path=/`
            document.cookie = `currentMatchWinnerColour=blue; path=/`
        } else {
            document.cookie = `currentMatchWinner=noWinner; path=/`
        }
    }
}

// Warmup mode
let warmupMode = true
const teamMapPicks = document.getElementsByClassName("teamMapPick")
const warmupText = document.getElementById("warmupText")
function warmupToggle() {
    warmupMode = !warmupMode
    document.cookie = `warmupMode=${warmupMode}; path=/`
    warmupCheck()
}
warmupToggle()
function warmupCheck() {
    if (warmupMode) {
        warmupText.innerText = "ON"
        teamRedWinStars.style.display = "none"
        teamBlueWinStars.style.display = "none"
        for (let i = 0; i < teamMapPicks.length; i++) teamMapPicks[i].style.display = "none"
    } else {
        warmupText.innerText = "OFF"
        teamRedWinStars.style.display = "flex"
        teamBlueWinStars.style.display = "flex"
    }
}

// Reset stars
function resetStars() {
    currentStarRed = 0
    currentStarBlue = 0

    document.cookie = `currentStarRed=${currentStarRed}; path=/`
    document.cookie = `currentStarBlue=${currentStarBlue}; path=/`

    generateStarsDisplay()
}

// Json Bin Details
const playerJsonBinId = "66180208acd3cb34a836d684"
const mappoolJsonBinId = "66180211acd3cb34a836d689"
const jsonBinApiKey = "" // Change api key
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
        const currentRoundName = mappool.roundName.toLowerCase()
        roundName.setAttribute("src",`../_shared/logo/static/${currentRoundName.replace(/ /g, "-")}.png`)
        switch(currentRoundName) {
            case "round of 32": case "round of 16":
                currentBestOf = 9
                currentFirstTo = 5
                break
            case "quarterfinals": case "semifinals":
                currentBestOf = 11
                currentFirstTo = 6
                break
            case "finals": case "grand finals":
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
    for (let i = 0; i < allBeatmaps?.length; i++) {
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
const funMods = {
    "AD": { modName: "APPROACH DIFFERENT", modMessage: "The approach circles are... different? Can the players adjust?"},
    "BR": { modName: "BARREL ROLL", modMessage: "The whole playing field spins slightly! It's on a barrel!"},
    "BR": { modName: "BUBBLES", modMessage: "There are marks being left on the players screens! Hopefully they don't get distracted and miss..."},
    "DF": { modName: "DEFLATE", modMessage: "Why are the circles so big? Are they getting smaller?"},
    "DP": { modName: "DEPTH", modMessage: "The circles are growing and expanding. Almost 3D!"},
    "GR": { modName: "GROWTH", modMessage: "The circles are moving closer... Make sure to hit it at the right timing! Don't forget about the note underneath!"},
    "NS": { modName: "NO SCOPE", modMessage: "Wheres the cursor?"},
    "RP": { modName: "REPEL", modMessage: "The circles are moving away! Can the players catch them before time runs out?"},
    "SI": { modName: "SPIN IN", modMessage: "The circles are spinning! Can the players hit them on time?"},
    "TC": { modName: "TRACEABLE", modMessage: "Circles are gone, the players have to rely on the (bigger) approach circles!"},
    "TR": { modName: "TRANSFORM", modMessage: "Everything is moving around!"},
    "WG": { modName: "WIGGLE", modMessage: "The circles are wiggling! Can the players stay focused on the moving targets?"},
}

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
let currentRedCount
let currentBlueCount
let currentRedTotalAccuracy
let currentBlueTotalAccuracy
let currentRedAvgAccuracy
let currentBlueAvgAccuracy

// Player Scores
const playerInfoScores = document.getElementsByClassName("playerInfoScore")
const playerInfoScore0 = document.getElementById("playerInfoScore0")
const playerInfoScore1 = document.getElementById("playerInfoScore1")
const playerInfoScore2 = document.getElementById("playerInfoScore2")
const playerInfoScore3 = document.getElementById("playerInfoScore3")
const playerInfoScore4 = document.getElementById("playerInfoScore4")
const playerInfoScore5 = document.getElementById("playerInfoScore5")
// Player accuracies
const playerInfoAccuracies = document.getElementsByClassName("playerInfoAccuracy")
const playerInfoAccuracyNumber0 = document.getElementById("playerInfoAccuracyNumber0")
const playerInfoAccuracyNumber1 = document.getElementById("playerInfoAccuracyNumber1")
const playerInfoAccuracyNumber2 = document.getElementById("playerInfoAccuracyNumber2")
const playerInfoAccuracyNumber3 = document.getElementById("playerInfoAccuracyNumber3")
const playerInfoAccuracyNumber4 = document.getElementById("playerInfoAccuracyNumber4")
const playerInfoAccuracyNumber5 = document.getElementById("playerInfoAccuracyNumber5")
// Player combos
const playerInfoCombos = document.getElementsByClassName("playerInfoCombo")
const playerInfoComboNumber0 = document.getElementById("playerInfoComboNumber0")
const playerInfoComboNumber1 = document.getElementById("playerInfoComboNumber1")
const playerInfoComboNumber2 = document.getElementById("playerInfoComboNumber2")
const playerInfoComboNumber3 = document.getElementById("playerInfoComboNumber3")
const playerInfoComboNumber4 = document.getElementById("playerInfoComboNumber4")
const playerInfoComboNumber5 = document.getElementById("playerInfoComboNumber5")
// Ready states
const playerReadyStates = document.getElementsByClassName("playerReadyState")

// Score animation
let scoreAnimation = {
    teamRedCurrentScore: new CountUp("teamRedCurrentScore", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    teamBlueCurrentScore: new CountUp("teamBlueCurrentScore", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    currentScoreDifferenceNumber: new CountUp("currentScoreDifferenceNumber", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore0: new CountUp("playerInfoScore0", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore1: new CountUp("playerInfoScore1", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore2: new CountUp("playerInfoScore2", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore3: new CountUp("playerInfoScore3", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore4: new CountUp("playerInfoScore4", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoScore5: new CountUp("playerInfoScore5", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber0: new CountUp("playerInfoAccuracyNumber0", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber1: new CountUp("playerInfoAccuracyNumber1", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber2: new CountUp("playerInfoAccuracyNumber2", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber3: new CountUp("playerInfoAccuracyNumber3", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber4: new CountUp("playerInfoAccuracyNumber4", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoAccuracyNumber5: new CountUp("playerInfoAccuracyNumber5", 0, 0, 2, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    playerInfoComboNumber0: new CountUp("playerInfoComboNumber0", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
    playerInfoComboNumber1: new CountUp("playerInfoComboNumber1", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
    playerInfoComboNumber2: new CountUp("playerInfoComboNumber2", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
    playerInfoComboNumber3: new CountUp("playerInfoComboNumber3", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
    playerInfoComboNumber4: new CountUp("playerInfoComboNumber4", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
    playerInfoComboNumber5: new CountUp("playerInfoComboNumber5", 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }), 
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
let roomState

// Combo
const combos = {
    player1: 0,
    player2: 0,
    player3: 0,
    player4: 0,
    player5: 0,
    player6: 0
}

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

        // put find beatmap function here
        const currentMap = findMapInBeatmaps(currentId)
        if (currentMap) {
            nowPlayingStatsCSNumber.innerText = `${Math.round(parseFloat(currentMap.cs) * 10) / 10}`
            nowPlayingStatsLENNumber.innerText = `${Math.floor(currentMap.songLength / 60)}:${Math.round(currentMap.songLength % 60).toString().padStart(2, '0')}`
            nowPlayingStatsARNumber.innerText = `${Math.round(parseFloat(currentMap.ar) * 10) / 10}`
            nowPlayingStatsBPMNumber.innerText = `${Math.round(parseFloat(currentMap.bpm) * 10) / 10}`
            nowPlayingStatsODNumber.innerText = `${Math.round(parseFloat(currentMap.od) * 10) / 10}`
            nowPlayingStatsSRNumber.innerText = `${Math.round(parseFloat(currentMap.difficultyrating) * 100) / 100}★`

            nowPlayingMod.style.display = "block"
            nowPlayingMod.innerText = `${currentMap.mod}${currentMap.order}`

            modInfoContainer.style.left = "-330px"
            if (currentMap.hasOwnProperty("additional_mod")) {
                let newMod = currentMap.additional_mod
                if (newMod in funMods) {
                    currentMod.innerText = funMods[newMod].modName
                    modInfoText.innerText = funMods[newMod].modMessage
                    modInfoContainer.style.left = "0px"
                }
            }
        } else {
            nowPlayingStatsCSNumber.innerText = `${message.difficulty.circle_size}`;
            let seconds = message.length / 1000
            nowPlayingStatsLENNumber.innerText =`${Math.floor(seconds / 60)}:${(Math.round(seconds % 60)).toString().padStart(2, '0')}`
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
    if (data.type === "MultiplayerRoomState") {
    /**
     * @typedef {{
     *     room_name: string
     *     room_state: string
     * }} message
     */
        roomState = message.room_state
        // Room state
        if (roomState == "Open" || roomState == "Closed") {
            // Chat showing
            resultsDisplayed = false
            teamRedSection.style.height = "100px"
            teamBlueSection.style.height = "100px"
            teamRedScoreSection.style.opacity = 0
            teamBlueScoreSection.style.opacity = 0
            chatDisplay.style.left = "15px"
            currentScoreBar.style.opacity = 0

            // Show ready states
            for (let i = 0; i < playerReadyStates.length; i++) {
                playerReadyStates[i].style.display = "block"
                playerInfoCombos[i].style.display = "none"
                playerInfoAccuracies[i].style.display = "none"
                playerInfoScores[i].style.display = "none"
            }

            let player_slots = [0, 1, 2, 3, 4, 5]

            // Show current ready state
            let playersShown = 0
            for (let key in message.room_users) {
                const player = message.room_users[key]

                if (playersShown >= 6) break
                if (player.slot_index >= 0 && player.slot_index <= 5) {
                    playersShown++
                } else continue
                if (player.user_state === "Spectating") continue

                // Displaying player information
                player_slots = player_slots.filter(int => int !== player.slot_index)
                const playerInformationConatiner = document.getElementById(`playerInfo${player.slot_index}`)
                playerInformationConatiner.style.display = "block"
                playerInformationConatiner.children[1].style.backgroundImage = `url("https://a.ppy.sh/${key}")`
                playerInformationConatiner.children[2].innerText = player.username
                playerInformationConatiner.children[6].setAttribute("src", `static/${(player.user_state === "Ready")? "check.svg" : "blank.png"}`)

                // Team Ids
                playerInformationConatiner.children[0].style.backgroundColor = player.team_id === 0 ? "var(--teamRedColour)" : player.team_id === 1 ? "var(--teamBlueColour)" : "darkslategray";
            }

            for (let i = 0; i < player_slots.length; i++) {
                document.getElementById(`playerInfo${player_slots[i]}`).style.display = "none"
            }
        } else if (roomState == "WaitingForLoad" || roomState == "Playing") {
            // Gameplay showing
            resultsDisplayed = false
            teamRedSection.style.height = "175px"
            teamBlueSection.style.height = "175px"
            teamRedScoreSection.style.opacity = 1
            teamBlueScoreSection.style.opacity = 1
            chatDisplay.style.left = "-335px"
            currentScoreBar.style.opacity = 1

            // Hide ready state
            for (let i = 0; i < playerReadyStates.length; i++) {
                playerReadyStates[i].style.display = "none"
                playerInfoCombos[i].style.display = "block"
                playerInfoAccuracies[i].style.display = "block"
                playerInfoScores[i].style.display = "block"
            }
        } else if (roomState == "Results" && !resultsDisplayed) {
            // Show chat after 20 seconds
            resultsDisplayed = true
            
            // Set star count
            if (!warmupMode) {
                if (currentScoreRed > currentScoreBlue) changeStarCount("red", "plus")
                else if (currentScoreBlue > currentScoreRed) changeStarCount("blue", "plus")
                else if (currentRedAvgAccuracy > currentBlueAvgAccuracy) changeStarCount("red", "plus")
                else if (currentBlueAvgAccuracy > currentRedAvgAccuracy) changeStarCount("blue", "plus")
            }

            setTimeout(() => {
                teamRedSection.style.height = "100px"
                teamBlueSection.style.height = "100px"
                teamRedScoreSection.style.opacity = 0
                teamBlueScoreSection.style.opacity = 0
                chatDisplay.style.left = "15px"
                currentScoreBar.style.opacity = 0
            }, 20000)

            // Hide ready state
            for (let i = 0; i < playerReadyStates.length; i++) {
                playerReadyStates[i].style.display = "none"
                playerInfoCombos[i].style.display = "block"
                playerInfoAccuracies[i].style.display = "block"
                playerInfoScores[i].style.display = "block"
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

        currentRedCount = 0
        currentBlueCount = 0
        currentRedTotalAccuracy = 0
        currentBlueTotalAccuracy = 0
        currentRedAvgAccuracy = 0
        currentBlueAvgAccuracy = 0

        let player_slots = [0, 1, 2, 3, 4, 5]

        // Check for gameplay and whether results are displayed
        for (let key in message.player_states) {
            const player = message.player_states[key]
            const score = player.total_score
            const accuracy = player.accuracy

            // Displaying player information
            const playerInformationConatiner = document.getElementById(`playerInfo${player.slot_index}`)
            if (roomState === "Playing" || roomState === "WaitingForLoad") {
                player_slots = player_slots.filter(int => int !== player.slot_index)
                playerInformationConatiner.style.display = "block"
                playerInformationConatiner.children[1].style.backgroundImage = `url("https://a.ppy.sh/${key}")`
                playerInformationConatiner.children[2].innerText = player.username
            }

            if (roomState !== "Open") {
                scoreAnimation[`playerInfoScore${player.slot_index}`].update(player.total_score)
                scoreAnimation[`playerInfoAccuracyNumber${player.slot_index}`].update(player.accuracy * 100)
                scoreAnimation[`playerInfoComboNumber${player.slot_index}`].update(player.combo)
                if (combos[`player${player.slot_index}`] >= 10 && player.combo < combos[`player${player.slot_index}`]){ 
                    const playerInfo = document.getElementById(`playerInfo${player.slot_index}`)
                    playerInfo.style.transition = "color 300ms cubic-bezier(0, 1, 0.4, 1)"
                    playerInfo.style.color = "#fb6a68"

                    setTimeout(() => {
                        playerInfo.style.transition = "color 200ms cubic-bezier(0, 1, 0.4, 1)"
                        playerInfo.style.color = "white"
                    }, 500)
                }
    
                // Team Ids
                if (player.team_id === 0) {
                    currentScoreRed += parseInt(score)
                    currentRedTotalAccuracy += accuracy
                    playerInformationConatiner.children[0].style.backgroundColor = "var(--teamRedColour)"
                    currentRedCount++
                } else if (player.team_id === 1) {
                    currentScoreBlue += parseInt(score)
                    currentBlueTotalAccuracy += accuracy
                    playerInformationConatiner.children[0].style.backgroundColor = "var(--teamBlueColour)"
                    currentBlueCount++
                } else {
                    playerInformationConatiner.children[0].style.backgroundColor = "darkslategray"
                }
                combos[`player${player.slot_index}`] = player.combo
            } else {
                scoreAnimation[`playerInfoScore${player.slot_index}`].update(0)
                scoreAnimation[`playerInfoAccuracyNumber${player.slot_index}`].update(0)
                scoreAnimation[`playerInfoComboNumber${player.slot_index}`].update(0)
                combos[`player${player.slot_index}`] = 0
            }
        }

        // Remove anyone whose slots are not available
        if (roomState === "Playing") {
            for (let i = 0; i < player_slots.length; i++) {
                document.getElementById(`playerInfo${player_slots[i]}`).style.display = "none"
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
            teamRedCurrentScore.style.fontWeight = "800"
            teamBlueCurrentScore.style.fontWeight = "500"
            currentScoreBarRed.style.height = `${movingScoreBarRectangleHeight}px`
            currentScoreBarBlue.style.height = "0px"
            currentScoreDifference.style.backgroundColor = "var(--teamRedColour)"
            currentScoreDifference.style.color = "white"
            currentScoreDifferenceNumber.style.color = "white"
        } else if (currentScoreRed === currentScoreBlue) {
            teamRedCurrentScore.style.fontWeight = "500"
            teamBlueCurrentScore.style.fontWeight = "500"
            currentScoreBarRed.style.height = "0px"
            currentScoreBarBlue.style.height = "0px"
            currentScoreDifference.style.backgroundColor = "white"
            currentScoreDifference.style.color = "black"
            currentScoreDifferenceNumber.style.color = "black"
        } else if (currentScoreBlue > currentScoreRed) {
            teamRedCurrentScore.style.fontWeight = "500"
            teamBlueCurrentScore.style.fontWeight = "800"
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

// Get Cookie
function getCookie(cname) {
    let name = cname + "="
    let ca = document.cookie.split(';')
    for(let i = 0; i < ca.length; i++) {
        let c = ca[i]
        while (c.charAt(0) == ' ') c = c.substring(1)
        if (c.indexOf(name) == 0) return c.substring(name.length, c.length);
    }
    return "";
}

// Change map picker
let currentMapPicker
function changeCurrentPicker(team) {
    currentMapPicker = team
    document.cookie = `currentPicker=${currentMapPicker}; path=/`
    setCurrentPicker()
}

// Set current picker
function setCurrentPicker() {
    // Set current picker
    if (currentMapPicker === "redPicker") { 
        teamMapPicks[0].style.display = "block"
        teamMapPicks[1].style.display = "none"
    } else if (currentMapPicker === "bluePicker") {
        teamMapPicks[0].style.display = "none"
        teamMapPicks[1].style.display = "block"
    } else {
        teamMapPicks[0].style.display = "none"
        teamMapPicks[1].style.display = "none"
    }
}

// Set cookie information
setInterval(() => {
    // Get warmup mode
    warmupMode = (getCookie("warmupMode") == "true") ? true : false
    warmupCheck()

    // --- Set Team Names
    currentTeamRedName = getCookie("currentRedTeamName")
    currentTeamBlueName = getCookie("currentBlueTeamName")
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

    // --- Set map picker ---
    currentMapPicker = getCookie("currentPicker")
    // Display stars
    currentStarRed = parseInt(getCookie("currentStarRed"))
    currentStarBlue = parseInt(getCookie("currentStarBlue"))
    generateStarsDisplay()

    // Check if tiebreaker
    // Check if warmup
    if (!findMapInBeatmaps(currentId)) return
    if (findMapInBeatmaps(currentId).mod === "TB" || warmupMode) currentMapPicker = "noPicker"
    // Set current picker
    setCurrentPicker()
}, 500)