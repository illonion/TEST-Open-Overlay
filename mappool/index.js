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
    teamRedWinStars.innerHTML = ""
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
    }
}
mappoolRequest.open("GET", `https://api.jsonbin.io/v3/b/${mappoolJsonBinId}`, false)
mappoolRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
mappoolRequest.send()