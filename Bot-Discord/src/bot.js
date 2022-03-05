// Module include
const { Client, Intents, MessageActionRow, MessageSelectMenu, MessageButton } = require('discord.js')
const config = require('../config.json')
const mysql = require('mysql')
const axios = require('axios')

// hex Brain
const hex_brain = {
    token : config.afu_token,
    tag : '\x1b[42m \x1b[37mHex \x1b[0m \x1b[43m \x1b[35mInformation \x1b[0m',
    tagIp : '\x1b[35mAddress:\x1b[0m',
    userDiscordId : '\x1b[35mUser:\x1b[0m',
    tagStatus : '\x1b[35mStaus:\x1b[0m',
    tagDay : '\x1b[31mDays:\x1b[0m',
    isSuccess : false,
    status : null,
    packsSelectList : [],
    packInfomationList : [],
    _selledCount : 0,
    bridge : mysql.createPool(config.server_database),
    // Bot Init
    bot : new Client({
        intents: [
            Intents.FLAGS.GUILDS,
            Intents.FLAGS.GUILD_MESSAGES,
            Intents.FLAGS.GUILD_MEMBERS,
            Intents.FLAGS.GUILD_MESSAGE_REACTIONS
        ]
    }),
    requestBotAccess: function() {

        axios.post('http://xexx.brain.gtav-sync.com/X.Secure/', { 
            key: this.token, 
            resName: 'AFU.PackSerial', 
            action: 'active' 
        }).then(res=>{
            this.status = res.data
            if(!this.status)return;
            this.status.dayLeft = parseInt(this.status.dayLeft)
            if(this.status.state === 'actived' && (this.status.dayLeft > 0 || this.status.dayLeft == -1)){
                this.isSuccess = 'access'
                console.log(`${this.tag}\n${this.tagStatus} Access Bot \x1b[32m:D\x1b[0m\n${this.userDiscordId} ${this.status.name}\n${this.tagIp} ${this.status.a}\n${this.tagDay} \x1b[32m${this.status.dayLeft}\x1b[0m`)
                console.log('\n\x1b[42m\x1b[37m Bot Status \x1b[0m Bot Donate Online \x1b[32m:D\x1b[0m')
            }else if(this.status.state === 'actived' && this.status.dayLeft < 1){
                this.isSuccess = 'expired'
                console.log(`${this.tag} Expired \x1b[31m:(\x1b[0m`)
            }else if(this.status.state === 'activing'){
                this.isSuccess = 'anotherAddress'
                console.log(`${this.tag} IP Address Invalid \x1b[31m:(\x1b[0m`)
            }else if(this.status.state === 'notfound'){
                this.isSuccess = 'accessDenined'
                console.log(`${this.tag} Access Denined \x1b[31m:(\x1b[0m`)
            }
        }).catch(console.log)

    },
    getAcceesStatus: function() {
        return this.isSuccess
    },
    isAccess: function(channel){

        // invalid token
        if(this.isSuccess === 'accessDenined'){
            channel.send({
                embeds: [
                    {
                      "title": "Reason Information",
                      "description": "ไม่มีสิทธิ์ใช้งาน\n( Access Denined )\n\n**Developer Squad**\nhex: <@908940299982761984>\nhexa: <@682988574211178525>\ndio: <@291122206782521345>",
                      "color": 16726843,
                      "footer": {
                        "text": "Error Code @ 406",
                        "icon_url": "https://i.imgur.com/0wiP9H0.gif"
                      },
                      "image": {
                        "url": "https://i.imgur.com/4iYQHAF.gif"
                      },
                      "thumbnail": {
                        "url": "https://media3.giphy.com/media/3og0ItKLUOUzt5uwZW/giphy.gif?cid=ecf05e47qinzgy29knu412g9mdr5vk425b172p7hhr70be6j&rid=giphy.gif&ct=s"
                      }
                    }
                ]
            })
            return false
        }

        // expired
        if(this.isSuccess === 'expired'){
            channel.send({
                embeds: [
                    {
                      "title": "Reason Information",
                      "description": "โทเคนของท่านหมดอายุ \n( Token Expired )\n\n**Developer Squad**\nhex: <@908940299982761984>\nhexa: <@682988574211178525>\ndio: <@291122206782521345>",
                      "color": 16726843,
                      "footer": {
                        "text": "Error Code @ 405",
                        "icon_url": "https://i.imgur.com/0wiP9H0.gif"
                      },
                      "image": {
                        "url": "https://i.imgur.com/4iYQHAF.gif"
                      },
                      "thumbnail": {
                        "url": "https://media3.giphy.com/media/3og0ItKLUOUzt5uwZW/giphy.gif?cid=ecf05e47qinzgy29knu412g9mdr5vk425b172p7hhr70be6j&rid=giphy.gif&ct=s"
                      }
                    }
                ]
            })
            return false
        }

        // another address
        if(this.isSuccess === 'anotherAddress'){
            channel.send({
                embeds: [
                    {
                      "title": "Reason Information",
                      "description": "ไอพีไม่ถูกต้อง\n( Address Invalid )\n\n**Developer Squad**\nhex: <@908940299982761984>\nhexa: <@682988574211178525>\ndio: <@291122206782521345>",
                      "color": 16726843,
                      "footer": {
                        "text": "Error Code @ 406",
                        "icon_url": "https://i.imgur.com/0wiP9H0.gif"
                      },
                      "image": {
                        "url": "https://i.imgur.com/4iYQHAF.gif"
                      },
                      "thumbnail": {
                        "url": "https://media3.giphy.com/media/3og0ItKLUOUzt5uwZW/giphy.gif?cid=ecf05e47qinzgy29knu412g9mdr5vk425b172p7hhr70be6j&rid=giphy.gif&ct=s"
                      }
                    }
                ]
            })
            return false
        }

        return true
    },
    dbg: (/* */) => {
        if(!config.devMode)return;
        console.log(`\n\n[ debug_write ]\n   `, ...arguments);
    },
    generateSerialCode : function(channel){
        // check access
        if(!this.isAccess(channel))return;
    
        let token = `${config.serialCodeTag}#`;
        let length = 28-token.length
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        for (let i = 0; i < length; i += 1) {
            token += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return token;
    },
    getPacks : function(values){
        var packs = []
        for(let i = 0; i < values.length; i++){
            const pack = config.package[parseInt(values[i])]
            packs.push(pack)
        }
        return packs
    },
    initSerialSendInformation : function(packBuyer) {
        var embeds = [
            {
                "description": "**รายละเอียดของที่จะได้รับเมื่อเติมโค้ด**",
                "color": 9328895,
                "fields": []
            },
            {
                "description": `**Serial Code (  โค้ด )**\n||**\`${packBuyer.serial_code}\`**||\n\nขอบคุณ <@${packBuyer.id}> ที่สนับสนุน **${config.server_name}**`,
                "color": 16735883
            }
        ]
    
        for(let i = 0; i < packBuyer.packs.length; i++){
            const pack = packBuyer.packs[i]
            embeds[0].fields.push({
                name: `${pack.label} @ ${pack.price} บาท`,
                value: `\`\`\`${pack.description}\`\`\``
            })
        }
    
        return embeds
    
    },
    initInformationBuy : function(userId, values) {
        var embeds = [ 
            {
                "description": `**รายละเอียดการซื้อของใน ${config.server_name}**\n\`Discord:\` <@${userId}>`,
                "color": 9328895,
                "fields": []
            },
            {
                "title": "**โอนเงินตามช่องทางด้านล่าง และ รอการยืนยัน**",
                "color": 7470522,
                "image": {
                  "url": config.transInfoImg
                }
            }
        ]
    
        var total = 0
        for(let i = 0; i < values.length; i++){
            const pack = config.package[values[i]]
            total += pack.price
            embeds[0].fields.push({
                name: `${pack.label} @ ${pack.price}`,
                value: `\`\`\`${pack.description}\`\`\``
            })
        }
        embeds[0].fields.push({
            name: `**ราคารวมทั้งสิ้น ${total} บาท**`,
            value: `ขอบคุณที่สนับสนุน ${config.server_name}`
        })
    
        return embeds
        
    },
    initIdentityInteraction : function(userId, values) {
        var strIden = `conf-${userId}-`
        for(let i = 0; i < values.length; i++){
            strIden += i == values.length-1 ? `${values[i]}` : `${values[i]},`
        }
        return strIden
    },
    initPacksSelectMenu : function(){
        for(let i = 0; i < config.package.length; i++){
            const pack = config.package[i]
            const data = {
                label: pack.label,
                description: ``,
                value: i.toString()
            }
            this.packsSelectList.push(data)
        }
    },
    initPacksInformation : function(){
        for(let i = 0; i < config.package.length; i++){
            const pack = config.package[i]
            const data = {
                name: `${pack.label} @ ${pack.price} บาท`,
            value: `\`\`\`${pack.description}\`\`\``,
            }
            this.packInfomationList.push(data)
        }
    },
    isFocusCategory : function(cateId){
        return cateId == config.categoryIdFocus
    },
    isUserIdAllowToAccept : function(userId){
        return config.allowAcceptUserId.find(allowUserId => allowUserId == userId)
    },
    deleteAllExceptMe : function(channel){
        channel.parent.children.each((ch) => {
            if (ch.id != channel.id) {
                ch.delete()
            }
        })
    },
    sendPackInteraction : function(channel){
        const packSelectMenu = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(`packs-select`)
                .setPlaceholder(`เลือกซื้อ`)
                .addOptions(this.packsSelectList)
                .setMinValues(1)
                .setMaxValues(this.packsSelectList.length)
        )
        
        channel.send({ 
    
            username: `${config.server_name} Donation`,
            embeds: [
                {
                    "color": 9328895,
                    "fields": this.packInfomationList,
                    "image": {
                        "url": config.logo_server
                    },
                    "footer": {
                        "text": "Borned @ AFU Developer Squad"
                    }
                }
            ],
            components: [packSelectMenu]
        }).then(()=>{
            this.dbg(`${channel.id}:${channel.name} Staring buy product ...`)
        }).catch(console.log)
    }

}

