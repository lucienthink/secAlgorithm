var fun = require('./fun');

var Des = {
	//数字转二进制
	byteToBit : function(source){
		var k = 0, j = 0, tmp, destination = [];
		while(source[j])
		{
			//console.log(source[j]);
			tmp = source[j];
			for(var i = 7;i >= 0;i--)
			{
				destination[8*k+i] = tmp%2;
				tmp = Math.floor(tmp/2);
			}
			j++;
			k++;
		}
		return destination;
	}
	//二进制转数字
	,bitToByte : function (source)
	{
		var tmp = 0,
		i = 0,k = 0,j = 0,
	    count = 64,
	    destination = [];
		while(count--)
		{	
			k++;
			if(source[j] == 1)
			{
				tmp *= 2;
				tmp += 1;
			}
			else
			{
				tmp *= 2;
			}
			if(k%8 == 0)
			{
				destination[i++] = tmp;
				tmp = 0;
			}
			j++;
		}
	    //destination[i]='\0';
	    return destination;
	}

	//生成16组子密钥
	,get_Ki : function (keyBit)
	{
		var Ci = [],Di = [], tmp, tmp1, Ki = [];
		
		//PC_1变换
	    ////置换选择1 pc-1
	    //左边置换 28 c  右边置换 28 d
		for(var i = 0; i < 28; i++)
		{
			Ci[i]=keyBit[fun.PC_1[i]];
			//console.log(keyBit[i]);
		}
		for(var i = 28; i < 56; i++)
		{
			Di[i-28]=keyBit[fun.PC_1[i]];
		}

		for(var loopCount = 0; loopCount < 16; loopCount++) //循环16次，得到16个子密钥
		{
	      var num=0;
	      if(loopCount == 0 || loopCount == 1 || loopCount == 8 || loopCount == 15)  //这些次数转移一位
	           num = 1;
	      else num = 2;
	          if(num == 1)  //移一位
	            {
			     	//Ci左移一位
			     	tmp = Ci[0];
			     	for(var copyCount = 0;copyCount < 27;copyCount++)
			     	{
			     		Ci[copyCount] = Ci[copyCount+1];
			     	}
			     	Ci[27]=tmp;
		
			     	//Di左移一位
			     	tmp=Di[0];
			     	for(var copyCount = 0;copyCount < 27;copyCount++)
			     	{
			     		Di[copyCount] = Di[copyCount+1];
			     	}
			     	Di[27] = tmp;
			    }
	          else //移两位
	            {
			     	//Ci左移两位
			     	tmp = Ci[0];
			     	tmp1 = Ci[1];
			     	for(var copyCount = 0;copyCount < 27;copyCount+=2)
			     	{
	                  if(copyCount==26) 
	                    {
	                        Ci[copyCount] = tmp;
	                    }
	                  else
	                      Ci[copyCount] = Ci[copyCount+2];
			     	}
			     	Ci[27] = tmp1;
		
			     	//Di左移两位
			     	tmp = Di[0];
			     	tmp1 = Di[1];
			     	for(var copyCount = 0;copyCount < 27;copyCount+=2)
			     	{
	                  if(copyCount==26) 
	                    {
	                        Di[copyCount] = tmp;
	                    }
	                  else
			     		Di[copyCount] = Di[copyCount+2];
			     	}
			     	Di[27] = tmp1;
	            
	            }
	        //}
			
			//PC_2变换，得到子密钥Ki
	        //置换选择2 48位
	        //console.log(loopCount);
	        Ki[loopCount] = [];
			for(var j = 0; j < 48;  j ++)
			{
				tmp = fun.PC_2[j];
				if(tmp <= 27)
				{
					Ki[loopCount][j] = Ci[tmp];
				}
				else
				{
					Ki[loopCount][j] = Di[tmp-28];
				}
				//console.log(Ci[tmp],Di[tmp-28]);
			}
		}
		return Ki;
	}

	//加密函数
	,des : function (plaintextBit, Ki)
	{
		var firstReverseResult = [];
		var iterateResulst = [];
		var L0 = [], R0 = [];

		//对明文进行第一次IP置换
		var firstReverseResult = this.firstReverse(plaintextBit);  

		//明文分成左右两段 作为函数的输入
		for(var i = 0;i < 32;i++)
		{
			L0[i] = firstReverseResult[i];
		}
		for(var i = 32;i < 64;i++)
		{
			R0[i-32] = firstReverseResult[i];
		}

		//十六轮迭代
		var arr = this.iterate(L0,R0,Ki);
		L0 = arr[0];
		R0 = arr[1];
	    //32位左右互换
		for(var i = 0;i < 32;i++)
		{
			iterateResulst[i] = R0[i];
		}
		for(var i = 32;i < 64;i++)
		{
			iterateResulst[i] = L0[i-32];
		}

		//进行最后一次逆置换
		var ciphertextBit = this.finalReverse(iterateResulst);
		return ciphertextBit;
	}

	//对明文进行初始IP置换
	,firstReverse : function (plaintextBit)
	{
		var firstReverseResult = [];
		for(var i = 0;i < 64;i++)
		{
			firstReverseResult[i] = plaintextBit[fun.firstIP[i]];
		}
		return firstReverseResult;
	}

	/*利用十六组48位的子密钥对64位的明文二进制数进行十六轮的迭代*/
	// first 对右边32进行F函数运算
	// second 左右两边亦或
	// 看下课本P54，详细说了R（n） L（n）之间关系
	,iterate : function (L0, R0, Ki)
	{
		var FResult = [], res = [];
		var L1 = [],R1 = [],tmp = [];

			//循环进行16次迭代
		for(var loopCount = 0;loopCount < 16;loopCount++)
		{
			//Rn = L(n-1) + F(R(n-1),Kn) 		
	        //F函数
			FResult = this.F(R0,Ki[loopCount]);
			for(var i = 0;i < 32;i++)
			{
				if(L0[i]==FResult[i])
					R1[i] = 0;
				else
					R1[i] = 1;
			}

			//Ln = R(n-1) 
			for(var i = 0;i < 32;i++)
			{
				L1[i] = R0[i];
			}

			//当前得到的L1、R1放到L0、R0中，供下次循环使用
			for(var i = 0;i < 32;i++)
			{
				L0[i] = L1[i];
			}
			for(var i = 0;i < 32;i++)
			{
				R0[i] = R1[i];
			}
		}
		res[0] = L0;
		res[1] = R0;
		return res;
	}

	//  F函数  
	,F : function (R0, Ki)
	{
		var EBoxResult = [];
		var SBoxResult = [];
		var XORResult = [];
		var x = 0,y = 0,tmp, FResult = [];
		
		//first step 利用E盒进行扩展置换
		for(var i = 0;i < 48;i++)
		{
			EBoxResult[i] = R0[fun.E[i]];
		}

		//second step E盒结果与Ki进行异或运算
		for(var i = 0;i < 48;i++)
		{
			if(EBoxResult[i]==Ki[i])
			{
				XORResult[i] = 0;
			}
			else
			{
				XORResult[i] = 1;
			}
		}
	    //third step S盒运算
		for(var i = 0;i < 8;i++) //i表示第i个盒 输入为6位，8个盒子 6x8
		{
			x = 0;
			y = 0;

			if(XORResult[6*i] == 1) x += 2;  //取头尾两个数组成一个二进制
			if(XORResult[6*i+5] == 1) x += 1;
			if(XORResult[6*i+1] == 1) y += 8;//取中间4位为一个二进制，
			if(XORResult[6*i+2] == 1) y += 4;
			if(XORResult[6*i+3] == 1) y += 2;
			if(XORResult[6*i+4] == 1) y += 1;
			
			tmp = fun.S[i][x][y];             //取得s盒中行列所表示的值
			
			for(var j = 3;j >= 0;j--)       //s盒中最大值为15,转化为二进制，为4位
			{
				SBoxResult[4*i+j] = tmp%2;
				tmp=Math.floor(tmp/2);
			}

		}	
	        //firth step P置换
			//单纯置换
			for(var i = 0;i < 32;i++)
			{
				FResult[i] = SBoxResult[fun.P[i]];
			}
		return FResult;
	}

	/*对迭代的结果进行最后的逆置换*/
	,finalReverse : function (iterateResulst)
	{
		var ciphertextBit = [];
		for(var i = 0;i < 64;i++)
		{
			ciphertextBit[i] = iterateResulst[fun.lastIP[i]];
		}
		return ciphertextBit;
	}



	//加密操作
	,encrypt : function (){
		console.log("请输入明文(8个字符):");
		plaintextByte = fun.read().split('');
		console.log("请输入密钥(不多于8个字符):");
		keyByte = fun.read().split('');
		for (var i = 0; i < 8; i++) {
			plaintextByte[i] = fun.charToNum[plaintextByte[i]];
			keyByte[i] = fun.charToNum[keyByte[i]];
		};
		
		keyBit = this.byteToBit(keyByte);
		//for (var i = 0; i < keyBit.length; i++) {
		//	console.log(keyBit[i]);
		//};
		//console.log(keyBit[0]);				//8个字符密码转换成64位二进制形式
		Ki = this.get_Ki(keyBit);				//求16组48位子密钥
		//for (var i = 0; i < Ki.length; i++) {
			//console.log(Ki[i]);
		//};
		plaintextBit = this.byteToBit(plaintextByte);	//8个字符明文转换成64位二进制形式
		ciphertextBit = this.des(plaintextBit,Ki);		//利用16组48位的子密钥对64位二进制的明文进行加密
		ciphertextByte = this.bitToByte(ciphertextBit);
		for (var j = 0; j < 8; j++) {
			//console.log(ciphertextByte[i] );
			ciphertextByte[j] = fun.numToChar[(ciphertextByte[j]%52)?ciphertextByte[j]%52:52];

		};
		console.log("加密后的密文为："+ciphertextByte.join(''));
	    //console.log(ciphertextByte);
	}

	//解密
	,decrypt: function (){
		//Ki[0]~Ki[15]十六个子密钥调换顺序 使之顺序相反
		for(var i = 0;i < 8;i++)
		{
			var tmp = [];
			for(var j = 0;j < 48;j++)
			{
				tmp[j] = Ki[i][j];
			}
			for(j = 0;j < 48;j++)
			{
				Ki[i][j] = Ki[15-i][j];
			}
			for(j = 0;j < 48;j++)
			{
				Ki[15-i][j] = tmp[j];
			}
		}
		//for (var i = 0; i < Ki.length; i++) {
			//console.log(Ki[i]);
		//};
		//for (var i = 0; i < 8; i++) {
		//	ciphertextByte[i] = fun.charToNum[ciphertextByte[i]];
		//};
		deResultBit = this.des(ciphertextBit,Ki);//解密
		deResultByte = this.bitToByte(deResultBit);
		for (var j = 0; j < 8; j++) {
			//console.log(deResultByte[j]);
			deResultByte[j] = fun.numToChar[(deResultByte[j]%52)?deResultByte[j]%52:52];
		};
		console.log("解密得到的明文："+deResultByte.join(''));
	}
	,_init : function (){
		var plaintextByte,plaintextBit;	//明文字符及二进制格式
		var ciphertextByte,ciphertextBit;		//密文字符及二进制格式
		var keyByte,keyBit;				//密钥字符及二进制格式
		var Ki;							//16组48位的子密钥
		var deResultByte,deResultBit;	
		while(1){
			this.encrypt();
			this.decrypt();
			while(1){
				console.log('1:继续; Ctrl+C:退出');
				if(fun.read() == 1) break;
			}
		}
	}
}
Des._init();