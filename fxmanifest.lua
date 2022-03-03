--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

fx_version 'cerulean'
game 'gta5'

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
    'Interface/*.png',
    'Interface/*.gif',
    'Interface/*.jpg'
}
