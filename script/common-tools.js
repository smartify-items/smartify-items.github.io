const hashtagSpacing = '    ';

async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}

function displaySwitch(_elementId, _displayStyle){
    document.getElementById(_elementId).style.display = 
		document.getElementById(_elementId).style.display == 'none' ? _displayStyle : 'none';
}

function imgToFullscreen(img) {
	// console.log('full-screen');
    document.getElementById('div-fullpage').style.backgroundImage = 'url(' + img + ')';
    document.getElementById('div-fullpage').style.display = 'block';
}


function cidToBytes32(str) {
    str_1 = '0x' + ascii_to_hexa(str.substring(0, 32));
    str_2 = '0x' + ascii_to_hexa(str.substring(32, 64));

    let zeros = '000000000000000000000000000000000000000000000000000000000000000000';     // '0' x 66
    const zerosToPad = 66 - str_2.length;

    return[str_1, str_2 + zeros.substring(0, zerosToPad)];
}


function ascii_to_hexa(str) {
    var arr1 = [];
    for (var n = 0, l = str.length; n < l; n ++) {
      var hex = Number(str.charCodeAt(n)).toString(16);
      arr1.push(hex);
    }
    return arr1.join('');
}

function hashtagToBytes32(_hashtag) {
    _bytes32 = '0x' + ascii_to_hexa(_hashtag.substring(0, 32));

    let zeros = '000000000000000000000000000000000000000000000000000000000000000000';     // '0' x 66
    const zerosToPad = 66 - _bytes32.length;

    return (_bytes32 + zeros.substring(0, zerosToPad));
}