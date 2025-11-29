

export default class Aisle<
    Key extends string,
    State extends any,
    Actions extends [string:(state:State,payload:any)=>{}],
> extends Actions {
    constructor(options:AisleOptions<Key,State,Actions>);

    readonly key:string;
    readonly actions:Actions;
}

interface AisleOptions<Key,State,Actions> {
    key:Key,
    state:State,
    actions:Actions,
}
