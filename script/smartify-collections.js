const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["a"] !== null){
	const _creator = params["a"];
    document.getElementById('creator-address').value = _creator;
}

if (params["h"] !== null){
    const _hashtag = decodeURI(params["h"]);
	document.getElementById('input-hashtag').value = _hashtag;
}

if ( params["a"] !== null || params["h"] !== null){
    onShowCollection();
}


async function getHashtaggedTokenIds(_hashtag){
    const _hashtagFilter_1 = smartifyContract.filters.TokenHashtags(null, hashtagToBytes32(_hashtag), null, null);
    const _hashtagEvents_1 = await smartifyContract.queryFilter(_hashtagFilter_1);
    // console.log(_hashtagEvents_1);

    const _hashtagFilter_2 = smartifyContract.filters.TokenHashtags(null, null, hashtagToBytes32(_hashtag), null);
    const _hashtagEvents_2 = await smartifyContract.queryFilter(_hashtagFilter_2);
    // console.log(_hashtagEvents_2);

    const _hashtagFilter_3 = smartifyContract.filters.TokenHashtags(null, null, null, hashtagToBytes32(_hashtag));
    const _hashtagEvents_3 = await smartifyContract.queryFilter(_hashtagFilter_3);
    // console.log(_hashtagEvents_3);

    const hashtagEvents_ = _hashtagEvents_3.concat(_hashtagEvents_2).concat(_hashtagEvents_1);

    let taggedTokenIds_ = [];
    // for (let i = hashtagEvents_.length-1; i >= 0; i--) {
    for (let i = 0; i < hashtagEvents_.length; i++) {
        const _tokenId = hashtagEvents_[i].args[0];
        taggedTokenIds_.push(Number(_tokenId));
    }

    return [taggedTokenIds_, hashtagEvents_];
}


async function getCreatorTokenIds(_creator){
    const _creatorFilter = smartifyContract.filters.CreateToken(null, null, _creator);
    const creatorEvents_ = await smartifyContract.queryFilter(_creatorFilter);

    let createdTokenIds_ = [];
    for (let i = 0; i < creatorEvents_.length; i++) {
        const _tokenId = creatorEvents_[i].args[0];
        createdTokenIds_.push(Number(_tokenId));
    }

    return [createdTokenIds_, creatorEvents_];
}

function onShowCollection() {
    const creatorAddress = document.getElementById('creator-address').value;
    const collectionHashtag = document.getElementById('input-hashtag').value;

    if ( creatorAddress != ''){
        if ( ethers.utils.isAddress(creatorAddress) ){
            document.getElementById('div-collection').innerHTML = 'Loading...';
            showCollection(creatorAddress, collectionHashtag);
        } else {
            document.getElementById('div-collection').innerHTML = 'Please enter a valid creator address.';
            return 0;
        }
    } else {
        document.getElementById('div-collection').innerHTML = 'Loading...';
        showCollection(creatorAddress, collectionHashtag);
    }
}

