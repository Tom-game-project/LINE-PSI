/*
#calc_parser.js
## written by Tom0427
## for Google App Script





*/

const Elem_type = {
    //列挙型(のつもり)
    //
    FUNCTION : 0,
    OPERATION: 1,
    NUMBER   : 2,
    BRACKETS : 3,
    OTHER    : 4,
    VALUE    : 5,
    FORMULA  : 6
}

class func{
    constructor(funccode){
        this.code = funccode;
        let funcelem = this.split();
        this.funcname = this.check_funcname(funcelem[0]);
        if (this.funcname.includes(" ")){
            throw new Error("関数名にスペースを入れないでください");
        }
        this.funcargs = this.split_args(funcelem[1]);
    }
    check_funcname(text){
        if (text[0]==" "){
            return this.check_funcname(text.slice(1));
        }
        if (text[text.length-1]==" "){
            return this.check_funcname(text.slice(0,-1));
        }
        return text;
    }

    split(){
        let funcname;
        let funcargs;
        let index = [...this.code].findIndex(element=>element==="(");
        if (index<0){
            throw new Error("引数部分の文法が不正です");
        }
        else{
            funcname = this.code.slice(0,index);
            funcargs = this.code.slice(index);
        }
        return [funcname,funcargs];
    }
    split_args(funcargs){
        let depth = 0;
        let args = [];
        let arg = "";
        for (const i of funcargs){
            switch (i){
                case "(":
                    if (depth>0){
                        arg+=i
                    }
                    depth++;
                    break;
                case ")":
                    depth--;
                    if (depth>0){
                        arg+=i;
                    }
                    break;
                default:
                    if (depth>1){
                        arg+=i;
                    }else{
                        if (i==","){
                            args.push(arg);
                            arg="";
                        }else{
                            arg+=i;
                        }
                    }
            }
        }
        if (arg.length!=0){
            args.push(arg);
        }
        return args
    }
    data(){
        let funcelems = this.split()
        let funcname = funcelems[0];
        let funcargs = funcelems[1];
        funcname = this.check_funcname(funcname)
        return [funcname,...this.split_args(funcargs)]
    }
}

class brackets{
    constructor(bracketscode){
        this.code = bracketscode;
    }
    __inner_content(code){
        let depth = 0;
        let rlist = [];
        for (const i of code){
            switch(i){
                case "(":
                    if(depth>0){
                        rlist.push(i);
                    }
                    depth++;
                    break;
                case ")":
                    depth--;
                    if (depth>0){
                        rlist.push(i);
                    }
                    break;
                default:
                    if (depth>0){
                        rlist.push(i)
                    }
            }
        }
        let rtext = rlist.join("");
        let element=new elem(rtext);
        return (element.elemtype() ===Elem_type.BRACKETS?this.__inner_content(rtext):rtext);
    }
    inner(){
        return this.__inner_content(this.code);
    }
}

class value{
    constructor(code){
        this.code = this.check_funcname(code);
        if (this.code.includes(" ")){
            //throw new Error("変数内にスペースを入れてはいけません")
        }
    }
    check_funcname(text){
        if (text[0]==" "){
            return this.check_funcname(text.slice(1));
        }
        if (text[text.length-1]==" "){
            return this.check_funcname(text.slice(0,-1));
        }
        return text;
    }
    inner(){
        return this.code;
    }
}

class elem{
    constructor(code){
        this.availablechars = [
            ...[...Array(26)].map((_, i) => i).map(a => String.fromCodePoint(a + 65)),
            ...[...Array(26)].map((_, i) => i).map(a => String.fromCodePoint(a + 97)),
            ...[...Array(10)].map((_, i) => i).map(a => a.toString())
        ];
        this.code = code;
    }
    __is_FUNCTION(code){
        let index = [...code].findIndex((char)=>char=="(");
        if (index<0){
            return false;
        }else{
            let funcname = code.slice(0,index);
            let funcargs = code.slice(index);
            if(this.__is_BRACKETS(funcargs)){
                return true;
            }else{
                return false;
            }
        }
    }
    __is_BRACKETS(code){
        let group = []
        let depth = 0
        for (const i of code){
            switch (i){
                case "(":
                    depth++;
                    group.push(depth>0)
                    break;
                case ")":
                    group.push(depth>0)
                    depth--;
                    break;
                case " ":break;
                default:
                    group.push(depth>0)
            }
        }
        return group.every(a => a===true);
    }
    __is_NUMBER(code){
        let group = [];
        let nums = [...Array(10)].map((_,i)=>i).map(i=>i.toString());
        for (const i of code){
            if (nums.includes(i)){
                group.push(i)
            }else if (i=="."){
                if (group.length!=0){
                    group.push(i)
                }else{
                    throw new Error("小数点、先頭についてますよ！♡");
                }
            }else{
                return false;
            }
        }
        return true;
    }

