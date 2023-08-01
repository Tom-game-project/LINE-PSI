"""

"""



from enum import Enum,auto

class func:
    def __init__(self,funccode:str):
        self.code:str=funccode
        funcname, funcargs=self.split()
        self.funcname=self.check_funcname(funcname)
        if " " in self.funcname:
            raise BaseException("関数名に半角スペースを入れないでください")
        self.funcargs=self.split_args(funcargs)
    @classmethod
    def new(cls,code:str):return func(code)
    def check_funcname(self,text:str)->str:
        #funcname内の文字列がすべて有効かどうかを調べる関数
        if text[0]==" ":#半角スペースが文字列の前に入っていた場合
            return self.check_funcname(text[1:])
        if text[-1]==" ":
            return self.check_funcname(text[:-1])
        return text

    def split(self)->tuple[str,str]:
        index = self.code.find("(")
        if index<0:
            raise BaseException("引数部分の文法が不正だと思われます。おそらく")
        else:
            funcname:str = self.code[:index]
            funcargs:str = self.code[index:]
        return funcname,funcargs
    def split_args(self,funcargs):
        #引数を抽出する
        depth:int=0
        args:list[str]=[]
        arg:str=""
        for i in funcargs:
            match i:
                case "(":
                    if depth>0:
                        arg+=i
                    depth+=1
                case ")":
                    depth-=1
                    if depth>0:
                        arg+=i
                case _:
                    if depth>1:
                        arg+=i
                    else:
                        if i==",":
                            args.append(arg)
                            arg=""
                        else:
                            arg+=i
        if arg:
            args.append(arg)
        return args
    @property
    def data(self):
        funcname,funcargs = self.split()
        funcname = self.check_funcname(funcname)
        return [funcname]+self.split_args(funcargs)
    def __repr__(self) -> str:
        return f"name:'{self.funcname}'\nargs:{self.funcargs}"

class brackets:
    def __init__(self,bracketscode:str):
        self.code:str=bracketscode
    @classmethod
    def new(cls,code):return brackets(code)

    def __inner_content(self,code:str):
        depth:int=0
        rlist:list[str]=[]
        for i in code:
            match i:
                case "(":
                    if depth>0:rlist.append(i)
                    depth+=1
                case ")":
                    depth-=1
                    if depth>0:rlist.append(i)
                case _:
                    if depth>0:rlist.append(i)
        rtext = "".join(rlist)
        return self.__inner_content(rtext) if elem.new(rtext).elemtype is Elem_type.BRACKETS else rtext
    @property
    def inner(self)->str:
        return self.__inner_content(self.code)

class value:
    def __init__(self,code:str):
        self.code:str=self.check_valuename(code)
        if " " in self.code:
            raise BaseException("半角スペースが入っています")
    @classmethod
    def new(cls,code:str):return value(code)
    def check_valuename(self,valuename:str)->str:
        if valuename[0]==" ":
            return self.check_valuename(valuename[1:])
        if valuename[-1]==" ":
            return self.check_valuename(valuename[:-1])
        return valuename
    @property
    def inner(self):
        return self.code

class Elem_type(Enum):
    #type of elem
    FUNCTION  = auto()
    OPERATION = auto()
    NUMBER    = auto()
    BRACKETS  = auto()
    OTHER     = auto()
    VALUE     = auto()
    FORMULA   = auto()

