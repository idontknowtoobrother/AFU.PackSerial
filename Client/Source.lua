--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

local NotificationCase = {
    {'Serial Code <span style="color:red">ไม่ถูกต้อง</span>', 3000},
    {'Serial Code <span style="color:red">ถูกกใช้ไปแล้ว</span>', 3000}
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
            action = 'openSerialWindow',
            serverName = Config.serverName,
            logoName = Config.serverLogoName
        })
    end
}


--@ Event Register
createClientEvent('secure:packNotification', function(caseIndex)
    SendNUIMessage({
        action = 'notifyText',
        text = NotificationCase[caseIndex][1],
        time = NotificationCase[caseIndex][2]
    })
end)

createClientEvent('secure:openingPack', function(pack)
    SendNUIMessage({
        action = 'activePack',
        packData = pack,
        pathImg = Config.pathItemsImage
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

AddEventHandler('onResourceStop', function(resName)
    if resName ~= GetCurrentResourceName() then return end
    TriggerScreenblurFadeOut(0)
end)