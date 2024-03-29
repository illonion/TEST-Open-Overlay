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
const playerJsonBinId = "65fa6cc71f5677401f40141d"
const mappoolJsonBinId = "65fada0a266cfc3fde9b22a2"
const jsonBinApiKey = "$2a$10$uOzHDtw4jtHSt3F7djDsGOX3N.xJFUOvb0LmynNLKpjZyuhmP3hqm"
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
const redBanTiles = document.getElementById("redBanTiles")
const blueBanTiles = document.getElementById("blueBanTiles")
const redPickTiles = document.getElementById("redPickTiles")
const bluePickTiles = document.getElementById("bluePickTiles")
const sideBarMapSection = document.getElementById("sideBarMapSection")
mappoolRequest.onreadystatechange = () => {
    if (mappoolRequest.readyState == XMLHttpRequest.DONE) {
        // beatmap info
        mappool = JSON.parse(mappoolRequest.responseText).record
        allBeatmaps = mappool.beatmaps

        for (let i = 0; i < allBeatmaps.length; i++) {
            // Make new button
            const mappoolButton = document.createElement("button")
            mappoolButton.setAttribute("id", allBeatmaps[i].beatmapID)
            mappoolButton.innerText = allBeatmaps[i].mod + allBeatmaps[i].order
            mappoolButton.classList.add("mappoolButton", "sideBarButton")
            mappoolButton.addEventListener("click", mapClickEvent)
            sideBarMapSection.append(mappoolButton)     
        }
        
        // Round name info
        const currentRoundName = mappool.roundName
        roundName.setAttribute("src",`../_shared/logo/static/${currentRoundName.toLowerCase().replace(/ /g, "-")}.png`)

        // Get round information
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

        // Generate pick tiles
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

// Find map
const findMapInMappool = beatmapID => {
    for (let i = 0; i < allBeatmaps.length; i++) {
        if (allBeatmaps[i].beatmapID == beatmapID) return allBeatmaps[i]
    }
    return
}

// Team Details
const redTeamNameText = document.getElementById("redTeamNameText")
const blueTeamNameText = document.getElementById("blueTeamNameText")
const redTeamBackgroundImage = document.getElementById("redTeamBackgroundImage")
const blueTeamBackgroundImage = document.getElementById("blueTeamBackgroundImage")
const redTeamAverageRankNumber = document.getElementById("redTeamAverageRankNumber")
const blueTeamAverageRankNumber = document.getElementById("blueTeamAverageRankNumber")
let currentTeamRedName, currentTeamBlueName

// Chat Section
const chatContainerDisplay = document.getElementById("chatContainerDisplay")
let chatLength = 0

// Whenever socket sends a message
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    const message = data.message

    // Team details changing
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

    // Chat messages
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
            (chatLength === 0 || chatLength > message.chat_messages.length) ? (chatContainerDisplay.innerHTML = "", chatLEngth = 0) : null

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
                chatContainerDisplay.append(chatMessageContainer)
            }

            chatContainerDisplay.scrollTop = chatContainerDisplay.scrollHeight;
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

// Change next action
const sideBarNextActionText = document.getElementById("sideBarNextActionText")
function changeNextAction(colour, action) {
    // Change text
    sideBarNextActionText.innerText = `${colour} ${action}`

    // Remove all animations
    function removeAllTileAnimations(tiles) {
        for (let i = 0; i < tiles.childElementCount; i++) {
            tiles.children[i].lastElementChild.classList.remove("mapInformationPickerCurrent")
            tiles.children[i].lastElementChild.previousElementSibling.classList.remove("mapInformationPickerCurrent")
        }
    }
    removeAllTileAnimations(redBanTiles)
    removeAllTileAnimations(blueBanTiles)
    removeAllTileAnimations(redPickTiles)
    removeAllTileAnimations(bluePickTiles)

    // Function to add class to the appropriate tile
    function handleAction(action, tiles) {
        for (let i = 0; i < tiles.childElementCount; i++) {
            const tile = tiles.children[i]
            if (tile.hasAttribute("id")) continue
            const targetElement = action === "Pick" ? tile.lastElementChild.previousElementSibling : tile.lastElementChild
            targetElement.classList.add("mapInformationPickerCurrent")
            break
        }
    }

    // Red ban
    if (action === "Ban" && colour === "Red") {
        handleAction(action, redBanTiles)
    } else if (action === "Ban" && colour === "Blue") {
        handleAction(action, blueBanTiles)
    } else if (action === "Pick" && colour === "Red") {
        handleAction(action, redPickTiles)
    } else if (action === "Pick" && colour === "Blue") {
        handleAction(action, bluePickTiles)
    }
}
changeNextAction("Red", "Ban")


const toggleAutopickText = document.getElementById("toggleAutopickText")
function autopickToggle() {
    if (toggleAutopickText.innerText === "ON") toggleAutopickText.innerText = "OFF"
    else toggleAutopickText.innerText = "ON"
}

const redTeamProtectMap = document.getElementById("redTeamProtectMap")
const blueTeamProtectMap = document.getElementById("blueTeamProtectMap")
function mapClickEvent() {
    const currentId = this.id
    const currentBeatmap = findMapInMappool(currentId)
    const currentMod = currentBeatmap.mod
    console.log(currentId, currentBeatmap)

    // Protects
    function setProtect(mapInformationElement) {
        mapInformationElement.style.display = "block"
        mapInformationElement.style.color = `var(--${currentMod}Colour)`
        mapInformationElement.children[0].style.backgroundImage = `url("${currentBeatmap.imgURL}")`
        mapInformationElement.children[2].style.backgroundColor = `var(--${currentMod}Colour)`
        mapInformationElement.children[2].children[0].innerText = currentMod
        mapInformationElement.children[2].children[1].innerText = currentBeatmap.order
        mapInformationElement.children[3].innerText = currentBeatmap.songName
        mapInformationElement.children[5].innerText = currentBeatmap.mapper
        mapInformationElement.children[7].innerText = currentBeatmap.difficultyname
    }
    if (sideBarNextActionText.innerText === "Red Protect") {
        setProtect(redTeamProtectMap)
    } else if (sideBarNextActionText.innerText === "Blue Protect") {
        setProtect(blueTeamProtectMap)
    }

    // Set Tile
    function setTile(currentTile) {
        currentTile.setAttribute("id", `${currentId}-Ban`)
        currentTile.style.backgroundImage = `url(${currentBeatmap.beatmapID})`
        currentTile.style.color = `var(--${currentMod}Colour)`
        currentTile.style.boxShadow = `var(--boxShadow${currentMod})`
        currentTile.children[0].style.backgroundImage = `url("${currentBeatmap.imgURL}")`
        currentTile.children[2].style.backgroundColor = `var(--${currentMod}Colour)`
        currentTile.children[2].children[0].innerText = currentMod
        currentTile.children[2].children[1].innerText = currentBeatmap.order
        currentTile.children[3].innerText = currentBeatmap.songName
        currentTile.children[5].innerText = currentBeatmap.mapper
        currentTile.children[7].innerText = currentBeatmap.difficultyname
        currentTile.children[8].style.display = "none"
    }

    // Bans
    function setBan(banTiles) {
        let currentTile
        if (banTiles.children[0].hasAttribute("id")) currentTile = banTiles.children[1]
        else currentTile = banTiles.children[0]

        setTile(currentTile)
    }
    if (sideBarNextActionText.innerText === "Red Ban") {
        setBan(redBanTiles)
    } else if (sideBarNextActionText.innerText === "Blue Ban") {
        setBan(blueBanTiles)
    }

    // Picks
    function setPicks(banTiles) {
        let currentTile
        for (let i = 0; i < banTiles.childElementCount; i++) {
            if (banTiles.children[i].hasAttribute("id")) continue
            currentTile = banTiles.children[i]
            break
        }

        if (currentTile === undefined) return

        setTile(currentTile)
    }
    if (sideBarNextActionText.innerText === "Red Pick") {
        setPicks(redPickTiles)
    } else if (sideBarNextActionText.innerText === "Blue Pick") {
        setPicks(bluePickTiles)
    }

    // Set new picks
    if (sideBarNextActionText.innerText === "Red Pick") sideBarNextActionText.innerText = "Blue Pick"
    else if (sideBarNextActionText.innerText === "Blue Pick") sideBarNextActionText.innerText = "Red Pick"

    // Set new bans
    const banNumber = banCounter()
    if (sideBarNextActionText.innerText === "Blue Ban" && banNumber === 1) changeNextAction("Red", "Ban")
    else if (sideBarNextActionText.innerText === "Red Ban" && banNumber === 1) changeNextAction("Blue", "Ban")
    else if (sideBarNextActionText.innerText === "Blue Ban" && banNumber === 2) changeNextAction("Blue", "Ban")
    else if (sideBarNextActionText.innerText === "Red Ban" && banNumber === 2) changeNextAction("Red", "Ban")
    else if (sideBarNextActionText.innerText === "Blue Ban" && banNumber === 3) changeNextAction("Red", "Ban")
    else if (sideBarNextActionText.innerText === "Red Ban" && banNumber === 3) changeNextAction("Blue", "Ban")

    // Set new protects
    if (sideBarNextActionText.innerText === "Red Protect") changeNextAction("Blue", "Protect")
    else if (sideBarNextActionText.innerText === "Blue Protect") changeNextAction("Red", "Protect")
}
function banCounter() {
    let banCounter = 0
    for (let i = 0; i < redBanTiles.childElementCount; i++) {
        if (redBanTiles.children[i].hasAttribute("id")) banCounter++
    }
    for (let i = 0; i < blueBanTiles.childElementCount; i++) {
        if (blueBanTiles.children[i].hasAttribute("id")) banCounter++
    }
    return banCounter
}