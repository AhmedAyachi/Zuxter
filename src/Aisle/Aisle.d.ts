

interface AisleOptions<
    Key extends string,
    State extends any,
    Actions extends AisleConstructorActions<State>,
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
    onWillSet?(action:"set"|keyof Actions,payload?:any):void;
} 

export interface AisleInstance<
    Key extends string=any,
    State extends any=any,
    Actions extends AisleConstructorActions<State>=any,
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
        Actions extends AisleConstructorActions<State>,
    >(
        options?:AisleOptions<Key,State,Actions>
    ):AisleInstance<Key,State,Actions>;
}

type AisleConstructorActions<State>=Record<string,(
    state:State,
    payload:any,
    helpers:{
        /**
         * overwrites the actual aisle value in the store
         */
        setState:(newState:any)=>void,
    },
)=>any>;

declare const Aisle:AisleConstructor;
export default Aisle;
