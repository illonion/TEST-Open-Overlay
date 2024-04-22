const matchJsonBinId = "661801daad19ca34f8586133"
const playerJsonBinId = "66180208acd3cb34a836d684"
const mappoolJsonBinId = "66180211acd3cb34a836d689"
const jsonBinApiKey = "$2a$10$2VisaCnG83oxRZcO.szDy.x7PxoJvW22tzOYD7AQFcbHaHjfGvICy" // Change api key

// Match information
const sideBarSelect = document.getElementById("sideBarSelect")
let allMatches
let allMatchesRequest = new XMLHttpRequest()
allMatchesRequest.onreadystatechange = () => {
    if (allMatchesRequest.readyState == XMLHttpRequest.DONE) {
        allMatches = JSON.parse(allMatchesRequest.responseText).record
        for (let i = 0; i < allMatches.length; i++) {
            const sideBarSelectOption = document.createElement("option")
            sideBarSelectOption.innerText = `Match ${allMatches[i].match_number}`
            sideBarSelectOption.setAttribute("value", allMatches[i].match_number)
            sideBarSelect.append(sideBarSelectOption)
        }
        sideBarSelect.setAttribute("size", sideBarSelect.childElementCount)
    }
}
allMatchesRequest.open("GET", `https://api.jsonbin.io/v3/b/${matchJsonBinId}`, false)
allMatchesRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
allMatchesRequest.send()

// Mappool
let mappoolRequest = new XMLHttpRequest()
mappoolRequest.onreadystatechange = () => {
    if (mappoolRequest.readyState == XMLHttpRequest.DONE) {
        // Round name info
        const currentRoundName = JSON.parse(mappoolRequest.responseText).record.roundName
        roundName.setAttribute("src",`../_shared/logo/static/${currentRoundName.toLowerCase().replace(/ /g, "-")}.png`)
    }
}
mappoolRequest.open("GET", `https://api.jsonbin.io/v3/b/${mappoolJsonBinId}`, false)
mappoolRequest.setRequestHeader("X-Master-Key", jsonBinApiKey)
mappoolRequest.send()

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

// Applying changes
const redTeamIntroBannerImage = document.getElementById("redTeamIntroBannerImage")
const redTeamIntroTeamName = document.getElementById("redTeamIntroTeamName")
const redTeamIntroSeedNumber = document.getElementById("redTeamIntroSeedNumber")
const redTeamIntroAvgRankNumber = document.getElementById("redTeamIntroAvgRankNumber")
const redTeamIntroPlayers = document.getElementById("redTeamIntroPlayers")

const blueTeamIntroBannerImage = document.getElementById("blueTeamIntroBannerImage")
const blueTeamIntroTeamName = document.getElementById("blueTeamIntroTeamName")
const blueTeamIntroSeedNumber = document.getElementById("blueTeamIntroSeedNumber")
const blueTeamIntroAvgRankNumber = document.getElementById("blueTeamIntroAvgRankNumber")
const blueTeamIntroPlayers = document.getElementById("blueTeamIntroPlayers")