async function showCollection(_creator, _hashtag) {

    let events;

    let creatorEvents = [];
    if ( _creator != '' ){
        [createdTokenIds, creatorEvents] = await getCreatorTokenIds(_creator);
        events = creatorEvents;
    }
    // console.log(createdTokenIds);

    let taggedTokenIds = [];
    let hashtagEvents = [];
    if (_hashtag != ''){
        [taggedTokenIds, hashtagEvents] = await getHashtaggedTokenIds(_hashtag);

        if (_creator == ''){
            events = hashtagEvents;
        }
    }
    // console.log(taggedTokenIds);

    // document.getElementById('div-collection').innerHTML = 'ITMS&nbsp;&nbsp;made by&nbsp;&nbsp;' + _creatorShort;


    let previousTokenURItoMatch = '';
    let previousTokenURI = '';
    let isRepeating = false;

    let htmlToAdd = '';
    let nftJSON;
    
    // events is set first to creatorEvents, and to hashtagEvents is creator not present
    // for (let i = events.length-1; i >= 0; i--) {
    
    let isMatched = false;
    for (let i = 0; i < events.length; i++) {
        const tokenId = Number(events[i].args[0]);

        let tokenURI;
        if ( _creator != '' && _hashtag != '' ) {       // both creator and hashtag
            tokenURI = IPFS_GATEWAY + events[i].args[4];

            // console.log(previousTokenURItoMatch);
            // console.log(tokenURI);
            if ( tokenURI != previousTokenURItoMatch ){
                // console.log('new token');
                previousTokenURItoMatch = tokenURI;
                if ( taggedTokenIds.includes(tokenId) ){
                    // console.log('match');
                    isMatched = true;
                } else {
                    // console.log('does not match');
                    isMatched = false;
                }
            }
            // console.log(i + ': ' + isMatched);
            if (isMatched == false){
                continue;
            }
        }

        if ( _creator == '' && _hashtag != '' ) {       // in this case events = hashtagEvents
            const tokenFilter = smartifyContract.filters.CreateToken(tokenId);
            const tokenEvents = await smartifyContract.queryFilter(tokenFilter);
            // console.log(tokenEvents);
            // creator = tokenEvents[0].args[2];
            // editions = tokenEvents[0].args[3];
            tokenURI = IPFS_GATEWAY + tokenEvents[0].args[4];
        }

        if ( _creator != '' && _hashtag == '' ) {       // in this case events = creatorEvents
            tokenURI = IPFS_GATEWAY + events[i].args[4];
        }

        // console.log(tokenURI);
        
        if (tokenURI !== previousTokenURI) {
            isRepeating = false;

            if (i < events.length-1){
                htmlToAdd += '</div>';
            }

            previousTokenURI = tokenURI;

            nftJSON = await fetchJSON(tokenURI);

            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage != null){
                nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
            }

            const creatorShort = nftJSON.creator.substring(0, 6) + '...' + nftJSON.creator.substring(nftJSON.creator.length - 4);

            htmlToAdd += 
`
<div class="nft-item">
    <img class="preview" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    <div class="nft-token-info">
        <span style="display: inline-block; width: 600px">
            ITMS <a href="items.html?t=${tokenId}">#${tokenId}</a>&nbsp;&nbsp;<span class="highlight">${nftJSON.name}</span>&nbsp;&nbsp;by&nbsp;&nbsp;<a class="creator" href="creators.html?a=${nftJSON.creator}">${creatorShort}</a>
        </span>
        <div style="display: inline-block; width: 480px; text-align: right">
            <span class="more-info" href="#" onclick="displaySwitch('div-info-${i}', 'block')">more info &#x21e9;</span>
        </div>
    </div>
    <div id="div-info-${i}" style="display: none">
        <div class="nft-description">${nftJSON.description}</div>
        <div class="nft-hashtags">${nftJSON.hashtags.map(x => `<a class="hashtag" href="hashtags.html?h=${encodeURIComponent(x)}">${x}</a>`).join(hashtagSpacing)}</div>
        <span>${nftJSON.editions} edition(s)</span>
`;
            

        } else {
            if (isRepeating == true){
                htmlToAdd += 
`
<span class="nft-token-info"><a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;
`;
            } else {
                htmlToAdd += 
`
<span class="nft-token-info">&nbsp;&nbsp;&nbsp;... also as&nbsp;&nbsp;&nbsp;<a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;
`;
                isRepeating = true;
            }

        }

    }

    if (htmlToAdd != ''){
        htmlToAdd += 
`
    </div>
</div>
`;
    }
    
    isRepeating = false;
    
    document.getElementById('div-collection').innerHTML = '';
    document.getElementById('div-collection').innerHTML += htmlToAdd;

    if ( document.getElementById('div-collection').innerHTML == '' ){
        document.getElementById('div-collection').innerHTML = 'No items found.';
    }

}