    __is__OPERATION(code){
        let opelist = ["+", "-", "*", "/", "%", "^", "@"];
        for (const i of opelist){
            if (i===code){
                return true;
            }
        }
        return false;
    }
    __is_VALUE(code){
        for (const i of code){
            if (this.availablechars.includes(i)){
                //pass
            }else if (i==" "){
                //pass
            }else{
                return false;
            }
        }
        return true;
    }
    __is_FORMULA(code){
        let depth = 0
        let opelist = ["+", "-", "*", "/", "%", "^", "@"];
        for (const i of code){
            switch(i){
                case "(":
                    depth++;
                    break;
                case ")":
                    depth--;
                    break;
                default:
                    if (depth>0){
                        //pass
                    }else{
                        if (opelist.includes(i)){
                            return true;
                        }
                    }
            }
        }
        return false;
    }
    elemtype(){
        if (this.__is__OPERATION(this.code)){
            return Elem_type.OPERATION;
        }
        else if (this.__is_NUMBER(this.code)){
            return Elem_type.NUMBER;
        }
        else if (this.__is_BRACKETS(this.code)){
            return Elem_type.BRACKETS;
        }
        else if (this.__is_FORMULA(this.code)){
            return Elem_type.FORMULA;
        }
        else if (this.__is_FUNCTION(this.code)){
            return Elem_type.FUNCTION;
        }
        else if (this.__is_VALUE(this.code)){
            return Elem_type.VALUE;
        }else{
            return Elem_type.OTHER
        }
    }
}

class parser{
    
    constructor(code){
        this.code = code;
        this.availablechars = [
            ...[...Array(26)].map((_, i) => i).map(a => String.fromCodePoint(a + 65)),
            ...[...Array(26)].map((_, i) => i).map(a => String.fromCodePoint(a + 97)),
            ...[...Array(10)].map((_, i) => i).map(a => a.toString())
        ];
    }

    grouping_numbers(vec){
        let rlist = [];
        let group = [];
        let flag = false;
        for (const i of vec){
            if (this.availablechars.includes(i)){
                group.push(i);
                flag=true;
            }else{
                if (flag){
                    rlist.push(group.join(""));
                    group=[];
                    flag = false;
                }
                rlist.push(i);
            }
        }
        if (flag){
            rlist.push(group.join(""));
        }
        return rlist;
    }

    grouping_brackets(vec){
        let rlist = [];
        let group = [];
        let depth = 0;
        let flag = false;
        for (const i of vec){
            switch (i){
                case "(":
                    if (depth>0){
                        group.push(i);
                    }else if (depth==0){
                        group.push(i);
                        flag = true;
                    }else{
                        throw new Error('括弧を閉じ忘れている可能性があります');
                    }
                    depth++;
                    break;
                case ")":
                    depth--;
                    if (depth>0){
                        group.push(i);
                    }else if (depth==0){
                        group.push(i);
                        rlist.push(group.join(""));
                        group = [];
                        flag = false;
                    }else{
                        throw new Error('括弧を開き過ぎている可能性があります');
                    }
                    break;
                default:
                    if (flag){
                        group.push(i);
                    }else{
                        rlist.push(i);
                    }
            }
        }
        return rlist;
    }

    split_symbol(vec){
        let rlist = [];
        let group = [];
        for (const i of vec){
            switch (i){
                case "+":
                case "-":
                case "*":
                case "/":
                case "%":
                case "@":
                case "^":
                    if (group.length!=0){
                        rlist.push(group.join(""));
                        group = [];
                    }
                    rlist.push(i);
                    break;
                default:
                    group.push(i);
            }
        }
        if (group!=0){
            rlist.push(group.join(""))
        }
        return rlist;
    }

    code2vec(){
        let vec = this.grouping_numbers(this.code);
        vec = this.grouping_brackets(vec);
        vec = this.split_symbol(vec);
        return vec;
    }

    isFormula(code){
        let element = new elem(code);
        return element.elemtype() === Elem_type.FORMULA;
    }

