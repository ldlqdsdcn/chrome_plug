bignumSkin = function(obj , strBox){
	$num = $(obj);
	$num.each(numObj);
	function numObj(){
		var numVal = $(this).find(strBox).html().toString();
		if(numVal.length == 0) return false;
		$(this).find(strBox).remove();
		$(this).find('em').remove();
		var numBox = '';
		for(var i=0; i <= numVal.length - 1; i++) {
			var numInfo = numVal[i];
			if(numVal[0] === undefined)  numInfo = numVal.charAt(i);
			switch (numInfo){
			case '0':
			  numBox += "<i class='JS-base-big-num JS-big-num-0' alt='0'></i>";
			  break;
			case '1':
			  numBox += "<i class='JS-base-big-num JS-big-num-1' alt='1'></i>";
			  break;
			case '2':
			  numBox += "<i class='JS-base-big-num JS-big-num-2' alt='2'></i>";
			  break;
			case '3':
			  numBox += "<i class='JS-base-big-num JS-big-num-3' alt='3'></i>";
			  break;
			case '4':
			  numBox += "<i class='JS-base-big-num JS-big-num-4' alt='4'></i>";
			  break;
			case '5':
			  numBox += "<i class='JS-base-big-num JS-big-num-5' alt='5'></i>";
			  break;
			case '6':
			  numBox += "<i class='JS-base-big-num JS-big-num-6' alt='6'></i>";
			  break;
			case '7':
			  numBox += "<i class='JS-base-big-num JS-big-num-7' alt='7'></i>";
			  break;
			case '8':
			  numBox += "<i class='JS-base-big-num JS-big-num-8' alt='8'></i>";
			  break;
			case '9':
			  numBox += "<i class='JS-base-big-num JS-big-num-9' alt='9'></i>";
			  break;
			case ',':
			  numBox += "<i class='JS-base-big-num JS-big-num-point' alt=','></i>";
			  break;
			case '��':
			  numBox += "<i class='JS-base-big-num JS-big-num-point' alt=','></i>";
			  break;
			default:
			  numBox += "<i class='JS-base-big-num JS-big-num-point' alt=','></i>";
			}
		};
		//alert(numBox);
		$(numBox).prependTo(this);
	};
};
// $(document).ready(function(){
//     bignumSkin('.JS-num-big-set' , '.JS-num-big-val');
// });