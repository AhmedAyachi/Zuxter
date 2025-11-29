import Aisle from "../Aisle/Aisle";


export default class Store {

    constructor(options:{
        state?:{},
        aisles?:Aisle[],
        /**
         * @default false
         */
        devTools?:boolean,
    });

    /**
     * The current store state
     */
    readonly state:{};

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
}
