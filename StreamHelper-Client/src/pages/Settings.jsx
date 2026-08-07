import { useState } from "react";
import { Input } from "../components/Input";
import { useEffect } from "react";
import { useApi } from "../utils/api.js";

export function Settings() {
    const api = useApi();
    const [settings, setSettings] = useState(new Map());

    useEffect(()=> {
        api.get("api/settings/all").then((res)=> {
            for (const s of res.data) {
                updateSetting(`${s.section}.${s.settingKey}`, s.settingValue);
            }
        })
    },[])

    function updateSetting(key, value) {
        setSettings(current=> {
            const updated = new Map(current);
            updated.set(key, value);
            return updated;
        })
    }

    return (
        <div className="settings-page">
            <h1>Settings</h1>

            <section className="settings-section">
                <h2>Twitch</h2>

                <div className="setting-row">
                    <Input id={"clientId"} label={"Client Id:"} type={"text"} placeholder={"Client Id for Twitch"} onChange={(value)=>{updateSetting("twitch.clientId", value)}} value={settings?.get("twitch.clientId")}/>
                </div>

                <div className="setting-row">
                    <label>Authentication Mode</label>

                    <div className="radio-group">
                        <label>
                            <input
                                type="radio"
                                name="authMode"
                                value="private"
                                defaultChecked
                            />
                            Private
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="authMode"
                                value="public"
                            />
                            Public
                        </label>
                    </div>
                </div>

                <div className="setting-row">
                    <label htmlFor="clientSecret">
                        Client Secret
                    </label>

                    <input
                        id="clientSecret"
                        type="password"
                        placeholder="Enter your Twitch Client Secret"
                    />
                </div>

                <div className="settings-actions">
                    <button>
                        Save
                    </button>
                </div>
            </section>
        </div>
    );
}