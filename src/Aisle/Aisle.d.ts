

export default function Aisle<
    Key extends string=any,
    State extends any=any,
    Actions extends {[name:string]:(state:State,payload?:any)=>void}=any,
>(options:{
    key:Key,
    state:State,
    actions:Actions,
}):Aisle<Key,State,Actions>;

export type Aisle<
    Key extends string=any,
    State extends any=any,
    Actions extends {[name:string]:(state:State,payload?:any)=>void}=any,
>={
    state:State;
    readonly key:Key;
    readonly actions:Actions&{
        set(payload?:any):void;
    };
}