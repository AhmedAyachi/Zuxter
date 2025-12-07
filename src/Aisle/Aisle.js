import {mergeObjects,isObject} from "../Utils";


export class ZuxAisle {

    #key=null;
    state=null;
    #actions={};
    #listeners=new Set();

    constructor(options){
        const {key}=options;
        if(key&&typeof(key)==="string"){
            this.#key=key;
            this.state=options.state;
            this.#setActions(options.actions);
        }
        else throw new Error("a non-empty string as an aisle key is required");
    }

    get key(){ return this.#key };
    get actions(){ return {...this.#actions} };

    set(payload){
        if(isObject(this.state)&&isObject(payload)){
            mergeObjects(this.state,payload);
        }
        else if(Array.isArray(this.state)&&Array.isArray(payload)){
            this.state=[...payload];
        }
        else this.state=payload;
        this.#onChangeState();
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
        for(const actionName in actions){
            if(actionName!=="set"){
                const action=actions[actionName]
                if(action){
                    this.#actions[actionName]=(payload)=>{
                        const result=action(this.state,payload);
                        this.#onChangeState();
                        return result;
                    }
                }
                else throw new Error("invalid action: "+actionName);
            }
            else throw new Error(`${this.#key} aisle: can't use 'set' as an action name.`);
        }
        this.#actions.set=(payload)=>this.set(payload);
        Object.freeze(this.#actions);
    }
    #onChangeState(){
        this.#listeners.forEach(listener=>{
            listener(this.state);
        });
    }
}

export default function Aisle(options){
    return new ZuxAisle(options);
}
