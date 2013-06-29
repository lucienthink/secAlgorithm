var fun = require('./fun');

(function makeD(){
	while(1){
		console.log('请输入素数p(仅限数字)：');
		var p = parseInt(fun.read());
		console.log('请输入素数q(仅限数字)：');
		var q = parseInt(fun.read());
		var On = (p-1)*(q-1);
		while(1){
			console.log('请输入e(仅限数字)：');
			var e = parseInt(fun.read());
			if((e>1)&&(e<On)) break;
			else console.log('e必须大于1小于(p-1)*(q-1)');
		}
		for(var i = 1; i < On ; i++) {
			if((i*e)%On == 1){
				var d = i;
				break;
			}
		}
		console.log('已知p='+p+'，q='+q+'，e='+e+'，求得d='+d);
		while(1){
			console.log('1:继续; Ctrl+C:退出');
			if(fun.read() == 1) break;
		}
		
	}
})();