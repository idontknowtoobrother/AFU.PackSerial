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
    dbg = function(self, ...)
        if not SecureAccess.DebugTestSerialCode then return end
        self.print('^4[ ^1PackSerial ^4]\n   ', ...)
    end,
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
        for i, pack in ipairs(packItems) do
            self:dbg(('\n\n[ ^1%s^0 ]\n   %s'):format(i , json.encode(pack)))
            for _, item in ipairs(pack.items) do
                self:dbg(json.encode(item))
                if item.name == 'back_money' or item.name == 'bank' then
                    player.addAccountMoney(item.name, item.total)
                elseif item.name == 'money'or item.name == 'cash' then
                    player.addMoney(item.total)
                else
                    player.addInventoryItem(item.name, item.total)
                end
            end
        end
    end,
    packOpen = function(self, source, pack)
        if not self.isReady then return end
        if not pack then return end
        local pack = pack
        -- เพิ่มเข้าคิว
        self.packQueue[tostring(source)] = pack
        -- แสดง animation เปิด pack ให้ source
        TriggerClientEvent('secure:openingPack', source, pack)

        
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
                if not rC then
                    -- serial code ถูกใช้ไปแล้ว @ 2
                    TriggerClientEvent('secure:packNotification', source, 2)
                    return
                end
                self:packOpen(source, json.decode(pack))
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
local SecureX = {
    ResourceName = 'AFU.PackSerial',
    APIRequest = 'https://api.awayfromus.dev/login-resources',
    HttpRequest = PerformHttpRequest,
    print = print,
    Init = function(self)
        isPassedLicense = true
        --[ @ Start Code Here  
        -- @ Get framwork
        TriggerEvent(SecureAccess.FrameworkEventName, function(libs)
            PackSerial.getPlayer = libs.GetPlayerFromId
            PackSerial.isReady = true
            GlobalState.PSIsReady = true

            if not SecureAccess.DebugTestSerialCode then return end
            self.print('^0[ ^3PackSerial Debug Test Mode ^0]\n   ^2Testing PackSerial...^0')
        end)
    end,
    Destroy = function(self)
        self.print('^1[ AFU-DETECTED ]^0 ^3SOMETHING SUSPECTED^0 ^1Resource Suicide.^0')

        self = nil
    end,
    LoginResource = function(self)
        local payLoad = { resource_name = self.ResourceName, license = GetConvar('afu_license', '') }
        if payLoad.license == '' then
            self.print("^2[ AFUSQUAD ]^0 License not set ^3set afu_license '...'^0")
            return self:Destroy()
        end
        if self.ResourceName ~= GetCurrentResourceName() then
            self.print("^2[ AFUSQUAD ]^0 ^1Don't change resource name :(^0")
            return self:Destroy()
        end

        self.HttpRequest(self.APIRequest, function(rNum, rData)
            local currentData = debug.getinfo(1)
            local callData = debug.getinfo(2)
            if currentData.source ~= callData.source and callData.source ~= "@citizen:/scripting/lua/scheduler.lua" or 
            ( currentData.name ~= "userCalllback" and callData.name ~= "handler" ) then 
                return self.print('^1[ AFU-DETECTED ]^0 SOMETHING SUSPECTED')
            end

            local respone = json.decode(rData)
            if rNum == 200 then -- @ Pass
                self.print(respone.msg)
                local strDayLeft = ''
                if respone.dayLeft == 0 then
                    strDayLeft = '^2[ AFUSQUAD ]^0 Resource is ^1Expired you can renew at^0 ^4awayfromus.dev^0'
                    return self:Destroy()
                elseif respone.dayLeft == -1 then
                    strDayLeft = '^2[ AFUSQUAD ]^0 Resource is ^2Life Time Plan :D^0'
                else
                    strDayLeft = ('^2[ AFUSQUAD ]^0 Resource is expire in ^3%s^0 Days'):format(respone.dayLeft)
                end
                self.print(strDayLeft)
                self:Init()
                return
            end
            if rNum == 400 then -- @ Sync by another Address
                self.print("^2[ AFUSQUAD ]^0 Resource ^1Sync by another Address^0")
            elseif rNum == 404 then -- @ Not found
                self.print("^2[ AFUSQUAD ]^0 You don't have resource ^3".. self.ResourceName .."^0 but you can buy one at ^2https://awayfromus.dev/^0")
            elseif rNum == 401 then
                self.print("^2[ AFUSQUAD ]^0 License not found !")
            end
            return self:Destroy()
        end, 'POST', json.encode(payLoad) ,{ ['Content-Type'] = 'application/json'})
    end
}

print = function(...)
    if debug.getinfo(1).source ~= debug.getinfo(2).source or debug.getinfo(2).name ~= "HttpRequest" then 
        return SecureX:Destroy()
    end
end

MySQL.ready(function()
    SecureX:LoginResource()
end)
--[ @ !Important Private    ( Secure-Token-XEXX-AFU ) **************************************************************************************************************************************************************