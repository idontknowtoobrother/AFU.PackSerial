// setbody hide
const audio = new Audio('effect.mp3');
let isOnActivatingPack = false
audio.volume = 1

document.body.style.display = 'none'
document.getElementById('notify-text').style.display = 'none'
document.getElementsByClassName('window')[0].style.display = 'none'
document.getElementsByClassName('pack-unpack')[0].style.display = 'none'

function addItem(itemName, itemCount, pathImg){
    return new Promise((succ, rej)=>{
        setTimeout(()=>{
            audio.currentTime = 0.07
            audio.play()
            document.getElementsByClassName('unpack-items')[0].insertAdjacentHTML("beforeend", `<div class="pack-items"> <img width="86px" src="${pathImg}${itemName}.png" alt=""> <span id="items-label">x ${itemCount}</span> </div>`)
            succ()
        }, 40)
    })
}

async function animateItems(packs, pathImg){
    isOnActivatingPack = true
    var items = []
    for(let i = 0; i < packs.length; i++){
        packs[i].items.forEach(item => {
            items.push(item)
        })
    }

    document.getElementById('notify-text').style.display = 'none'
    document.getElementsByClassName('window')[0].style.display = 'none'

    // start 
    document.getElementsByClassName('pack-unpack')[0].style.display = 'block'
    for(let k = 0; k < items.length; k++){
        var item = items[k]
        const adding = await addItem(item.name, item.total, pathImg)
    }

    // end
    setTimeout(()=>{
        document.getElementsByClassName('pack-unpack')[0].style.display = 'none'
        document.getElementsByClassName('unpack-items')[0].innerHTML = ''
        isOnActivatingPack = false
        closeWindow()
        fetch(`https://AFU.PackSerial/ActivedSerialCode`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }).then().catch()
    }, 4000)

}


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
        if (e.code != 'Escape' || !isOnWindow || isOnActivatingPack) return;
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
        document.getElementById('notify-text').style.display = 'block'
        document.getElementsByClassName('window')[0].style.display = 'block'
    } else if (data.action == 'activePack') {
        animateItems(data.packData, data.pathImg)
    }else if (data.action == 'notifyText'){
        notify(data.text, data.time)
    }

})