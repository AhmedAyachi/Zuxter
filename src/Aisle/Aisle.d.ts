

export default function Aisle<
    Key extends string,
    State extends any,
    Actions extends {[name:string]:(state:State,payload?:any)=>any},
>(options:{
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
    onWillSet?(action:keyof Actions,payload:any):void;
}):Aisle<Key,State,Actions>;

export type Aisle<
    Key extends string=any,
    State extends any=any,
    Actions extends {[name:string]:(payload?:any)=>any}=any,
>={
    state:State;
    readonly key:Key;
    readonly actions:{
        [Key in keyof Actions]:(payload?:any)=>any;
    }&{
        set(payload?:any):void;
    };
}