class elem:
    #式のelement
    def __init__(self,code):
        """

        """
        self.availablechars:list[str]=[
                chr(i) for i in range(65,65+26)#A~Z
        ]+[
                chr(i) for i in range(97,97+26)#a~z
        ]+[
                str(i) for i in range(10)      #0~9
        ]
        self.code=code
    @classmethod
    def new(cls,code):return elem(code)

    #bool
    def __is_FUNCTION(self,code:str)->bool:#工事中
        index = code.find("(")
        if index<0:
            return False
        else:
            funcname:str = code[:index]
            funcargs:str = code[index:]
            #本当はここに関数名が正しく設定されているかを確認する関数を作成したい
            if self.__is_BRACKETS(funcargs):
                return True
            else:
                return False
    def __is_BRACKETS(self,code:str)->bool:
        group:list[bool]=[]
        depth:int=0
        for i in code:
            match i:
                case "(":
                    depth+=1
                    group.append(depth>0)
                case ")":
                    group.append(depth>0)
                    depth-=1
                case " ":
                    pass
                case _:
                    group.append(depth>0)
        return all(group)
    def __is_NUMBER(self,code:str)->bool:
        #⚠️少数点の場合も含む
        #アンダースコアは許容しない(とりあえずは。。。)
        group:list[str]=[]
        nums:list[str]=list(map(str,range(10)))#1~10の数字のリスト
        for i in code:
            if i in nums:
                group.append(i)
            elif i==".":
                if group:
                    group.append(i)
                else:
                    raise BaseException("小数点が先頭についてしまっていますよ")
            else:
                return False

        return True
    def __is_OPERATION(self,code:str)->bool:
        opelist:list[str] = ["+","-","*","/","%","^","@"]
        for i in opelist:
            if i==code:
                return True
        return False
    def __is_VALUE(self,code:str)->bool:
        for i in code:
            if i in self.availablechars:
                pass
            elif i==" ":
                pass
            else:
                return False
        return True
    def __is_FORMULA(self,code:str)->bool:
        depth:int=0
        for i in code:
            match i:
                case "(":
                    depth+=1
                case ")":
                    depth-=1
                case _:
                    if depth>0:
                        pass
                    else:
                        if i in ["+","-","*","/","%","^","@"]:
                            return True
        return False

    @property
    def elemtype(self)->Elem_type:
        if self.__is_OPERATION(self.code):
            return Elem_type.OPERATION
        elif self.__is_NUMBER(self.code):
            return Elem_type.NUMBER
        elif self.__is_BRACKETS(self.code):
            return Elem_type.BRACKETS
        elif self.__is_FORMULA(self.code):
            return Elem_type.FORMULA
        elif self.__is_FUNCTION(self.code):
            return Elem_type.FUNCTION
        elif self.__is_VALUE(self.code):
            return Elem_type.VALUE
        else:
            return Elem_type.OTHER

