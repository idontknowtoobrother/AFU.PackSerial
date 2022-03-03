--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

--@ Config
local Config = {
    openWindowKey = Config.openWindowKey,
    pathItemsImage = Config.pathItemsImage
}

local NotificationCase = {
    'Serial Code not correctly',
    'Serial Code is actived by another player',
}

--@ functions
local function setMouseActive(bool)
    SetNuiFocus(bool, bool)
end
local function createClientEvent(name, handler)
    return RegisterNetEvent(name), AddEventHandler(name, handler)
end



--@ PackSerial
local PackSerial = {
    isReady = false,
    getStatusAndDoFunc = function(self, cb)
        if not self.isReady then
            self.isReady = GlobalState.PSIsReady
        end
    end,
    closeMenu = function(self)
        setMouseActive(false)
        TriggerScreenblurFadeOut(0)
    end,
    openMenu = function(self)
        self:getStatusAndDoFunc()
        if not self.isReady then return end
        setMouseActive(true)
        TriggerScreenblurFadeIn(0)
        SendNUIMessage({
            action = 'openSerialWindow'
        })
    end
}


--@ Event Register
createClientEvent('secure:packNotification', function(caseIndex)
    print(NotificationCase[caseIndex])
end)

createClientEvent('secure:openingPack', function(pack)
    SendNUIMessage({
        action = 'activePack',
        packData = pack
    })
end)

RegisterNUICallback('CloseWindow', function()
    PackSerial:closeMenu()
end)
RegisterNUICallback('ActiveSerialCode', function(data)
    PackSerial:getStatusAndDoFunc()
    if not PackSerial.isReady then return end
    local serialCode = data.serialCode
    TriggerServerEvent('secure:activeSerial', serialCode)
end)
RegisterNUICallback('ActivedSerialCode', function()
    TriggerServerEvent('secure:addItemsFromPack')
end)

RegisterCommand('openPSWindow', function()
    PackSerial:openMenu()
end)
RegisterKeyMapping('openPSWindow', 'Pack Serial Window', 'keyboard', string.lower(Config.openWindowKey))