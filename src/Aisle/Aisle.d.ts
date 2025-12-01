

export default class Aisle<
    Key extends string,
    State extends any,
    Actions extends {[name:string]:(state:State,payload?:any)=>void},
>{
    constructor(options:AisleOptions<Key,State,Actions>);

    state:State;
    readonly key:Key;
    readonly actions:Actions&{
        set(payload?:any):void;
    };
}

interface AisleOptions<Key,State,Actions> {
    key:Key,
    state:State,
    actions:Actions,
}
