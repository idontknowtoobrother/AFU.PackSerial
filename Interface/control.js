// vars
let isOnWindow = false
let isNotify = false

// functions
async function notify(text, time){
    var notiQueue = new Promise((succeed, failed)=>{
        if (isNotify)return;
        isNotify = true
        let elem = document.getElementById('notify-text')
        elem.innerHTML  = text
        elem.style.display = 'block'
        setTimeout(()=>{
            succeed(elem)
        }, time)
    })

    await notiQueue.then((elem)=>{
        elem.style.display = 'none'
        isNotify = false
    })
} 

const animateItems = (pack)=> {
    
    // animation items
    console.log(pack)
    
    // end
    fetch(`https://${GetParentResourceName()}/ActivedSerialCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            serialCode: serial
        })
    })
}

const activeSerial = ()=> {
    var serial = document.getElementById('serial-code').value
    
    if(!serial){
        notify('<span style="color:red">กรุณากรอก Serial Code ?</span>', 4000)
        return 
    }

    fetch(`https://${GetParentResourceName()}/ActiveSerialCode`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8'
        },
        body: JSON.stringify({
            serialCode: serial
        })
    })
}


// setbody hide
document.body.style.display = 'none'
document.getElementById('notify-text').style.display = 'none'

// event listener
document.addEventListener('keydown', function(e) {
    if(e.code != 'Escape' || !isOnWindow)return;
    this.body.style.display = 'none'

    fetch(`https://${GetParentResourceName()}/CloseWindow`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        }
    });

    isOnWindow = false
})

window.addEventListener("message", (_e) => {
    var data = _e.data
    if(!data) return;

    if(data.action == 'openSerialWindow' && !isOnWindow){
        isOnWindow = true
        document.body.style.display = 'block';
    }else if(data.action == 'activePack'){
        animateItems(data.packData)
    }

})