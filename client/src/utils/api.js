import { createContext } from "react";

export class Api {

    constructor(initialToken) {
        this.authToken = initialToken
    }

    async makeRequest(url, method, body) {
        const options = {};
        
        if (method=== "POST" || method === "PUT" || method === "DELETE") {
            options.body = JSON.stringify(body)
        }
        
        const res  = await fetch (url, {
            method, 
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
            ...options
        });

        if (!res.ok) {
            console.log(res)
            const errorBody = await res.json();
            throw new Error(errorBody.message || `HTTP error! status: ${res.status}`);
        }
        const text = await res.text();
        return text ? JSON.parse(text): {};
    }

    get(uri) {
        return this.makeRequest(uri, "GET")
    }

    post(uri, body) {
        return this.makeRequest(uri, "POST", body)
    }

    put (uri, body) {
        return this.makeRequest(uri, "PUT", body) 
    }

    del (uri, body) {
        return this.makeRequest(uri, "DELETE", body)
    }
}

export const ApiContext = createContext(new Api());