--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

fx_version 'celerean'
game 'gta5'

client_script {
    'Secure.lua',
    'Client.lua'
}

server_script {
    '@mysql-async/lib/MySQL.lua',
    'Server.lua'
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
