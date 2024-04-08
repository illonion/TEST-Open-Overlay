const artistName = document.getElementById("artistName")
const songName = document.getElementById("songName")

// Websocket
const socket = new ReconnectingWebSocket('ws://127.0.0.1:7270/')
socket.onclose = event => {
    console.log('Socket Closed Connection: ', event)
    socket.send('Client Closed!')
}
socket.onopen = () => console.log('Successfully Connected')

// Whenever socket sends a message
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    const message = data.message

    console.log(message)
    /**
     * @typedef {{
        *     metadata: {
        *         artist: string
        *         title: string
        *     }
        * }} message
    */
    if (data.type === "Beatmap") {
        if (message.online_id === 0 && message.metadata.title === "no beatmaps available!") {
            artistName.innerText = ""
            songName.innerText = ""
            return
        }
        artistName.innerText = message.metadata.artist
        songName.innerText = message.metadata.title
    }
}