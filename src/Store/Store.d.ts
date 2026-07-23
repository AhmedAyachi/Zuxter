import {Aisle} from "../Aisle/Aisle";


export default function Store<
    State extends object,
    Aisles extends Aisle[]
>(options:{
    state?:State,
    aisles?:Aisles,
    /**
     * @default false
     */
    withDevTools?:boolean,
    /**
     * Sets the Store.state behavior.
     * 
     * when true, the Store.state.aisleKey getter will return a structured clone of the store.
     * @default false
     */
    immutable?:boolean,
}):{

    /**
     * The current store state
     */
    readonly state:State&{
        [Key in Aisles[number]["key"]]:Extract<Aisles[number],{key:Key}>["state"];
    };

    set(payload:any):void;
    /**
     * 
     * @param listener The subscription callback.
     * @returns an unsubscription function.
     */
    subscribe(listener:()=>void):()=>boolean;
    /**
     * Subscribes to a specific store aisle.
     * @param aisleKey The aisle key to subscribe to.
     * @returns an unsubscription function.
     */
    subscribe(aisleKey:Aisles[number]["key"]|"*",listener:()=>void):()=>boolean;
    /**
     * Subscribes to multiple store aisles.
     * @param aisleKeys The aisle-keys to subscribe to.
     * @returns an unsubscription-from-all function
     */
    subscribe(aisleKeys:Aisles[number]["key"][],listener:()=>void):()=>boolean;
}&{
    readonly [Key in Aisles[number]["key"]]:Extract<Aisles[number],{key:Key}>["actions"];
};
