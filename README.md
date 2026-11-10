# Zuxter

## What is this ?
This is a global state manager designed to be used with vanilla JavaScript.

It' s a mix of the redux API and the Zustand mutable state approach.

## Why is it made ?
When I was developing React apps, ***Redux*** was the way to go as they go well together. But when I used it in vanillaJS projects, Redux freezing philosophy was frustrating. Tried to use ***Zustand*** but did not like the API that much.
I created **Zuxter** to bring the best of the two worlds.
What I did not like about redux:
1. Providing new references to update the state which creates overhead.
2.  Calling ***dispatch*** along with calling the *action*. 
3. The unability to subscribe to reducers. Any state change triggers all subscriptions.

But ***Redux***'s API for creating the store and the reducers was good and clean.
***Zustand*** provided a simple approach for managing the store with no overhead but the API was just too verbose.

## How to use it ?
### Creating the store
```
const store=new Store({
    withDevTools:true,//redux devtools
    state:{
        count:22,
        user:{
            id:"some_id",
            name:"user name",
        },
    },
});
store.set({
    count:Store.state.count+1,
    user:{name:"new user name"},
});
```
In the exmaple above, only the **count** and the **user.name** fields will get set.
The ***set*** method is a general purpose setter that supports nested updates.
```
//New state:
{
    count:23,
    user:{
        id:"same_id",
        name:"new user name",
   },
}
```

### Creating an Aisle
An ***aisle*** is a redux reducer equivalent.
```
const userAisle=new Aisle({
    key:"user",
    state:{
        id:"some_id",
        name:"some name",
        groups:[],
    },
    actions:{
        setName:(state,payload)=>{
            state.name=payload;
        },
    },
});
const countAisle=new Aisle({
    key:"count",
    state:0,
    actions:{
        increment(state,_,{setState}){
            setState(state+1);
        },
        decrement(state,_,{setState}){
            setState(state-1);
        },
    },
});
const store=Store({
    withDevTools:true,//redux devtools
    aisles:[countAisle,userAisle],
});
store.user.setName("new name");
store.count.increment();
store.count.decrement();
```
No need to import anything to disptach an aisle action. You just use the simple following syntax :
```
store.aisleKey.aisleAction(payload);
```

In the example above you can update the user name as follows too:
```
store.user.set({
    name:"new user name",
});
```
The aisle **set** method works exatly the same as the **store.set** method.

An aisle has a default **set** action that can't be overwritten.
> Defining an action named **set** will throw an error.

When overwriting an aisle state value, zuxter uses a shallow copy of the payload and that to skip accidental mutations.
```
const groupsAisle=new Aisle({
    key:"groups",
    state:[],
    actions:{},
});
const newGroups=[{
    id:"some_grp_id",
    name:"some grp name",
}]
store.groups.set(newGroups);
newGroups.push(someOtherGroup);//this line won't change the store.state.groups array
store.state.groups.push(someNewGroup); //this line will push a new group to the groups array unless the aisle is immutable
```

## Store
### 0ptions
|Option|Type|Description|
|------|---|------------|
|state|plain object|the store initial state|
|aisles|Aisle[]|the store aisles. You can access an aisle state using the **store.state.aisleKey** getter|
|immutable|boolean|If true, the store state is mutable through store actions only and the store.state returns an immer draft instead of a state object reference.|

### Fields
|Field|Type|Description|
|-----|----|-----------|
|state|plain object|if immutable false then gets the actual store state object otherwise an immer draft|
|set|(object):void|sets the store state and aisle values as well, all at once|
|mutate|(callback:(state)=>void,message?:string)|direct store mutation even though the store is immutable|
|subscribe|(callback):()=>boolean|subscribes to a store/aisle changes and returns an unsubscription method that returns true when the unsubscription was successful|

## Aisle 
### Options
|Field|Type|Description|
|-----|----|-----------|
|key|string|the aisle key|
|state|any|the aisle state|
|immutable|boolean|overrides the store immutable option for the aisle otherwise it's inherited|
|onDidSet|(state):void|triggered when an aisle action is called|
|onWillSet|(action:string,payload:any):void|triggered when an aisle action is called|

> You are not supposed to use the Aisle directly but to add them to the store aisles option array.

## Aisle vs The store state option

```
const userAisle=new Aisle({
    key:"user",
    state:{
        id:"user_id",
        name:"user name",
        age:27,
    },
    actions:{
        setName(state,payload){
	          state.name=payload;
        },
    },
});
const store=new Store({
    aisles:[userAisle],
    state:{
        business:{
            id:"user_business_id",
            name:"some caffe",
        },
    },
});
```
In the store setup above:
We can get both the user id and the business id through:
```
store.state.user.id;
store.state.business.id;
```
We can update the user name and the business name through:
```
store.user.set({name:"new user name"});
store.set({
    business:{name:"new business name"},
});
//Or through the user aisle action
store.user.setName("new user name");
//Or both at once
store.set({
    user:{name:"new user name"},
    business:{name:"new business name"},
});
```
Both update approaches mentioned above are result-equivalent. But the fact that the user is an aisle and the business is just a plain state object, you can subscribe to user aisle changes through:
```
const unsubscribeFromUserAisle=store.subscribe("user",(user)=>{
    user.name;// new user name
});
```
You can't listen to the changes made to only the business object. You need to convert it to an aisle for that. The state option is only there to add static values to your store, values that are global and almost never change.

## Store subscriptions
A store subscription is a way to listen for store changes and call functions only when a mutation occurred.
To listen for any store change:
You can listen to any store change  though through:
```
const unsubscribe=store.subscribe(state=>{
    state.user.name;// new user name
    state.business.name;// new business name
});
```
The subscribe method returns an unsubscription function that you can call when you no longer need to listen for changes anymore.
In addition, you can listen for a specific aisle change by passing the aisle key as first param:
```
const unsubscribeFromUserAisle=store.subscribe("user",(user)=>{
    //user object changed
});
```
Furthermore, you can listen for multiple aisle changes at once:
```
const unsubscribeFromBothAisles=store.subscribe(["firstAisleKey","secondAisleKey"],()=>{
    //one of them changed
});
```
> Zuxter does not check if a value has actually changed to trigger subscriptions and instead triggers them when an aisle action has been called as 90% of the time, the value is going to change.

## Aisle state check
The aisle has an ***onDidSet*** option that we can use to check if an aisle value has been correctly updated.
```
new Aisle({
    key:"aisleKey",
    state:{
        someProperty:"some value",
    },
    actions:{
        setSomeProperty(state,value){
	          state.someProperty=value;
        },
    },
    onDidSet:(state)=>{
        if(typeof(state.someProperty)!=="string"){
            throw new Error("someProperty has to be of type string");
        }
    },
});
```
If your code accidentally used a non-string value to update that property, an error will be thrown, either through ***store.aisleKey.setSomeProperty***, ***store.aisleKey.set*** or even through ***store.set***. 

## Aisle State Middleware
The aisle has an ***onWillSet*** option, a function to call before calling the action.

```
new Aisle({
    key:"aisleKey",
    state:{},
    actions:{
        setSomeProperty(state,value){},
    },
    onWillSet:(action,payload)=>{
        //This block gets executed before any action implementation code
        if(action==="setSomeProperty"){
            //the code called store.aisleKey.setSomeProperty
        }
    },
});
```