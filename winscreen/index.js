// Json Bin Details
const playerJsonBinId = "66180208acd3cb34a836d684"
const jsonBinApiKey = "$2a$10$2VisaCnG83oxRZcO.szDy.x7PxoJvW22tzOYD7AQFcbHaHjfGvICy" // Change api key
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
function getArrayCookie(name) {
    const cookieValue = document.cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`);
    return cookieValue ? JSON.parse(cookieValue.pop()) : null;
}

// Win information
const winnerContainerPicksWonBoxes = document.getElementById("winnerContainerPicksWonBoxes")
let currentBestOf
let currentMapIds
let currentMapWinners

// Team information
const winnerContainerTopTeamName = document.getElementById("winnerContainerTopTeamName")
const winnerContainerTopSeedNumber = document.getElementById("winnerContainerTopSeedNumber")
const winnerContainerTeamBanner = document.getElementById("winnerContainerTeamBanner")
let currentWinnerTeamName, currentMatchWinnerColour

// Cosmetic stuff only
const winnerContainer = document.getElementById("winnerContainer")
const winnerContainerTopCosmeticsElements = document.querySelectorAll("#winnerContainerTopCosmetics > *")
const winnerContainerWinnerPlayersText = document.getElementById("winnerContainerWinnerPlayersText")
const winnerContainerWinnerPlayerRectangles = document.querySelectorAll(".winnerContainerWinnerPlayerRectangle")

// Player containers
const winnerContainerWinnerPlayersContainer = document.getElementById("winnerContainerWinnerPlayersContainer")
setInterval(() => {
    // Set win information
    currentBestOf = parseInt(getCookie("currentBestOf"))
    currentMapIds = getArrayCookie("mapIds")
    currentMapWinners = getArrayCookie("mapWinners")

    // Make all of the cells required
    winnerContainerPicksWonBoxes.innerHTML = ""
    for (let i = 0; i < currentBestOf; i++) {
        const winnerContainerPicksWonBox = document.createElement("div")
        winnerContainerPicksWonBox.classList.add("winnerContainerPicksWonBox")

        const winnerContainerPicksWonColour = document.createElement("div")
        winnerContainerPicksWonColour.classList.add("winnerContainerPicksWonColour")

        const winnerContainerPicksWonModId = document.createElement("div")
        winnerContainerPicksWonModId.classList.add("winnerContainerPicksWonModId")

        winnerContainerPicksWonBox.append(winnerContainerPicksWonColour, winnerContainerPicksWonModId)
        winnerContainerPicksWonBoxes.append(winnerContainerPicksWonBox)
    }

    // Map Ids
    for (let i = 0; i < currentMapIds.length; i++) {
        winnerContainerPicksWonBoxes.children[i].children[1].innerText = currentMapIds[i]
    }

    // Map winners
    for (let i = 0; i < currentMapWinners.length; i++) {
        if (currentMapWinners[i] === "red") {
            winnerContainerPicksWonBoxes.children[i].children[0].style.backgroundColor = `var(--teamRedColour)`
            winnerContainerPicksWonBoxes.children[i].children[0].style.borderColor = `var(--teamRedColour)`
        } else if (currentMapWinners[i] === "blue") {
            winnerContainerPicksWonBoxes.children[i].children[0].style.backgroundColor = `var(--teamBlueColour)`
            winnerContainerPicksWonBoxes.children[i].children[0].style.borderColor = `var(--teamBlueColour)`
        }
    }

    if (currentWinnerTeamName === getCookie("currentMatchWinner")) return
    currentWinnerTeamName = getCookie("currentMatchWinner")
    currentMatchWinnerColour = getCookie("currentMatchWinnerColour")
    const matchWinnerColour = currentMatchWinnerColour.charAt(0).toUpperCase() + currentMatchWinnerColour.slice(1)

    // check for if there is a winner
    // check for if the players are loaded in yet
    if (currentWinnerTeamName === "noWinner" || !allPlayers) return

    for (let i = 0; i < allPlayers.length; i++) {
        if (allPlayers[i].team_name === currentWinnerTeamName) {
            // Set team name
            winnerContainerTopTeamName.innerText = currentWinnerTeamName

            // Set team seed
            winnerContainerTopSeedNumber.innerText = allPlayers[i].seed

            // Set team colour
            winnerContainer.style.boxShadow = `var(--boxShadow${matchWinnerColour})`
            winnerContainerTopCosmeticsElements.forEach(element => element.style.backgroundColor = `var(--team${matchWinnerColour}Colour)`)
            winnerContainerWinnerPlayersText.style.color = `var(--team${matchWinnerColour}Colour)`
            winnerContainerWinnerPlayerRectangles.forEach(element => element.style.backgroundColor = `var(--team${matchWinnerColour}Colour)`)

            // Set team banner
            winnerContainerTeamBanner.style.backgroundImage = `url("${allPlayers[i].banner_url}")`

            // Set player information
            let j = 0
            for (j; j < allPlayers[i].player_names.length; j++) {
                winnerContainerWinnerPlayersContainer.children[j].children[1].style.backgroundImage = `url("https://a.ppy.sh/${allPlayers[i].player_ids[j]}")`
                winnerContainerWinnerPlayersContainer.children[j].children[2].innerText =  allPlayers[i].player_names[j]
            }
            for (j; j < 5; j++) winnerContainerWinnerPlayersContainer.children[j].style.display = "none"
            break
        }
    }

}, 500)