class parser:
    def __init__(self,code:str):
        self.code:str=code
        self.availablechars:list[str]=[
                chr(i) for i in range(65,65+26)#A~Z
        ]+[
                chr(i) for i in range(97,97+26)#a~z
        ]+[
                str(i) for i in range(10)      #0~9
        ]
    def grouping_number(self,vec:str)->list[str]:
        #numberをまとめる
        rlist:list[str]=list()
        group:list[str]=list()
        flag:bool=False
        for i in vec:
            if i in self.availablechars:
                group.append(i)
                flag=True
            else:
                if flag:
                    rlist.append("".join(group))
                    group=[]
                    flag=False
                rlist.append(i)
        if flag:
            rlist.append("".join(group))
        return rlist
    def grouping_brackets(self,vec:list[str])->list[str]:
        #functionをまとめる
        rlist:list[str]=list()
        group:list[str]=list()
        depth:int=0
        flag:bool=False
        for i in vec:
            match i:
                case "(":
                    if depth>0:
                        group.append(i)
                    elif depth==0:
                        group.append(i)
                        flag=True
                    else:
                        raise BaseException("括弧を閉じ忘れている可能性があります")
                    depth+=1
                case ")":
                    depth-=1
                    if depth>0:
                        group.append(i)
                    elif depth==0:
                        group.append(i)
                        rlist.append("".join(group))
                        group=[]
                        flag=False
                    else:
                        raise BaseException("括弧を開き過ぎている可能性があります")
                case _:
                    if flag:
                        group.append(i)
                    else:
                        rlist.append(i)

        return rlist
    def split_symbol(self,vec:list[str])->list[str]:
        rlist:list[str]=list()
        group:list[str]=list()
        for i in vec:
            match i:
                case "+"|"-"|"*"|"/"|"%"|"@"|"^":
                    if group:#groupがからでなければ
                        rlist.append("".join(group))
                        group=list()
                    rlist.append(i)
                case _:
                    group.append(i)
        if group:
            rlist.append("".join(group))
        return rlist
    def code2vec(self)->list[str]:
        vec=self.grouping_number(self.code)
        vec=self.grouping_brackets(vec)
        vec=self.split_symbol(vec)
        return vec

    def is_Formula(self,code:str)->bool:
        return elem.new(code).elemtype is Elem_type.FORMULA
    def resolve_operation(self,code:str):
        #逆ポーランド記法の返り値
        #引数が二つであると決定した
        par = parser(code)
        vec = par.code2vec()
        index = self.priority(vec)
        if index is None:
            return code
        E1:str= "".join(vec[:index])
        ope = vec[index]
        E2:str= "".join(vec[index+1:])
        #return [ ope, *self.resolve_util(E1), *self.resolve_util(E2)]
        return formula_tree(
                ope,
                Elem_type.OPERATION,
                [*self.resolve_util(E1),*self.resolve_util(E2)]
            )
    def resolve_util(self,E):
        return self.resolve_operation(E)\
            if self.is_Formula(E) else self.resolve_operation(brackets.new(E).inner)\
            if elem.new(E).elemtype is Elem_type.BRACKETS else self.resolve_function(E)\
            if elem.new(E).elemtype is Elem_type.FUNCTION else value.new(E).inner\
            if elem.new(E).elemtype is Elem_type.VALUE else E,#カンマとるなよ絶対に！
    def resolve_function(self,code:str):
        funcdata = func.new(code).data
        funcname=funcdata[0]
        #return [funcname]+[self.resolve_util(i)[0] for i in funcdata[1:]]
        return formula_tree(
            funcname,
            Elem_type.FUNCTION,
            [self.resolve_util(i)[0] for i in funcdata[1:]]
        )

    def resolve(self):
        return self.resolve_util(self.code)
    def priority(self,vec:list[str])->int|None:
        #配列内にある最も優先順位が低い演算子を探します
        #返り値はindexです
        """
        実装されている計算規則
        rankの数字が低いものほど計算順位も低い
        同一のランクが並列に続く場合、式の右に行く程計算順位が低い
        """
        rankinglist:dict={
            #演算子優先順位
            "+":1,"-":1,
            "*":2,"/":2,"%":2,"@":2,
            "^":3
        }
        rank:int=3
        index=None
        for i,j in enumerate(vec):
            if j in rankinglist.keys():
                if rank>rankinglist[j]:
                    rank=rankinglist[j]
                    index=i
                elif rank==rankinglist[j]:
                    #右に計算順位が同じ演算子を見つけた場合
                    #右にあるものの方が計算順位が低い
                    rank=rankinglist[j]
                    index=i
                else:
                    pass
            else:
                pass
        #最も計算順位が1番低いindexを返す
        return index

class formula_tree:
    def __init__(self,name:str,type_:Elem_type,args:list):
        self.name:str=self.ope2func(name)
        self.args:list=args
        self.selftype:Elem_type=type_
    def ope2func(self,name:str)->str:
        """
        演算子を関数のように見る
        """
        match name:
            case "+":
                return "+"
            case "-":
                return "-"
            case "*":
                return "*"
            case "/":
                return "/"
            case "%":
                return "%"
            case "@":
                return "@"
            case _:
                return name
    def __getitem__(self,key):
        return self.args[key]
    def __repr__(self):
        return f"{self.name}{self.args}"


if __name__=="__main__":
    """texts=[
    " 10 + ( x + log10(2) * sin(x) ) * log10(x)",
    "(-sin(x)*3)+(-2*cos(x))",
    "pi",
    "sin(x)",
    "(1)+2",
    "3.14",
    "-8+6"
    ]
    """
    texts = [
        "main(a,b,c)"
    ]
    for i in texts:
        par=parser(i)
        print(par.resolve()[0])
    el = elem("-sin(x)")
    print(el.elemtype)
    #print(
    #    elem.new(" sin(x) ").elemtype
    #)


"""
fn f(){
    return g()
}
fn g():
    return f()
"""