--[[

    💬 Export from AFU brain => discord: keng#0110 / https://discord.gg/awayfromus  
    🐌 @Copyright AFU
    ☕ Thanks For Coffee Tips 

--]]

-- @ Global Vars
GlobalState.PSIsReady = false

-- @ Functions
local function createServerEvent(name, handler)
    return RegisterServerEvent(name), AddEventHandler(name, handler)
end

-- @ OOP.PackSerial
local PackSerial = {
    getPlayer = nil,
    print = print,
    isReady = false,
    packQueue = {},
    addItemsFromPack = function(self, source)
        -- กัน error source หาย
        local source = source
        local strSource = tostring(source)
        -- ไม่เจอ pack
        if not self.packQueue[strSource] then return end
        local packItems = self.packQueue[strSource]
        self.packQueue[strSource] = nil -- ลบออกกันปั้ม
        -- ดึง esx ผู้เล่น
        local player = self.getPlayer(source)
        if not player then return end

        -- เพิ่มไอเทมจาก pack
        for _, item in ipairs(packItems) do
            if item.name == 'back_money' or item.name == 'bank' then
                player.addAccountMoney(item.name, item.total)
            elseif item.name == 'money'or item.name == 'cash' then
                player.addMoney(item.total)
            else
                player.addInventoryItem(item.name, item.total)
            end
        end
    end,
    packOpen = function(self, source, pack)
        if not self.isReady then return end
        if not pack.items then return end

        -- แสดง animation เปิด pack ให้ source
        TriggerClientEvent('secure:openingPack', source, pack)

        -- เพิ่มเข้าคิว
        packQueue[tostring(source)] = pack.items
        
    end,
    activeSerial = function(self, source, serialCode)
        local source = source
        if not self.isReady then return end

        MySQL.Async.fetchScalar('SELECT pack_data FROM pack_serial WHERE serial_code = @serial_code',{
            ['@serial_code'] = serialCode
        }, function(data)
            local pack = data -- ข้อมูล pack
            if not pack then
                -- serial code ไม่ถูกต้อง @ 1
                TriggerClientEvent('secure:packNotification', source, 1)
                return
            end

            MySQL.Async.execute('DELETE FROM pack_serial WHERE serial_code = @serial_code', {
                ['@serial_code'] = serialCode
            },function(rC)
                if rC then
                    -- serial code ถูกใช้ไปแล้ว @ 2
                    TriggerClientEvent('secure:packNotification', source, 2)
                    return
                end

                self:packOpen(source, pack)
            end)
        end)
    end
}


createServerEvent('secure:activeSerial', function(serialCode)
    local source = source
    PackSerial:activeSerial(source, serialCode)
end)

createServerEvent('secure:addItemsFromPack', function()
    local source = source
    PackSerial:addItemsFromPack(source)
end)