// Bot event listener
hex_brain.bot.on('interactionCreate', (interaction) => {
    // check access
    if(!hex_brain.isAccess(interaction.channel))return;

    // packs-select
    if(interaction.customId == 'packs-select'){
        var userId = interaction.user.id
        var userPackValues = interaction.values
        var userIdentityInteraction = hex_brain.initIdentityInteraction(userId, userPackValues)
        console.log(userIdentityInteraction.split('-'))
        
        const infomationBuy = hex_brain.initInformationBuy(userId, userPackValues)
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
            username: `${config.server_name} Donation`,
            embeds: infomationBuy,
            components: [w8transAndConfirm]
        })
        return
    }


    
    // conf-
    if(interaction.customId.includes('conf-')){
        
        if(!hex_brain.isUserIdAllowToAccept(interaction.user.id)){
            interaction.reply("**กรุณารอยืนยันสักครู่ฮะ**")
                .then(() => {
                    setTimeout(() => {
                        interaction.deleteReply()
                    }, 3000)
                })
            return
        }

        if (hex_brain._selledCount>2){
            hex_brain.requestBotAccess()
            if(!hex_brain.isAccess(interaction.channel)){
                interaction.message.delete()
            };
        }
        hex_brain._selledCount = hex_brain._selledCount + 1 > 3 ? 0 : hex_brain._selledCount + 1

        var subIden = interaction.customId.substring(5, interaction.customId.length)    
        var packDetail = subIden.split('-')
        var packBuyer = {
            id: packDetail[0],
            serial_code: hex_brain.generateSerialCode(interaction.channel),
            packs: hex_brain.getPacks(packDetail[1].split(','))
        }

        const confInformation = hex_brain.initSerialSendInformation(packBuyer)

        var packQueryData = []
        packBuyer.packs.forEach(pack => {
            packQueryData.push({
                label: pack.label,
                items: pack.items
            })
        })
        
        const pack_data = JSON.stringify(packQueryData)

        hex_brain.bridge.query(`INSERT INTO pack_serial (serial_code, pack_data) VALUES ('${packBuyer.serial_code}', '${pack_data}')`,(err, res, fs)=> {
            if(!res)return;
            console.log(`\n\n[ Buy Successfully '${packBuyer.id}' ]\n   Code::> ${packBuyer.serial_code}\n   Res::> ${res}\n   Packs::> ${pack_data}`)
            interaction.message.delete()
            interaction.channel.send({
                embeds: confInformation
            })
            interaction.channel.setName("✅")
            .catch(console.error);
        })
        
        return
    }

})

hex_brain.bot.on('channelCreate', (channel) => {
    console.log(channel);
    if (!hex_brain.isFocusCategory(channel.parentId)) {
        console.log('not in focus category');
        return
    }
    if (config.devMode) {
        hex_brain.deleteAllExceptMe(channel)
    }

    // check access
    if(!hex_brain.isAccess(channel))return;
    
    // Send select pack to user
    setTimeout(()=>{
        hex_brain.sendPackInteraction(channel)
    }, 500)
})


hex_brain.bot.on('ready', () => {
    hex_brain.requestBotAccess()
})

hex_brain.initPacksInformation()
hex_brain.initPacksSelectMenu()
hex_brain.bot.login(config.bot_token)
