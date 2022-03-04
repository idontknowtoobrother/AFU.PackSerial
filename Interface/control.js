// setbody hide
const audio = new Audio('effect.mp3');
audio.volume = 0.2

document.body.style.display = 'none'
document.getElementById('notify-text').style.display = 'none'
document.getElementsByClassName('window')[0].style.display = 'none'
document.getElementsByClassName('pack-unpack')[0].style.display = 'none'

// function addItem(itemName, itemCount){
//     return new Promise((succ, rej)=>{
//         setTimeout(()=>{
//             audio.currentTime = 0.07
//             audio.play()
//             document.getElementsByClassName('unpack-items')[0].insertAdjacentHTML("beforeend", `<div class="pack-items"> <img src="./logo_server.png" alt=""> <span id="items-label">x ${itemCount}</span> </div>`)
//             succ()
//         }, 700)
//     })
// }
// async function testAnime(){
//     for(let i = 0; i<20; i++){
//         const item1 = await addItem('test', i)
//     }
// }
// setTimeout(testAnime, 3000)


// vars
let isOnWindow = false
let isNotify = false

// functions
async function notify(text, time) {
    var notiQueue = new Promise((succeed, failed) => {
        if (isNotify) return;
        isNotify = true
        let elem = document.getElementById('notify-text')
        elem.innerHTML = text
        elem.style.display = 'block'
        setTimeout(() => {
            succeed(elem)
        }, time)
    })

    await notiQueue.then((elem) => {
        elem.style.display = 'none'
        isNotify = false
    })
}
const closeWindow = (e)=> {
    if (e!= undefined || e!= null){
        if (e.code != 'Escape' || !isOnWindow) return;
    }

    document.body.style.display = 'none'
    fetch(`https://AFU.PackSerial/CloseWindow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        }
    }).then().catch()

    isOnWindow = false
}

const animateItems = (pack) => {

    // animation items
    console.log(JSON.stringify(pack))
    closeWindow()

    // end
    fetch(`https://AFU.PackSerial/ActivedSerialCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        }
    }).then().catch()
}

const activeSerial = () => {
    var serial = document.getElementById('serial-code').value

    if (!serial) {
        notify('<span style="color:red">กรุณากรอก Serial Code ?</span>', 4000)
        return
    }

    fetch(`https://AFU.PackSerial/ActiveSerialCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            serialCode: serial
        })
    }).then().catch()
}

// event listener
document.addEventListener('keydown', function(e) {
    closeWindow(e)
})

window.addEventListener("message", (_e) => {
    var data = _e.data
    if (!data) return;

    if (data.action == 'openSerialWindow' && !isOnWindow) {
        isOnWindow = true
        document.getElementById('serial-code').value = ''
        document.getElementById('capital-label').innerHTML = data.serverName
        document.getElementById('capital-img').src = data.logoName
        document.body.style.display = 'block';
    } else if (data.action == 'activePack') {
        animateItems(data.packData)
    }else if (data.action == 'notifyText'){
        notify(data.text, data.time)
    }

})