--[ @ !Important Private    ( Secure-Token-XEXX-AFU ) **************************************************************************************************************************************************************
local Secure = {
    callAPI = PerformHttpRequest,
    securePrint = print,
    Wait = Wait,
    attmpReq = 0,
    isBreakInstant = false,
    GetCurrentResourceName = GetCurrentResourceName,
    myDebugInfo = debug.getinfo,
    print = function(self, ...)
        return self.securePrint("^0[ ^3+^4Secure Buffer^0 ] ^7",... ,"^7")
    end,
    PerformHttpRequest = function(self, url, cb, method, data, headers, options)
        self.callAPI(url, cb, method, data, headers, options) 
    end,
    destroyMe = function(self, info)
        if info then
            self:print("^1- Destroyme: ^0"..info)
            PackSerial = nil
        end
        self = nil 
    end,
    connectedSecure = function(self, userName, endPoint, infoStatus, dayLeft)
        if not self.loadStatus then return self:destroyMe('Can\'t connect Secure server...') end 
    
        --[ @ Start Code Here  
        -- @ Get framwork
        TriggerEvent(SecureAccess.FrameworkEventName, function(libs)
            PackSerial.getPlayer = libs.GetPlayerFromId
            PackSerial.isReady = true
            GlobalState.PSIsReady = true

            self.securePrint(('\n^0CustomerID^3.^2%s  ^3(^4 %s ^3)^7'):format(userName, endPoint))
            self.securePrint(('^0Information ^3(^4 %s ^3)^7'):format(infoStatus))
            if dayLeft ~= -1 then
                self.securePrint(('^0[ ^4Monthly Version ^3/ ^0Day Left %s%s ^0]'):format((dayLeft > 3 and '^5' or '^1'),dayLeft))
            else
                self.securePrint('^0[ ^4Life Time Version ^2Thank for support us ^3/ ^0hex ^0]')
            end

            if not SecureAccess.DebugTestSerialCode then return end
            MySQL.Async.execute('INSERT INTO pack_serial (serial_code, pack_data) VALUES (@serial_code, @pack_data)', {
                ['@serial_code'] = 'SerialCodeTest',
                ['@pack_data'] = json.encode({
                    label = "Package # 1",
                    description = "แพ็คเริ่มต้น",
                    price = 200,
                    items =  {
                        {
                            label = "ขนมปัง",
                            name = "bread",
                            total = 150
                        },
                        {
                            label = "เงินสด",
                            name = "money",
                            total = 200
                        },
                        {
                            label = "เงินสกปรก",
                            name = "black_money",
                            total = 300
                        },
                        {
                            label = "เงินสด",
                            name = "cash",
                            total = 500
                        },
                        {
                            label = "เงินธนาคาร",
                            name = "bank",
                            total = 500
                        }
                    }
                })
            }, function(rC)
                if not rC then return end
                self.securePrint('^0[ ^3PackSerial Debug Test Mode ^0]\n   ^2Testing PackSerial...^0')
            end)
        end)
    end,
    replyBuffer = function(self, infoStatus, dayLeft)
        infoStatus = (self.loadStatus == false) and ('^1'..infoStatus) or ('^2'..infoStatus)
        self:connectedSecure(self.userName, self.endPoint, infoStatus, dayLeft)
    end,
    loadSecureBridge = function(self, cbNum, cbData)

        if not cbNum or not cbData or not cbData.dayLeft then

            if self.attmpReq > 4 then
                return self:destroyMe('Can\'t connect Secure server...')
            end
            self.attmpReq = self.attmpReq + 1
            Wait(1000)
            self:requestToken()
            return 
        end
    
        local dayLeft = tonumber(cbData.dayLeft)
        if dayLeft < 1 and dayLeft ~= -1 then
            self:Destroyme('^4[ ^1PackSerial ^4]\n   ^1Expired :( ^0Please contact ^3AFU^0 to ^2renew^0')
            return
        end
    
        if self.isBreakInstant then return end
    
        self.loadStatus = false
        local infoStatus
        
        if not cbData or not cbNum or ( cbNum > 499 and cbNum < 600 ) then
            infoStatus = 'Token Server'
        end
    
        if ( cbNum > 399 and cbNum < 500 ) then 
            infoStatus = 'Your Network'
        end
    
        if not ( cbNum > 199 and cbNum < 299 ) then 
            infoStatus = 'Connection Timeout'
        end
    
        self.endPoint = cbData.a or '404'
        self.userName = cbData.name or '404'
        self.devName = cbData.dev or '404'
        self.resourceName = cbData.resname or '404'
        self.loadStatus = ( cbData.state == 'actived' and self.GetCurrentResourceName() == self.resourceName ) and true or self.loadStatus
    
        infoStatus = ( self.loadStatus == true ) and 'Secured 200' or ( ( cbData.state == 'notfound' ) and 'Token 404' or ( ( cbData.state == 'activing' ) and 'Endpoint 404' or 'Unknow 404') )
        infoStatus = ( self.resourceName ~= self.GetCurrentResourceName() ) and 'ResourceName 404' or infoStatus
    
        self:replyBuffer(infoStatus, dayLeft)
    end,
    requestToken = function(self)
        local payLoad = json.encode({ key = SecureAccess.LicenseToken--[[ Token ]], resName = self.GetCurrentResourceName()--[[ Resource Name ]], action = 'active' })
    
        self:PerformHttpRequest("https://xexx.brain.gtav-sync.com/X.Secure/", function(eNum,eData)
            local currentData = self.myDebugInfo(1)
            local callData = self.myDebugInfo(2)
            if currentData.source ~= callData.source and callData.source ~= "@citizen:/scripting/lua/scheduler.lua" or 
            ( currentData.name ~= "userCalllback" and callData.name ~= "handler" ) then 
    
                -- @ [[ Try to cracking my args ... ]]
    
                return self:print("^1Kids try to ^0'Crack' ^3:D^7")
            end
            self:loadSecureBridge(eNum, json.decode(eData))
            
        end, 'POST', payLoad ,{ ['Content-Type'] = 'application/json'})
    
    end
}
print = function(...)
    if Secure.myDebugInfo(1).source ~= Secure.myDebugInfo(2).source or Secure.myDebugInfo(2).name ~= "callAPI" then 
        Secure.isBreakInstant = true 
        -- @ [[ Try to print my args ... ]]
        return Secure:destroyMe("^1Kids try to ^0'print' ^3:D^7")
    end
end
debug.getinfo = function(...)
    if Secure.myDebugInfo then
        return Secure:destroyMe("^1Kids try to ^0'Crack' ^3:D^7")
    end 
end

CreateThread(function()
    while GetResourceState(GetCurrentResourceName()) ~= 'started' do
        Wait(0)
    end
    MySQL.ready(function()
        Secure:requestToken()
    end)
end)
--[ @ !Important Private    ( Secure-Token-XEXX-AFU ) **************************************************************************************************************************************************************