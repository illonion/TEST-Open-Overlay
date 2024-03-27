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
const redTeamWinStars = document.getElementById("redTeamWinStars")
const blueTeamWinStars = document.getElementById("blueTeamWinStars")
let currentBestOf = 0, currentFirstTo = 0
let currentStarRed = 0, currentStarBlue = 0
// Generate stars
function generateStarsDisplay() {
    if (currentStarRed > currentFirstTo) currentStarRed = currentFirstTo
    if (currentStarBlue > currentFirstTo) currentStarBlue = currentFirstTo
    if (currentStarRed < 0) currentStarRed = 0
    if (currentStarBlue < 0) currentStarBlue = 0

    // Generate or remove new (blank) stars
    redTeamWinStars.innerHTML = ""
    blueTeamWinStars.innerHTML = ""

    // Red stars
    createStars(redTeamWinStars, "teamRedWinStar", "teamRedWinStarFill", currentStarRed)
    createStars(redTeamWinStars, "teamRedWinStar", null, currentFirstTo - currentStarRed)

    // Blue stars
    createStars(blueTeamWinStars, "teamBlueWinStar", "teamBlueWinStarFill", currentStarBlue)
    createStars(blueTeamWinStars, "teamBlueWinStar", null, currentFirstTo - currentStarBlue)
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

// Json Bin Details
const playerJsonBinId = ""
const mappoolJsonBinId = ""
const jsonBinApiKey = ""
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
const redPickTiles = document.getElementById("redPickTiles")
const bluePickTiles = document.getElementById("bluePickTiles")
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

        for (let i = 0; i < (currentFirstTo - 1) * 2; i++) {
            const mapInformationContainer = document.createElement("div")
            mapInformationContainer.classList.add("mapInformationContainer")

            const mapInformationBackgroundImage = document.createElement("div")
            mapInformationBackgroundImage.classList.add("mapInformationBackgroundImage")

            const mapInformationGradient = document.createElement("div")
            mapInformationGradient.classList.add("mapInformationGradient")

            const mapInformationModContainer = document.createElement("div")
            mapInformationModContainer.classList.add("mapInformationModContainer")

            const mapInformationModIdText = document.createElement("div")
            mapInformationModIdText.classList.add("mapInformationModIdText")

            const mapInformationModIdNumber = document.createElement("div")
            mapInformationModIdNumber.classList.add("mapInformationModIdNumber")

            const mapInformationSongName = document.createElement("div")
            mapInformationSongName.classList.add("mapInformationSongName")

            const mapInformationMapperText = document.createElement("div")
            mapInformationMapperText.innerText = "MAPPER"
            mapInformationMapperText.classList.add("mapInformationMapperText")

            const mapInformationMapperName = document.createElement("div")
            mapInformationMapperName.classList.add("mapInformationMapperName")

            const mapInformationDifficultyText = document.createElement("div")
            mapInformationDifficultyText.innerText = "DIFFICULTY"
            mapInformationDifficultyText.classList.add("mapInformationDifficultyText")

            const mapInformationDifficultyName = document.createElement("div")
            mapInformationDifficultyName.classList.add("mapInformationDifficultyName")

            const mapInformationPickerOverlay = document.createElement("div")
            mapInformationPickerOverlay.classList.add("mapInformationPickerOverlay")

            const mapInformationWinner = document.createElement("div")
            mapInformationWinner.classList.add("mapInformationWinner")

            mapInformationModContainer.append(mapInformationModIdText, mapInformationModIdNumber)
            mapInformationContainer.append(mapInformationBackgroundImage, mapInformationGradient, mapInformationModContainer, 
                mapInformationSongName, mapInformationMapperText, mapInformationMapperName, mapInformationDifficultyText,
                mapInformationDifficultyName, mapInformationPickerOverlay, mapInformationWinner)

            if (i % 2 === 0) {
                redPickTiles.append(mapInformationContainer)
            } else {
                bluePickTiles.append(mapInformationContainer)
            }   
        }
    }
}
mappoolRequest.open("GET", `https://api.jsonbin.io/v3/b/${mappoolJsonBinId}`, false)
mappoolRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
mappoolRequest.send()

// Team Details
const redTeamNameText = document.getElementById("redTeamNameText")
const blueTeamNameText = document.getElementById("blueTeamNameText")
const redTeamBackgroundImage = document.getElementById("redTeamBackgroundImage")
const blueTeamBackgroundImage = document.getElementById("blueTeamBackgroundImage")
const redTeamAverageRankNumber = document.getElementById("redTeamAverageRankNumber")
const blueTeamAverageRankNumber = document.getElementById("blueTeamAverageRankNumber")
let currentTeamRedName, currentTeamBlueName

// Whenever socket sends a message
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    const message = data.message

    // Team Name changing
    if (data.type === "MultiplayerRoomState") {
        /**
         * @typedef {{
         *     room_name: string
         *     room_state: string
         * }} message
         */

        // Room Name
        const roomName = message.room_name
        currentTeamRedName = roomName.split("(")[1].split(")")[0]
        currentTeamBlueName = roomName.split("(")[2].split(")")[0]
        redTeamNameText.innerText = currentTeamRedName
        blueTeamNameText.innerText = currentTeamBlueName

        for (let i = 0; i < allPlayers.length; i++) {
            if (currentTeamRedName === allPlayers[i].team_name) {
                updateTeamDisplay(allPlayers[i], redTeamBackgroundImage, redTeamAverageRankNumber, "redTeamPlayer");
            } else if (currentTeamBlueName === allPlayers[i].team_name) {
                updateTeamDisplay(allPlayers[i], blueTeamBackgroundImage, blueTeamAverageRankNumber, "blueTeamPlayer");
            }
        }
    }
}

function updateTeamDisplay(team, backgroundElement, averageRankElement, playerPrefix) {
    backgroundElement.style.backgroundImage = `url("${team.banner_url}")`;
    averageRankElement.innerText = Math.round(team.player_ranks.reduce((acc, val) => acc + val, 0) / team.player_ranks.length);

    for (let j = 0; j < 5; j++) {
        const playerElement = document.getElementById(`${playerPrefix}${j + 1}`);
        if (j < team.player_ids.length) {
            playerElement.style.display = "block";
            playerElement.children[1].setAttribute("src", `https://a.ppy.sh/${team.player_ids[j]}`);
            playerElement.children[3].innerText = team.player_names[j];
            playerElement.children[5].innerText = `#${team.player_ranks[j]}`;
        } else {
            playerElement.style.display = "none";
        }
    }
}