var fun = require('./fun');

var Rsa = {
	//生成p，q
	makePQ : function (){
		//生成100以内的素数表
		var arr = [];
		arr[0] = arr[1] = 1;
		for (var i = 2; i*i < 100; i++) {
			for (var j = 2; i*j < 100; j++) {
				arr[i*j] = i;
			};
		};
		while(1){
			var p = Math.floor(Math.random()*100);
			if (!arr[p]) break;
		}
		while(1){
			var q = Math.floor(Math.random()*100);
			if((!arr[q]) && (q != p)) break;
		}
		arr = [];
		arr = [p,q];
		return arr;
	}
	//生成e,d
	,makeED : function (n,on){
		var e, d;
		for (var i = 2; i < on; i++) {
			var flag = 0;
			e = i;
			tem = on;
			while(tem%e){
				if(tem%e == 1) {
					flag = 1;
					break;
				}
				tem=e;
	    		e=tem%e;
			}
			if (flag == 1) break;
		}
		for (var i=0; i<n; i++)
	    {
	        if ((i*e%on)==1)
	        {
	           d=i;
	           break;
	        }
	    }
	    var arr = [];
	    arr[0] = e;
	    arr[1] = d;
	    return arr;
	}
	//rsa加密，使用快速模幂算法
	,encrypt : function (e,n,M){
	    var d=1
	    ,c=0
	    ,flag=0
	    ,p = []; 
	    //初始化二进制
	    for (var i=0; i<14; i++)
	    {
	        p[i]=-1;
	    }
	    i=0;
	    var tem = e;
	    while(Math.floor(tem/2))
	    {
	        p[i]=tem%2;
	        tem=Math.floor(tem/2);
	        i++;
	    }
	    p[i]=1;
	    for (var i=0; i<14; i++)
	    {
	        if(p[i]==-1)
	            flag=i-1;
	    }
	    for(var i=flag;i>=0;i--)
	    {
	        c=2*c;
	        d=(d*d)%n;
	        if(p[i]==1)
	        {
	            c=c++;
	            d=(d*M)%n;
	        }
	    }
	    return d;
	}

	,_init : function (){
		var arr = this.makePQ(),
		p = arr[0],
		q = arr[1],
		n = p*q,
		on = (p-1)*(q-1);
		console.log('生成的p，q为：'+p+'，'+q);

		var arr = this.makeED(n,on),
		e = arr[0],
		d = arr[1];
		console.log('生成的公PU为：{'+e+','+n+'}，私钥PR为{'+d+','+n+'}');

		while(1){
			console.log('请选择 1:加密; 2:解密; Ctrl+C:退出');
			var type = parseInt(fun.read());
			if(type == 1){
				while(1){
					console.log('请输入明文(仅限数字)：');
					var M = fun.read();
					if(M>=0 && M<n) break;
					else console.log('明文应大于0小于'+n); 
				}
				var C = this.encrypt(e,n,M);
				console.log('密文为：'+C);
			}
			else if(type == 2){
				while(1){
					console.log('请输入密文(仅限数字)：');
					var C = fun.read();
					if(C>=0 && C<n) break;
					else console.log('密文应大于0小于'+n); 
				}
				var M = this.encrypt(d,n,C);
				console.log('明文为：'+M);
			}
		}
	}
}
Rsa._init();