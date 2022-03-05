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
    packSelectMenu: null,
    msgSelectMenu: null,
    packsSelectList : [],
    packInfomationList : [],
    buyerList : {},
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
    initSerialSendInformation : function(packBuyer) {
        var embeds = []
        packBuyer.packs.forEach(prod=>{
            const pack = config.package[prod.configIndex]
            embeds.push({
                image: {
                    url: pack.imageUrl
                },
                fields: {
                    name: `${pack.label} @ ${pack.price} บาท`,
                    value: `\`\`\`${pack.description}\`\`\`\n**จำนวน : ${prod.total}**`
                }
            })
        })

        embeds.push({
            "description": `**Serial Code (  โค้ด )**\n||**\`${packBuyer.serial_code}\`**||\n\nขอบคุณ <@${packBuyer.id}> ที่สนับสนุน **${config.server_name}**`,
            "color": 16735883
        })
    
        return embeds
    
    },
    initInformationBuy : async function(userId, values, interaction) {

        this.buyerList[userId] = {
            channelId: interaction.channel.id,
            selectedItems: []
        }
        var msgs = []
        var totalPrice = 0
        for(let i = 0; i < values.length; i++){
            const pack = config.package[values[i]]

            this.buyerList[userId].selectedItems.push({
                index: i,
                configIndex: values[i],
                total: 1
            })

            const increaseAndDecreaseProduct = new MessageActionRow()
			.addComponents(
				new MessageButton()
					.setCustomId(`increase-${userId}-${i}`)
                    .setEmoji('➕')
					.setStyle('SUCCESS')
			)
            .addComponents(
				new MessageButton()
					.setCustomId(`decrease-${userId}-${i}`)
                    .setEmoji('➖')
					.setStyle('DANGER')
			);


            const msgProduct = {
                username: `${config.server_name} Donation`,
                embeds: [
                    {
                        "color": 9328895,
                        "fields": [
                            {
                                "name": `${pack.label}`,
                                "value": `\`\`\`${pack.description}\`\`\``
                            },
                            {
                                "name": "รายละเอียดสินค้า",
                                "value": `จำนวน: **\`${1}\`** ราคารวม: **\`${pack.price}\`** บาท`
                            }
                        ],
                        "image": {
                            "url": pack.imageUrl
                        }
                    }
                ],
                components: [increaseAndDecreaseProduct]
            }
            totalPrice+= pack.price
            msgs.push(msgProduct)
        }
       
        for(let i = 0; i < msgs.length; i++){
            interaction.channel.send(msgs[i]) 
        }

        interaction.channel.send({
            username: `${config.server_name} Donation`,
            embeds: [
                {
                    "title": `**ราคารวมทั้งสิ้น: ${totalPrice} บาท**`,
                    "color": 7470522,
                    "description": `**Discord:** <@${userId}>\n**หากเลือกสินค้าและจำนวนเรียบร้อยแล้วกดปุ่มด้านล่าง**`,
                }
            ],
            components: [
                new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`sendBill-${userId}`)
                        .setEmoji(config.server_emoji)
                        .setLabel('ยืนยันการเลือกสินค้า')
                        .setStyle('SUCCESS')
                )
            ]
        })

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

        this.packSelectMenu = new MessageActionRow()
        .addComponents(
            new MessageSelectMenu()
                .setCustomId(`packs-select`)
                .setPlaceholder(`เลือกซื้อ`)
                .addOptions(this.packsSelectList)
                .setMinValues(1)
                .setMaxValues(this.packsSelectList.length)
        )

        this.msgSelectMenu = { 
            embeds: [],
            components: [this.packSelectMenu]
        }

        for(let i = 0; i < config.package.length; i++){
            const pack = config.package[i]
            this.msgSelectMenu.embeds.push({
                "fields": [
                    {
                        name: `${pack.label} @ ${pack.price} บาท`,
                        value: `\`\`\`${pack.description}\`\`\``
                    }
                ],
                "image": {
                    "url": pack.imageUrl
                }
            })
        }

        this.msgSelectMenu.embeds.push({
            "color": '98e363',
            "fields": [
                {
                    name: `เลือกซื้อสินค้าใน ${config.server_name}`,
                    value: `หลังจากซื้อสินค้าจะได้รับ Serial Code นำไปกรอกในประเทศได้`
                }
            ],
            "footer": {
                "text": "@ Develop by Hex and Document by Dio"
            }
        })
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
                ch.delete().then().catch()
            }
        })
    },
    sendPackInteraction : function(channel){
        channel.send(this.msgSelectMenu).then(()=>{
            this.dbg(`${channel.id}:${channel.name} Staring buy product ...`)
        }).catch(console.log)
    },
    increaseProduct : function(data){
        // data = [ 'userId', 'indexP']
        var buyerData = this.buyerList[data[0]]
        if( buyerData == undefined || buyerData == null)return false;
        
        var returnPack = false

        this.buyerList[data[0]].selectedItems.forEach(product =>{
            if(product.index == data[1]){
                product.total++
                returnPack = product
                return
            }
        })

        return returnPack
    },
    decreaseProduct : function(data){
        // data = [ 'userId', 'indexP']
        var buyerData = this.buyerList[data[0]]
        if( buyerData == undefined || buyerData == null)return false;
        
        var returnPack = false


        this.buyerList[data[0]].selectedItems.forEach(product =>{
            if(product.index == data[1]){
                product.total = product.total - 1 < 1 ? 1 : product.total - 1;
                returnPack = product
                return
            }
        })

        return returnPack
    },
    refreshInteractionManage : function(interaction, packUpdated, dataIncrease, cb){
        if(packUpdated){
            const pack = config.package[packUpdated.configIndex]
            interaction.message.edit({
                embeds: [
                    {
                        "color": 9328895,
                        "fields": [
                            {
                                "name": `${pack.label}`,
                                "value": `\`\`\`${pack.description}\`\`\``
                            },
                            {
                                "name": "รายละเอียดสินค้า",
                                "value": `จำนวน: **\`${packUpdated.total}\`** ราคารวม: **\`${pack.price * packUpdated.total}\`** บาท`
                            }
                        ],
                        "image": {
                            "url": pack.imageUrl
                        }
                    }
                ]
            })
            cb(dataIncrease[0], hex_brain.buyerList[dataIncrease[0]], interaction)
        }
    },
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
    updateBillInfo : function(userId, dataUpadate, interaction){

        var totalPrice = 0
        console.log(dataUpadate)
        dataUpadate.selectedItems.forEach(data=>{
            const pack = config.package[data.configIndex]
            totalPrice += (pack.price * data.total)
        })

        const newUpdate = {
            username: `${config.server_name} Donation`,
            embeds: [
                {
                    "title": `**ราคารวมทั้งสิ้น: ${totalPrice} บาท**`,
                    "color": 7470522,
                    "description": `**Discord:** <@${userId}>\n**หากเลือกสินค้าและจำนวนเรียบร้อยแล้วกดปุ่มด้านล่าง**`,
                }
            ],
            components: [
                new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(`sendBill-${userId}`)
                            .setEmoji(config.server_emoji)
                            .setLabel('ยืนยันการเลือกสินค้า')
                            .setStyle('SUCCESS')
                )
            ]
        }

        interaction.channel.bulkDelete(1).then(()=>{
            interaction.channel.send(newUpdate)
            interaction.deferUpdate()

        }).catch()

    },
    lastStepInteract : function(interaction, userId){

        var infomationBuy = []
    
        var total = 0
        var userBuyData = this.buyerList[userId]
        userBuyData.selectedItems.forEach(pack=>{
            const prod = config.package[pack.configIndex]
            total += (prod.price*pack.total)
            infomationBuy.push({
                image: {
                    url: prod.imageUrl
                },
                fields: {
                    name: `${prod.label} @ ${prod.price} บาท`,
                    value: `\`\`\`${prod.description}\`\`\`\n**จำนวน : ${pack.total}**`
                }
            })
        })

        infomationBuy.push({
            "title": `**ราคารวมทั้งสิ้น ${total} บาท**`,
            "color": 7470522,
            "fields" : {
                name: `**โอนเงินตามช่องทางด้านล่าง และ รอการยืนยัน**\n`,
                value: `ขอบคุณ <@${userId}> ที่สนับสนุน ${config.server_name}`
            },
            "image": {
              "url": config.transInfoImg
            }
        })
    
        const w8transAndConfirm = new MessageActionRow()
        .addComponents(
            new MessageButton()
                .setCustomId(`conf-${userId}`)
                .setEmoji(config.server_emoji)
                .setLabel('กรุณารอ ..')
                .setStyle('SUCCESS')
        )
        
        interaction.channel.send({
            username: `${config.server_name} Donation`,
            embeds: infomationBuy,
            components: [w8transAndConfirm]
        })

    },
    deleteChannelBuyerList : function(channel){
        for (const key in hex_brain.buyerList) {
            if(channel.id == hex_brain.buyerList[key].channelId){
                channel.delete().then().catch()
            }
        }
    }

}

