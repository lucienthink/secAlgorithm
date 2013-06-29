var fun = require('./fun');
var Caesar = {
    encrypt : function (){
        console.log('请输入明文：');
        var str = fun.read();
        var c = str.split('');
        console.log('请输入密钥(仅限数字)：');
        var k = parseInt(fun.read());
        var len=c.length;
        for (var i=0; i<len; i++)
        {
            c[i] = fun.numToChar[fun.charToNum[c[i]]+k];
        }
        var str = c.join('');
        console.log(str);
    }

    ,decrypt : function (){
        console.log('请输入密文：');
        var str = fun.read();
        var c = str.split('');
        console.log('请输入密钥(仅限数字)：');
        var k = parseInt(fun.read());
        var len=c.length;
        for (var i=0; i<len; i++)
        {
            c[i] = fun.numToChar[fun.charToNum[c[i]]-k];
        }
        var str = c.join('');
        console.log(str);
    }
    ,_init : function (){
        while(1){
            console.log('请选择方式：1：加密; 2：解密');
            var type = parseInt(fun.read());
            if(type == 1)
                this.encrypt();
            else
                this.decrypt();
            while(1){
                console.log('1:继续; Ctrl+C:退出');
                if(fun.read() == 1) break;
            }
        }
    }
}
Caesar._init();