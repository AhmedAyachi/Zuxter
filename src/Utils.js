

export const isObject=(x)=>x&&(typeof(x)==="object")&&!Array.isArray(x);

export const mergeObjects=(target,source)=>{
    for(const key in source){
        const srcValue=source[key];
        const tgtValue=target[key];
        if(isObject(tgtValue)&&isObject(srcValue)) mergeObjects(tgtValue,srcValue);
        else target[key]=srcValue;
    }
};