    resolve_operation(code){
        const par = new parser(code);
        const vec = par.code2vec();
        const index = this.priority(vec);
        if (index===null){
            return code;
        }
        const e1=vec.slice(0,index).join("");
        const ope=vec[index];
        const e2=vec.slice(index+1).join("");
        return [
            ope,
            this.resolve_util(e1),
            this.resolve_util(e2)
        ]
    }
    resolve_util(E){
        /*
        python内包表記より
        */
        let element = new elem(E);
        let type = element.elemtype();
        if (this.isFormula(E)){
            return this.resolve_operation(E);
        }else if (type===Elem_type.BRACKETS){
            let bra = new brackets(E)
            return this.resolve_operation(bra.inner())
        }else if (type===Elem_type.FUNCTION){
            return this.resolve_function(E);
        }else if (type===Elem_type.VALUE){
            let val = new value(E);
            return val.inner();
        }else{
            return E;
        }
    }

    resolve_function(code){
        let fun = new func(code);
        let funcdata = fun.data();
        let funcname = funcdata[0];
        return [
            funcname,
            ...funcdata.slice(1).map(
                i=>this.resolve_util(i)
            )
        ];
    }

    resolve(){
        return this.resolve_util(this.code);
    }
    
    priority(vec){
        let rankinglist={
            "+":1,"-":1,
            "*":2,"/":2,"%":2,"@":2,
            "^":3
        }
        let rank = 3;
        let index = null;
        for (const i in vec){
            const j = vec[i];
            if (Object.keys(rankinglist).includes(j)){
                if (rank>rankinglist[j]){
                    rank = rankinglist[j];
                    index = i; 
                }else if (rank==rankinglist[j]){
                    rank = rankinglist[j]
                    index=i
                }else{
                    //pass
                }
            }else{
                //pass
            }
        }
        if (index==null){
            return null
        }
        else{
            return Number(index);
        }
    }
}


class calcVM{
    constructor(resolved_data){
        this.resolved_data = resolved_data;
        this.constants={
            "pi":Math.PI,
            "e":Math.E,
        };
    }
    run(){
        return this.step(this.resolved_data);
    }
    step(arr){
        if (!Array.isArray(arr)){
            return this.constants2value(arr);
        }
        let funcname = arr[0];
        let args = arr.slice(1);
        //引数の前処理
        args = args.map((i)=>this.constants2value(i));
        args = args.map((i)=>Number(i));
        return this.functions(funcname,args);
    }
    constants2value(text){
        //再帰
        if (Array.isArray(text)){
            return this.step(text);
        }
        let element = new elem(text);
        if (element.elemtype()==Elem_type.NUMBER){
            return text;
        }else{
            let rtext = this.constants[text];
            if (rtext===undefined){
                throw new Error(`${text}は定数として定義されていません`);
            }
            return rtext;
        }
    }
    functions(funcname,args){
        switch (funcname){
            case "+":
                return args[0]+args[1];
            case "-":
                if (args==''){
                    return -1*args[1];
                }else{
                    return args[0]-args[1];
                }
            case "*":
                return args[0]*args[1];
            case "/":
                return args[0]/args[1];
            case "%":
                return args[0]%args[1];
            case "^":
                return args[0]**args[1];
            case "sqrt":
                return Math.sqrt(args[0]);
            case "sin":
                return Math.sin(args[0]);
            case "cos":
                return Math.cos(args[0]);
            case "tan":
                return Math.tan(args[0]);
            case "log":
                return Math.log(args[0]);
            case "log10":
                return Math.log10(args[0]);
            case "pow":
                return Math.pow(args[0],args[1]);
            case "floor":
                return Math.floor(args[0]);
            case "ceil":
                return Math.ceil(args[0]);
            case "random":
                return Math.random();
            case "randint":
                let min = Math.ceil(args[0]);
                let max = Math.floor(args[1]);
                return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
            default:
                throw new Error(`指定された関数は${funcname}見つかりませんでした`)
        }
    }

}

function main(){
    let texts = [
        //"he llo(10,10)",
        "f((0,1"
    ]

    //for (const i of texts){
    //    let par = new parser(i);
    //    //console.log(JSON.stringify(par.resolve()));
    //    console.log(par.resolve());
    //}
    //FUNCTION : 0,
    //OPERATION: 1,
    //NUMBER   : 2,
    //BRACKETS : 3,
    //OTHER    : 4,
    //VALUE    : 5,
    //FORMULA  : 6
    for (const i of texts){
        let par = new parser(i);
        console.log(JSON.stringify(par.resolve()));
        try{
            let cvm = new calcVM(par.resolve());
            console.log(cvm.run());
        }catch (e){
            console.log(e)
        }
    }
    //let cvm = new calcVM(par.resolve());
    //console.log(cvm.run());
}

main()