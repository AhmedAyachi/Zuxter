import {ZuxAisle} from "../Aisle/Aisle";
import {mergeObjects,isObject} from "../Utils";
import {createDraft} from "immer";


class ZuxStore {

    #state=null;
    #aisleMap={};
    #devTools=null;
    #immutable=false;
    #listeners=new Set();
    //#devToolsSendTimeout;

    constructor(options){
        const {state,aisles}=options;
        this.#immutable=Boolean(options.immutable);
        if(isObject(state)) this.#state=structuredClone(state);
        else if(state===undefined) this.#state={};
        else throw new Error("the state option expects an object as value");
        if(Array.isArray(aisles)&&aisles.every(it=>it instanceof ZuxAisle)){
            for(const aisle of aisles){
                this.#registerAisle(aisle);
            }
        }
        else if(aisles!==undefined){
            throw new Error("the store aisles option must be an array of Aisle instances");
        }
        if(options.withDevTools) this.#connectToDevTools();
    }

    get state(){
        if(this.#immutable){
            const state={...this.#state};
            for(const key in this.#aisleMap){
                Object.defineProperty(state,key,{
                    get:()=>this.#aisleMap[key].state,
                });
            }            
            return createDraft(state);
        }
        else return this.#state;
    }

    set(payload){
        if(isObject(payload)){
            for(const key in payload){
                const value=payload[key];
                const aisle=this.#aisleMap[key];
                if(aisle) aisle.set(value);
                else if(isObject(value)){
                    const stateValue=this.#state[key];
                    if(isObject(stateValue)) mergeObjects(stateValue,value);
                    else this.#state[key]={...value};
                }
                else if(Array.isArray(value)) this.#state[key]=[...value];
                else this.#state[key]=value;
            }
            this.#onChangeState();
            if(this.#devTools) this.#updateDevTools(`store/set ${Object.keys(payload)}`,payload);
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

    #getShallowStateCopy(){
        const state={...this.#state};
        for(const key in this.#aisleMap){
            state[key]=this.#aisleMap[key].state;
        }
        return state;
    }

    #onChangeState(){
        /* clearTimeout(this.#devToolsSendTimeout);
        this.#devToolsSendTimeout=null; */
        const listeners=this.#listeners;
        if(listeners.size){
            const {state}=this;
            listeners.forEach(listener=>{
                listener(state);
            });
        }
    }
    #connectToDevTools(){
        const reduxExtension=window.__REDUX_DEVTOOLS_EXTENSION__;
        if(reduxExtension){
            const reduxDevTools=this.#devTools=reduxExtension.connect({
                name:"ZucStore",
                trace:true,
            });
            if(reduxDevTools) reduxDevTools.init(this.#getShallowStateCopy());
        }
    }
    #updateDevTools(actionName,payload){
        const devTools=this.#devTools;
        devTools.send(actionName,this.#getShallowStateCopy());
    }

    #registerAisle(aisle){
        Object.defineProperty(aisle,"immutable",{
            writable:false,
            configurable:false,
            value:typeof(aisle.immutable)==="boolean"?aisle.immutable:this.#immutable,
        });
        const {key,actions}=aisle;
        this.#aisleMap[key]=aisle;
        const aisleActionMap={};
        const setAisle=actions.set.bind(aisle);
        delete actions.set;
        for(const actionName in actions){
            aisleActionMap[actionName]=(payload)=>{
                const result=actions[actionName](payload);
                this.#onChangeState();
                if(this.#devTools) this.#updateDevTools(key+"/"+actionName,payload);
                return result;
            }
        }
        aisleActionMap.set=(payload)=>{
            setAisle(payload);
            if(this.#devTools){
                this.#updateDevTools(`${key}/set ${isObject(payload)?Object.keys(payload):""}`,payload);
            }
        },
        Object.defineProperty(this.#state,key,{
            get:()=>this.#aisleMap[key].state,
        });
        Object.defineProperty(this,key,{
            value:Object.freeze(aisleActionMap),
        });
    }
    

    #toInspectable(){
        return "[Store]";
    }
    toString() { return String(this.#toInspectable()) };
    toJSON(){ return this.toString() };
    get [Symbol.toStringTag]() { return this.#toInspectable() };
}

export default function Store(options){
    return new ZuxStore(options);
}
