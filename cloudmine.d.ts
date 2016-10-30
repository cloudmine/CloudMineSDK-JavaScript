export interface CloudMineConfigOptions {
    appid: string;
    apikey: string;
}

export declare class WebService {
    constructor (config: CloudMineConfigOptions);
    auth();
    login(email, password): EventedObject;
    set(key: String, data: any);
    get();
}

export declare interface jQueryLikeCallback {
    (data: {}, response: {}): void;
}

export interface EventedObject {
    on(event: string, callback: jQueryLikeCallback): EventedObject;
}