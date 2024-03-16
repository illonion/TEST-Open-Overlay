// Websocket
const socket = new ReconnectingWebSocket('ws://127.0.0.1:7270/')
socket.onclose = event => {
    console.log('Socket Closed Connection: ', event)
    socket.send('Client Closed!')
}
socket.onopen = () => {
    console.log('Successfully Connected')
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
        let scoreRed = Object.values(message.player_states).filter(s => s.team_id === 0).map(s => s.total_score).reduce((a, b) => a + b);
        let scoreBlue = Object.values(message.player_states).filter(s => s.team_id === 1).map(s => s.total_score).reduce((a, b) => a + b);
        let scoreDelta = Math.abs(scoreRed - scoreBlue);
        console.log(`score: ${scoreRed} vs ${scoreBlue} (delta: ${scoreDelta})`);
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
