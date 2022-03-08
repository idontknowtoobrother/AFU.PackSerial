// 💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
// 🐌 @Copyright AFU
// ☕ Thanks For Coffee Tips 

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
    isAccess: function(channel){
        return this.isSuccess
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
                this.isSuccess = true
                console.log(`${this.tag}\n${this.tagStatus} Access Bot \x1b[32m:D\x1b[0m\n${this.userDiscordId} ${this.status.name}\n${this.tagIp} ${this.status.a}\n${this.tagDay} \x1b[32m${this.status.dayLeft}\x1b[0m`)
                console.log('\n\x1b[42m\x1b[37m Bot Status \x1b[0m Bot Donate Online \x1b[32m:D\x1b[0m')
            }
        }).catch(console.log)

    }

}

// Bot event listener
hex_brain.bot.on('interactionCreate', (interaction) => {
    // check access
    if(!hex_brain.isAccess(interaction.channel))return;

})

hex_brain.bot.on('channelCreate', (channel) => {
    // check access
    if(!hex_brain.isAccess(channel))return;
  
    if (config.devMode) {
        hex_brain.deleteAllExceptMe(channel)
    }
 
})

hex_brain.bot.on('ready', () => {
    hex_brain.requestBotAccess()
})

hex_brain.bot.login(config.bot_token)