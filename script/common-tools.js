const hashtagSpacing = '    ';

function checkBounds(_elementId, _lowerBoundInclusive, _upperBoundInclusive){
    if ( document.getElementById(_elementId).value == '' ){
        alert(`Please specify a value for '${_elementId}'.`);
    }

    if ( document.getElementById(_elementId).value > _upperBoundInclusive ){
        alert(`Input ${_elementId} value exceeds upper limit.`);
        document.getElementById(_elementId).value = _upperBoundInclusive;
    }

    if ( document.getElementById(_elementId).value < _lowerBoundInclusive ){
        alert(`Input ${_elementId} value exceeds lower limit.`);
        document.getElementById(_elementId).value = _lowerBoundInclusive;
    }
}


function copyShareLink(type) {
    let creatorAddress;
    let collectionHashtag;
    let tokenId;
    let collectorAddress;
    switch( type ) {
        case 'collections': 
            creatorAddress = document.getElementById('creator-address').value;
            collectionHashtag = document.getElementById('input-hashtag').value;
        
            navigator.clipboard.writeText(window.location.origin + `/collections.html?a=${creatorAddress}&h=${encodeURIComponent(collectionHashtag)}`);
            break;
        case 'hashtags': 
            collectionHashtag = document.getElementById('input-hashtag').value;
            navigator.clipboard.writeText(window.location.origin + `/hashtags.html?h=${encodeURIComponent(collectionHashtag)}`);
            break;
        case 'creators':
            creatorAddress = document.getElementById('creator-address').value;
            navigator.clipboard.writeText(window.location.origin + `/creators.html?a=${creatorAddress}`);
            break;
        case 'items':
            tokenId = document.getElementById('input-token-id').value;
            navigator.clipboard.writeText(window.location.origin + `/items.html?t=${tokenId}`);
            break;
        case 'collectors':
            collectorAddress = document.getElementById('collector-address').value;
            navigator.clipboard.writeText(window.location.origin + `/collectors.html?a=${collectorAddress}`);
            break;
    }
    
    document.getElementById('button-share-link').innerHTML = 'Copied!';
    // document.getElementById('span-link-copied').innerHTML = 'Share link copied to Clipboard.';
}


async function fetchJSON(api_uri) {
	let response = await fetch(api_uri);
	
	if (!response.ok) {
	    throw new Error(`HTTP error! status: ${response.status}`);
	}
	
	let myJSON = await response.json();
	
	return await myJSON;
}


async function getOwnedByEvents(_contract, _ownerAddress){

    const filterReceived = _contract.filters.Transfer(null, _ownerAddress, null);
    const eventsReceived = await _contract.queryFilter(filterReceived);
    const filterSent = _contract.filters.Transfer(_ownerAddress, null, null);
    const eventsSent = await _contract.queryFilter(filterSent);

    let ownedTokenIds_ = [];
    let ownedCandidates = {};

    for (let i = 0; i < eventsReceived.length; i++){
        const tokenId = eventsReceived[i].args[2];
        ownedCandidates[String(tokenId)] = {
            'blockNumber' : eventsReceived[i].blockNumber,
            'owned' : true,
        }
    }

    for (let i = 0; i < eventsSent.length; i++){
        const tokenId = eventsSent[i].args[2];
        const recipient = eventsSent[i].args[1];
        if ( eventsSent[i].blockNumber >= ownedCandidates[String(tokenId)]["blockNumber"]){
            if ( recipient.toLowerCase() != _ownerAddress.toLowerCase()){
                ownedCandidates[String(tokenId)]["owned"] = false;
            }
        }
    }

    for (let i = 0; i < eventsReceived.length; i++){
        const tokenId = eventsReceived[i].args[2];
        if (ownedCandidates[String(tokenId)]["owned"] === true){
            if (! ownedTokenIds_.includes(Number(tokenId))){
                ownedTokenIds_.push(Number(tokenId));
            }
        }
    }

    return ownedTokenIds_;

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