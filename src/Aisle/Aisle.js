import {mergeObjects,isObject} from "../Utils.js";
import {createDraft} from "immer";


export const internals={};
export default class Aisle {

    #key=null;
    #state=null;
    #actions={};
    #onDidSet=null;
    #onWillSet=null;
    #listeners=new Set();
    immutable;

    constructor(options){
        const {key}=options;
        if(key&&typeof(key)==="string"){
            this.#key=key;
            this.#state=options.state;
            if("immutable" in options){
                this.immutable=Boolean(options.immutable);
            }
            const {onWillSet,onDidSet}=options;
            if(typeof(onDidSet)==="function") this.#onDidSet=onDidSet;
            if(typeof(onWillSet)==="function") this.#onWillSet=onWillSet;
            this.#setActions(options.actions);
        }
        else throw new Error("a non-empty string as an aisle key is required");
    }

    get key(){ return this.#key };
    get state(){
        const state=this.#state;
        if(this.immutable&&state&&(typeof(state)==="object")) return createDraft(state);
        else return state;
    };
    get actions(){ return {...this.#actions} };

    set(payload){
        const onWillSet=this.#onWillSet;
        onWillSet&&onWillSet("set",payload);
        this.#mutate(payload);
        const onDidSet=this.#onDidSet;
        onDidSet&&onDidSet(this.#state);
        this.#onChangeState();
    }

    #mutate(payload){
        if(isObject(this.#state)&&isObject(payload)){
            mergeObjects(this.#state,payload);
        }
        else if(Array.isArray(this.#state)&&Array.isArray(payload)){
            this.#state=[...payload];
        }
        else this.#state=payload;
    }

    subscribe(listener){
        if(typeof(listener)==="function"){
            this.#listeners.add(listener);
            return ()=>{
                return this.#listeners.delete(listener);
            }
        }
        else throw new Error("subscribe expects a function as listener");
    }

    #setActions(actions){
        const onDidSet=this.#onDidSet;
        const onWillSet=this.#onWillSet;
        for(const actionName in actions){
            if(actionName!=="set"){
                const action=actions[actionName]
                if(typeof(action)==="function"){
                    this.#actions[actionName]=(payload)=>{
                        onWillSet&&onWillSet(actionName,payload);
                        const result=action(this.#state,payload,{
                            setState:(value)=>{ this.#state=value },
                        });
                        onDidSet&&onDidSet(this.state);
                        this.#onChangeState();
                        return result;
                    }
                } else throw new Error("invalid action: "+actionName);
            }
            else throw new Error(`${this.#key} aisle: can't use 'set' as an action name.`);
        }
        this.#actions.set=(payload)=>this.set(payload);
        Object.freeze(this.#actions);
    }
    
    #onChangeState(){
        const listeners=this.#listeners;
        if(listeners.size){
            const {state}=this;
            listeners.forEach(listener=>{
                listener(state);
            });
        }
    }

    static {
        internals.getAisleState=(instance)=>instance.#state;
        internals.mutateAisleState=(instance,payload)=>{
            instance.#mutate(payload);
        }
    }
}
