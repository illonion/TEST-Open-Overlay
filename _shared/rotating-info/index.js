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