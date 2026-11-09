

export interface AisleOptions<
    Key extends string,
    State extends any,
    Actions extends Record<string,(state:State,payload?:any)=>any>,
>{
    key:Key,
    state:State,
    actions?:Actions,
    /**
     * when true, mutating Store.state.aisleKey will not affect the aisle state.
     * @default false
     * @notice Overrides the store immutable option.
     */
    immutable?:boolean,
    onDidSet?(state:State):void;
    onWillSet?<Key extends keyof Actions>(action:"set"|Key,payload?:any):void;
} 

export interface AisleInstance<
    Key extends string=any,
    State extends any=any,
    Actions extends Record<string,(state:State,payload?:any)=>any>=any,
>{
    readonly key:Key;
    readonly state:State;
    readonly actions:{
        [Key in keyof Actions]:(payload?:any)=>any;
    }&{
        set(payload?:any):void;
    };
}

interface AisleConstructor {
    new<
        Key extends string,
        State extends any,
        Actions extends Record<string,(state:State,payload?:any)=>any>,
    >(
        options?:AisleOptions<Key,State,Actions>
    ):AisleInstance<Key,State,Actions>;
}

declare const Aisle:AisleConstructor;
export default Aisle;
