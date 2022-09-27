--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

fx_version 'cerulean'
game 'gta5'

author 'Hex ( keng#0110 )'
description 'Ez Serial Code Topup with discord bot'
version '1.1 update bot error "Unknow Channel"'

lua54 'yes'

client_scripts {
    'Settings.lua',
    'Client/Source.lua'
}

server_scripts {
    '@mysql-async/lib/MySQL.lua',
    'Secure.lua',
    'Server/Source.lua'
}

ui_page 'Interface/ui.html'

files {
    'Interface/control.js',
    'Interface/style.css',
    'Interface/ui.html',
    'Interface/*.wav',
    'Interface/*.mp3',
    'Interface/*.png',
    'Interface/*.gif',
    'Interface/*.jpg'
}