function applyChanges() {
    for (let i = 0; i < allMatches.length; i++) {
        if (allMatches[i].match_number == sideBarSelect.value) {
            let currentRedTeam = allMatches[i].team_name_red
            let currentBlueTeam = allMatches[i].team_name_blue
            let teamCounter = 0

            for (let j = 0; j < allPlayers.length; j++) {
                if (allPlayers[j].team_name === currentRedTeam) {
                    redTeamIntroPlayers.innerHTML = ""
                    // Set top information
                    redTeamIntroBannerImage.style.backgroundImage = `url("${allPlayers[j].banner_url}")`
                    redTeamIntroTeamName.innerText = allPlayers[j].team_name
                    redTeamIntroSeedNumber.innerText = allPlayers[j].seed.toLocaleString()
                    redTeamIntroAvgRankNumber.innerText = Math.round(allPlayers[j].player_ranks.reduce((a, b) => a + b, 0) / allPlayers[j].player_ranks.length).toLocaleString()

                    // Set player information
                    for (let k = 0; k < allPlayers[j].player_names.length; k++) {
                        const teamIntroPlayer = document.createElement("div")
                        teamIntroPlayer.classList.add("teamIntroPlayer")

                        const teamIntroPlayerLine1 = document.createElement("div")
                        teamIntroPlayerLine1.classList.add("teamIntroPlayerLine1", "redTeamIntroPlayerLine1")

                        const teamIntroPlayerLine2 = document.createElement("div")
                        teamIntroPlayerLine2.classList.add("teamIntroPlayerLine2", "redTeamIntroPlayerLine2")

                        const teamIntroPlayerLine3 = document.createElement("div")
                        teamIntroPlayerLine3.classList.add("teamIntroPlayerLine3", "redTeamIntroPlayerLine3")

                        const teamIntroPlayerProfilePicture = document.createElement("img")
                        teamIntroPlayerProfilePicture.setAttribute("src", `https://a.ppy.sh/${allPlayers[j].player_ids[k]}`)
                        teamIntroPlayerProfilePicture.classList.add("teamIntroPlayerProfilePicture")

                        const teamIntroPlayerPlayerName = document.createElement("div")
                        teamIntroPlayerPlayerName.innerText = allPlayers[j].player_names[k]
                        teamIntroPlayerPlayerName.classList.add("teamIntroPlayerPlayerName")

                        const teamIntroPlayerRank = document.createElement("div")
                        teamIntroPlayerRank.innerText = `#${allPlayers[j].player_ranks[k].toLocaleString()}`
                        teamIntroPlayerRank.classList.add("teamIntroPlayerRank", "redTeamIntroPlayerRank")

                        teamIntroPlayer.append(teamIntroPlayerLine1, teamIntroPlayerLine2, teamIntroPlayerLine3, 
                            teamIntroPlayerProfilePicture, teamIntroPlayerPlayerName, teamIntroPlayerPlayerName, teamIntroPlayerRank)
                        redTeamIntroPlayers.append(teamIntroPlayer)
                    }
                    teamCounter++
                }
                if (allPlayers[j].team_name === currentBlueTeam) {
                    blueTeamIntroPlayers.innerHTML = ""
                    // Set top information
                    blueTeamIntroBannerImage.style.backgroundImage = `url("${allPlayers[j].banner_url}")`
                    blueTeamIntroTeamName.innerText = allPlayers[j].team_name
                    blueTeamIntroSeedNumber.innerText = allPlayers[j].seed.toLocaleString()
                    blueTeamIntroAvgRankNumber.innerText = Math.round(allPlayers[j].player_ranks.reduce((a, b) => a + b, 0) / allPlayers[j].player_ranks.length).toLocaleString()

                    // Set player information
                    for (let k = 0; k < allPlayers[j].player_names.length; k++) {
                        const teamIntroPlayer = document.createElement("div")
                        teamIntroPlayer.classList.add("teamIntroPlayer")

                        const teamIntroPlayerLine1 = document.createElement("div")
                        teamIntroPlayerLine1.classList.add("teamIntroPlayerLine1", "blueTeamIntroPlayerLine1")

                        const teamIntroPlayerLine2 = document.createElement("div")
                        teamIntroPlayerLine2.classList.add("teamIntroPlayerLine2", "blueTeamIntroPlayerLine2")

                        const teamIntroPlayerLine3 = document.createElement("div")
                        teamIntroPlayerLine3.classList.add("teamIntroPlayerLine3", "blueTeamIntroPlayerLine3")

                        const teamIntroPlayerProfilePicture = document.createElement("img")
                        teamIntroPlayerProfilePicture.setAttribute("src", `https://a.ppy.sh/${allPlayers[j].player_ids[k]}`)
                        teamIntroPlayerProfilePicture.classList.add("teamIntroPlayerProfilePicture")

                        const teamIntroPlayerPlayerName = document.createElement("div")
                        teamIntroPlayerPlayerName.innerText = allPlayers[j].player_names[k]
                        teamIntroPlayerPlayerName.classList.add("teamIntroPlayerPlayerName")

                        const teamIntroPlayerRank = document.createElement("div")
                        teamIntroPlayerRank.innerText = `#${allPlayers[j].player_ranks[k].toLocaleString()}`
                        teamIntroPlayerRank.classList.add("teamIntroPlayerRank", "blueTeamIntroPlayerRank")

                        teamIntroPlayer.append(teamIntroPlayerLine1, teamIntroPlayerLine2, teamIntroPlayerLine3, 
                            teamIntroPlayerProfilePicture, teamIntroPlayerPlayerName, teamIntroPlayerPlayerName, teamIntroPlayerRank)
                        blueTeamIntroPlayers.append(teamIntroPlayer)
                    }
                    teamCounter++
                }
                if (teamCounter === 2) break
            }
        }
    }
}