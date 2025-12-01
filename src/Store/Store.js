import Aisle from "../Aisle/Aisle";
import {mergeObjects,isObject} from "../Utils";


export default class Store {

    #state={};
    #aisleMap={};
    #devTools=null;
    #listeners=new Set();

    constructor(options){
        const {state,aisles}=options;
        if(isObject(state)) Object.assign(this.#state,state);
        if(Array.isArray(aisles)&&aisles.every(it=>it instanceof Aisle)){
            for(const aisle of aisles){
                const {key,actions}=aisle;
                this.#aisleMap[key]=aisle;
                const aisleRef=this[key]={};
                for(const actionName in actions){
                    aisleRef[actionName]=(payload)=>{
                        actions[actionName](payload);
                        this.#onChangeState();
                        this.#updateDevTools(key+"/"+actionName,payload);
                    }
                }
                Object.freeze(aisleRef);
            }
        }
        else throw new Error("the store aisles option must be an array of Aisle instances");
        if(options.devTools) this.#connectToDevTools();
    }

    get state(){
        for(const key in this.#aisleMap){
            this.#state[key]=this.#aisleMap[key].state;
        }
        return this.#state; 
    }

    set(payload){
        if(isObject(payload)){
            for(const key in payload){
                const value=payload[key];
                const aisle=this.#aisleMap[key];
                if(aisle) aisle.set(value);
                else if(isObject(value)) mergeObjects(this.#state,value);
                else this.#state[key]=value;
            }
            this.#onChangeState();
            this.#updateDevTools("store/set",payload);
        }
        else throw new Error("store.set expects an object as payload");
    }

    subscribe(...params){
        const listener=params.find(it=>typeof(it)==="function");
        let aisleKeys=params.find(it=>Array.isArray(it)||(typeof(it)==="string"));
        if(typeof(aisleKeys)==="string") aisleKeys=aisleKeys==="*"?null:[aisleKeys];
        if(Array.isArray(aisleKeys)){
            const unsubscribers=[];
            for(const key of aisleKeys){
                const aisle=this.#aisleMap[key];
                if(aisle){
                    unsubscribers.push(aisle.subscribe(listener));
                }
                else throw new Error(`no aisle with such key: '${key}'`);
            }
            return ()=>{
                for(const unsubscriber of unsubscribers) unsubscriber();
            }
        }
        else if(typeof(listener)==="function"){
            this.#listeners.add(listener);
            return ()=>{
                return this.#listeners.delete(listener);
            }
        }
        else throw new Error("subscribe expects a function as listener");
    }

    #onChangeState(){
        this.#listeners.forEach(listener=>{
            listener(this.state);
        });
    }
    #connectToDevTools(){
        if(window.__REDUX_DEVTOOLS_EXTENSION__){
            const reduxDevTools=this.#devTools=window.__REDUX_DEVTOOLS_EXTENSION__?.connect({
                name:"WineryStore",
                trace:true,
            });
            if(reduxDevTools){
                reduxDevTools.init(this.state);
            }
        }
    }
    #updateDevTools(actionName,payload){
        const devTools=this.#devTools;
        if(devTools){
            devTools.send(actionName,this.state);
        }
    }
    

    #toInspectable(){
        return "[Store]";
    }
    toString() { return String(this.#toInspectable()) };
    toJSON(){ return this.toString() };
    get [Symbol.toStringTag]() { return this.#toInspectable() };
}
