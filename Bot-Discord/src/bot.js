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
generateSerialCode = () => {
    let token = `${config.serialCodeTag}-`;
    let length = 28-token.length
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-';
    for (let i = 0; i < length; i += 1) {
        token += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return token;
}
getPacks = (values) => {
    var packs = []
    for(let i = 0; i < values.length; i++){
        const pack = config.package[parseInt(values[i])]
        packs.push(pack)
    }
    return packs
}
initInformationBuy = (userId, values) => {
    var embeds = [
        {
            title: `Bill @ รายการซื้อ`,
            color: "32a854",
            image: {
                url: config.logo_server
            },
            fields: [
                {
                    name: `รายละเอียด`,
                    value: `<@${userId}> \nโอนเงินตามช่องทางในภาพและรอการยืนยันฮะ\n`
                }
            ] 
        }
    ]
    
    var total = 0
    for(let i = 0; i < values.length; i++){
        const pack = config.package[values[i]]
        total += pack.price
        embeds[0].fields.push({
            name: `${pack.label} @ ${pack.price}`,
            value: `- ${pack.description}`
        })
    }
    embeds[0].fields.push({
        name: `**ราคารวมทั้งสิ้น**`,
        value: `**\` ${total} บาท \`**`
    })
    console.log(embeds)
    return embeds
    
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
                title: config.server_name,
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
        
        const infomationBuy = initInformationBuy(userId, userPackValues)
        const w8transAndConfirm = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(userIdentityInteraction)
                .setEmoji(config.server_emoji)
                .setLabel('กรุณารอ..')
                .setStyle('SUCCESS')
        )
            
        interaction.message.delete()
        interaction.channel.send({
            embeds: infomationBuy,
            components: [w8transAndConfirm]
        })
        return
    }

    // conf-
    if(interaction.customId.includes('conf-')){
        
        if(!isUserIdAllowToAccept(interaction.user.id)){
            interaction.reply("**กรุณารอยืนยันสักครู่ฮะ**")
                .then(() => {
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 3000)
                })
                .catch(console.error)
            return
        }

        var subIden = interaction.customId.substring(5, interaction.customId.length)    
        var packDetail = subIden.split('-')
        var packBuyer = {
            serial_code: generateSerialCode(),
            packs: getPacks(packDetail[1].split(','))
        }
        
        console.log(packBuyer)
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