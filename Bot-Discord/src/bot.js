// Class
class AFUIntel {

    #token = ''
    #isSuccess = false
    assertToken(token) {
        this.#token = token
    }

    requestBotAccess() {
        // post server { token: this.#token }
        // callback value
        this.#isSuccess = true
    }

    getAcceesStatus() {
        return this.#isSuccess
    }

}

// AFU Intel
const config = require('../config.json')
const packsSelectList = []
const packInfomationList = []
const _afuIntel = new AFUIntel(config.afu_token)
_afuIntel.requestBotAccess()

const { Client, Intents, MessageActionRow, MessageEmbed, MessageSelectMenu, MessageButton } = require('discord.js')
const mysql = require('mysql');

// Bot Init
const bot = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
})

// Functions
dbg = (/* */) => {
    if(!config.devMode)return;
    console.log(`\n\n[ debug_write ]\n   `, ...arguments);
}
calculatePrice = (values) => {
    var total = 0
    for(let i = 0; i < values.length; i++){
        const pack = config.package[values[i]]
        total += pack.price
    }
    return total
}
initIdentityInteraction = (userId, values) => {
    var strIden = `conf-${userId}-`
    for(let i = 0; i < values.length; i++){
        strIden += i == values.length-1 ? `${values[i]}` : `${values[i]},`
    }
    return strIden
}
initPacksSelectMenu = () => {
    for(let i = 0; i < config.package.length; i++){
        const pack = config.package[i]
        const data = {
            label: pack.label,
            description: ``,
            value: i.toString()
        }
        packsSelectList.push(data)
    }
}
initPacksInformation = () => {
    for(let i = 0; i < config.package.length; i++){
        const pack = config.package[i]
        const data = {
            name: `${pack.label} @ ${pack.price} บาท`,
            value: `- ${pack.description}`,
        }
        packInfomationList.push(data)
    }
}
isFocusCategory = (cateId) => {
    return cateId == config.categoryIdFocus
}
isUserIdAllowToAccept = (userId) => {
    return config.allowAcceptUserId.find(allowUserId => allowUserId == userId)
}
deleteAllExceptMe = (channel) => {
    channel.parent.children.each((ch) => {
        if (ch.id != channel.id) {
            ch.delete()
        }
    })
}
sendPackInteraction = (channel) => {
    const packSelectMenu = new MessageActionRow()
    .addComponents(
        new MessageSelectMenu()
            .setCustomId(`packs-select`)
            .setPlaceholder(`เลือกซื้อ`)
            .addOptions(packsSelectList)
            .setMinValues(1)
            .setMaxValues(packsSelectList.length)
    )
    
    channel.send({ 
        embeds: [
            {
                color: "32a854",
                thumbnail: {
                    url: config.logo_server
                },
                fields: packInfomationList 
            }
        ], 
        components: [packSelectMenu]
    }).then(()=>{
        dbg(`${channel.id}:${channel.name} Staring buy product ...`)
    }).catch(console.log)
}

// Bot event listener
bot.on('interactionCreate', (interaction) => {
    
    // packs-select
    if(interaction.customId == 'packs-select'){
        var userId = interaction.user.id
        var userPackValues = interaction.values
        
        var userIdentityInteraction = initIdentityInteraction(userId, userPackValues)
        console.log(userIdentityInteraction.split('-'))
        
        // const infomationBuy = initInformationBuy(userPackValues)
        const w8transAndConfirm = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(userIdentityInteraction)
                .setEmoji('908985605701111818')
                .setLabel('กรุณารอ..')
                .setStyle('SECONDARY')
        )
            
        interaction.message.delete()
        interaction.channel.send({
            // embeds:[infomationBuy],
            components: [w8transAndConfirm]
        })
        
        return
    }

})

bot.on('channelCreate', (channel) => {
    if (!isFocusCategory(channel.parentId)) return;
    if (config.devMode) {
        deleteAllExceptMe(channel)
    }

    // Send select pack to user
    setTimeout(()=>{
        sendPackInteraction(channel)
    }, 1000)
})

bot.on('ready', () => {
    console.log('AFU Bot Donate Online :D')
})

initPacksInformation()
initPacksSelectMenu()
bot.login(config.bot_token)