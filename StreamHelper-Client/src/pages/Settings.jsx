import { useState } from "react";
import { Input } from "../components/Input";
import { useEffect } from "react";
import { useApi } from "../utils/api.js";
import Button from "../components/Button.jsx";

export function Settings() {
    const api = useApi();
    const [settings, setSettings] = useState(new Map());

    useEffect(()=> {
        api.get("api/settings/all").then((res)=> {
            if (!res.success) {
                return;
            }
            for (const s of res.data) {
                // console.log(s);
                updateSetting(`${s.section}.${s.settingKey}`, s.settingValue);
            }
        })
    }, [])

    function updateSetting(key, value) {
        setSettings(current=> {
            const updated = new Map(current);
            updated.set(key, value);
            return updated;
        })
    }

    function save() {
        const data = Object.fromEntries(settings);
        api.post("api/settings/save", data).then((res)=> {
            console.log(res);
        })
    }

    return (
        <div className="page">
            <h1 className="pt-4">Settings</h1>

            <h2>Twitch</h2>
            <section className="max-w-[800px] border-black outline-4 rounded-xl p-4">
                <Input 
                    id={"clientId"} 
                    label={"Client Id:"} 
                    type={"text"} 
                    placeholder={"Client Id for Twitch"} 
                    onChange={(value)=>{updateSetting("twitch.clientId", value)}} 
                    value={settings?.get("twitch.clientId")}/>

                <div className="setting-row">
                    <label>Authentication Mode</label>

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="authMode"
                                value="private"
                                checked={settings.get("twitch.clientType") === "private"}
                                onChange={e=>updateSetting("twitch.clientType", e.target.value)}
                                />
                            Private
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="authMode"
                                value="public"
                                checked={settings.get("twitch.clientType") === "public"}
                                onChange={e=>updateSetting("twitch.clientType", e.target.value)}
                            />
                            Public
                        </label>
                    </div>
                </div>

                <Input 
                    id={"clientSecret"} 
                    label={"Client Secret:"} 
                    type={"password"} 
                    placeholder={"Client Secret for Private Twitch"} 
                    onChange={(value)=>{updateSetting("twitch.clientSecret", value)}} 
                    value={settings?.get("twitch.clientSecret")}/>

                <div className="settings-actions">
                    <Button text={"Save"} className={"warning-button"} onClick={save}/>
                </div>
            </section>
        </div>
    );
}