// Bot event listener
hex_brain.bot.on('interactionCreate', (interaction) => {
    // check access
    if(!hex_brain.isAccess(interaction.channel))return;

    // send bill
    if(interaction.customId.includes('sendBill-')){
        var subId = interaction.customId.substring(9, interaction.customId.length)
        const buyerData = hex_brain.buyerList[subId]
        if(!buyerData || interaction.user.id != subId){
            interaction.deferUpdate()
            return
        }
        interaction.channel.bulkDelete(buyerData.selectedItems.length+1).then(()=>{
            hex_brain.lastStepInteract(interaction, subId)


        }).catch()
    }

    // increase product
    if(interaction.customId.includes('increase-')){
        var subId = interaction.customId.substring(9, interaction.customId.length)
        var dataIncrease =  subId.split('-')// userId i 
        dataIncrease[1] = parseInt(dataIncrease[1]) 
        const packUpdated = hex_brain.increaseProduct(dataIncrease)
        hex_brain.refreshInteractionManage(interaction, packUpdated, dataIncrease, hex_brain.updateBillInfo)
    }

    // decrease product
    if(interaction.customId.includes('decrease-')){
        var subId = interaction.customId.substring(9, interaction.customId.length)
        var dataIncrease =  subId.split('-')// userId i 
        dataIncrease[1] = parseInt(dataIncrease[1]) 
        const packUpdated = hex_brain.decreaseProduct(dataIncrease)
        hex_brain.refreshInteractionManage(interaction, packUpdated, dataIncrease, hex_brain.updateBillInfo)
    }

    // packs-select
    if(interaction.customId == 'packs-select'){
        var userId = interaction.user.id
        
        if(hex_brain.buyerList[userId]){
            interaction.reply(`ยังมีห้องที่เปิดการซื้อขายของ <@${userId}> อยู่นะครับ\n\n**ห้องจะถูกลบใน 5 วินาที**`)
            setTimeout(()=>{
                interaction.channel.delete().then().catch()
            },5000)
            return
        }
        
        var userPackValues = interaction.values

        interaction.channel.bulkDelete(config.package.length+1).then(()=>{
            hex_brain.initInformationBuy(userId, userPackValues, interaction)
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
                interaction.message.delete().then().catch()
            };
        }
        hex_brain._selledCount = hex_brain._selledCount + 1 > 3 ? 0 : hex_brain._selledCount + 1

        var subIden = interaction.customId.substring(5, interaction.customId.length)
        

        const userData = hex_brain.buyerList[subIden]
        
        var packBuyer = {
            id: subIden,
            serial_code: hex_brain.generateSerialCode(interaction.channel),
            packs: userData.selectedItems
        }

        const confInformation = hex_brain.initSerialSendInformation(packBuyer)

        var packQueryData = []
        packBuyer.packs.forEach(pack => {
            const prod = config.package[pack.configIndex]
            for(var i =0; i < pack.total; i++){
                packQueryData.push({
                    label: prod.label,
                    items: prod.items
                })
            }
        })
        
        const pack_data = JSON.stringify(packQueryData)
        hex_brain.bridge.query(`INSERT INTO pack_serial (serial_code, pack_data) VALUES ('${packBuyer.serial_code}', '${pack_data}')`,(err, res, fs)=> {
            if(!res)return;
            delete hex_brain.buyerList[packBuyer.id]
            console.log(`\n\n[ Buy Successfully '${packBuyer.id}' ]\n   Code::> ${packBuyer.serial_code}\n   Res::> ${res}\n   Packs::> ${pack_data}`)
            interaction.message.delete().then().catch()
            interaction.channel.send({
                embeds: confInformation
            })
            
            interaction.channel.setName("✅")
            .catch(console.error);
        })
        
        
        return
    }

})


hex_brain.bot.on('channelDelete', (channel)=>{
    if (!hex_brain.isFocusCategory(channel.parentId)) {
        console.log('not in focus category');
        return
    }
    hex_brain.deleteChannelBuyerList(channel)
})

hex_brain.bot.on('channelCreate', (channel) => {
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
    }, 800)
})


hex_brain.bot.on('ready', () => {
    hex_brain.requestBotAccess()
})

hex_brain.initPacksSelectMenu()
hex_brain.bot.login(config.bot_token)
