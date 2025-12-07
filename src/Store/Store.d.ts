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
    devTools?:boolean,
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
    subscribe(aisleKey:string,listener:()=>void):()=>boolean;
    /**
     * Subscribes to multiple store aisles.
     * @param aisleKeys The aisle-keys to subscribe to.
     * @returns an unsubscription-from-all function
     */
    subscribe(aisleKeys:string[],listener:()=>void):()=>boolean;
}&{
    readonly [Key in Aisles[number]["key"]]:Extract<Aisles[number],{key:Key}>["actions"];
};
