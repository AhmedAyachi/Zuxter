import {AisleInstance} from "../Aisle/Aisle";


export interface StoreOptions<State extends object,Aisles extends AisleInstance[]> {
    state?:State;
    aisles?:Aisles;
    /**
     * @default false
     */
    withDevTools?:boolean;
    /**
     * When true,the Store.state getter will return
     * an immer draft of the store's state object.
     * @notice the aisles immutable option value will default to this value.
     * @default false
     */
    immutable?:boolean;
}

export type StoreInstance<State extends object,Aisles extends AisleInstance[]>={
    /**
     * The current store state
     */
    readonly state:StoreState<State,Aisles>;
    /**
     * Sets the store state.
     *
     * Triggers subscription listeners.
     */
    set(payload:any):void;
    /**
     * By using mutate, you get a direct access to the store state.
     *
     * Changes are shown in the redux devtools.
     * 
     * @param message
     * An brief explanatory message to display in the redux devtools
     * describing what this mutation does.
     * @default message "store/mutate"
     * 
     * @notice
     * Does not trigger subscription listeners.
     */
    mutate(callback:(state:StoreState<State,Aisles>)=>void,message?:string):void;
    /**
     * @param listener The subscription callback.
     * @returns an unsubscription function.
     */
    subscribe(listener:(state:State&{
        readonly [Key in Aisles[number]["key"]]:Extract<Aisles[number],{key:Key}>["state"]
    })=>void):()=>boolean;
    /**
     * Subscribes to a specific store aisle.
     * @param aisleKey The aisle key to subscribe to.
     * @returns an unsubscription function.
     */
    subscribe<Key extends Aisles[number]["key"]>(
        aisleKey:Key,
        listener:(state:Extract<Aisles[number],{key:Key}>["state"])=>void,
    ):()=>boolean;
    /**
     * Subscribes to multiple store aisles.
     * @param aisleKeys The aisle-keys to subscribe to.
     * @returns an unsubscription-from-all function
     */
    subscribe(aisleKeys:Aisles[number]["key"][],listener:()=>void):()=>boolean;
}&{
    readonly [Key in Aisles[number]["key"]]:Extract<Aisles[number],{key:Key}>["actions"];
};

interface StoreConstructor {
    new <State extends object,Aisles extends AisleInstance[]>(
        options?:StoreOptions<State,Aisles>
    ):StoreInstance<State,Aisles>;
}

type StoreState<State extends object,Aisles extends AisleInstance[]>=State&{
    [Key in Aisles[number]["key"]]:Extract<Aisles[number],{ key:Key }>["state"];
};

declare const Store:StoreConstructor;
export default Store;
