const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});




let isShowingCollection = false;

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


async function onShowCollection() {

    if ( isShowingCollection == false) {
        isShowingCollection = true;

        document.getElementById('div-collection').innerHTML = '';
        document.getElementById('button-share-link').style.display = 'none';

        const creatorAddress = document.getElementById('creator-address').value;
        const collectionHashtag = document.getElementById('input-hashtag').value;

        if ( creatorAddress == '' || !ethers.utils.isAddress(creatorAddress) ){
            document.getElementById('div-query-status').innerHTML = 'Please enter a valid creator address.';
            isShowingCollection = false;
            return 0;
        }

        if ( collectionHashtag == '' ){
            document.getElementById('div-query-status').innerHTML = 'Please enter a hashtag, or select from the following: ';
            // isShowingCollection = false;
            // return 0;
        } else {
            document.getElementById('div-query-status').innerHTML = 'Loading...';
        }

        document.getElementById('creator-address').readOnly = true;
        document.getElementById('input-hashtag').readOnly = true;

        await showCollection(creatorAddress, collectionHashtag);

        document.getElementById('creator-address').readOnly = false;
        document.getElementById('input-hashtag').readOnly = false;

        if ( collectionHashtag == '' ){
            ;
        } else {
            document.getElementById('div-query-status').innerHTML = '';
        }


        isShowingCollection = false;

    }
    // if ( creatorAddress != ''){
    //     if ( ethers.utils.isAddress(creatorAddress) ){
    //         document.getElementById('div-query-status').innerHTML = 'Loading...';
            
    //         await showCollection(creatorAddress, collectionHashtag);

    //         document.getElementById('div-query-status').innerHTML = '';
    //     } else {
    //         document.getElementById('div-query-status').innerHTML = 'Please enter a valid creator address.';
    //     }
    // } else {
    //     document.getElementById('div-query-status').innerHTML = 'Loading...';
        
    //     await showCollection(creatorAddress, collectionHashtag);

    //     document.getElementById('div-query-status').innerHTML = '';
    // }
}


async function showCollection(_creator, _hashtag) {

    document.getElementById('button-share-link').style.display = 'none';
    document.getElementById('div-collection-hashtags').innerHTML = '';

    let events;

    let createdTokenIds = [];
    let creatorEvents = [];
    if ( _creator != '' ){
        [createdTokenIds, creatorEvents] = await getCreatorTokenIds(_creator);
        events = creatorEvents;
    }
    console.log(createdTokenIds);

    let taggedTokenIds = [];
    let hashtagEvents = [];
    if (_hashtag != ''){
        [taggedTokenIds, hashtagEvents] = await getHashtaggedTokenIds(_hashtag);

        if (_creator == ''){
            events = hashtagEvents;
        }
    }
    console.log(taggedTokenIds);

    let previousTokenURItoMatch = '';
    let previousTokenURI = '';
    let isRepeating = false;

    let nftJSON;
    let creatorHashtags = [];

    let htmlToAdd = '';

    let isMatched = false;
    for (let i = 0; i < events.length; i++) {
        const tokenId = Number(events[i].args[0]);

        let tokenURI;
        if ( _creator != '' && _hashtag != '' ) {       // both creator and hashtag
            tokenURI = IPFS_GATEWAY + events[i].args[4];

            if ( tokenURI != previousTokenURItoMatch ){
                previousTokenURItoMatch = tokenURI;
                if ( taggedTokenIds.includes(tokenId) ){
                    isMatched = true;
                } else {
                    isMatched = false;
                }
            }
            if (isMatched == false){
                continue;
            }
        }

        if ( _creator == '' && _hashtag != '' ) {       // in this case events = hashtagEvents
            const tokenFilter = smartifyContract.filters.CreateToken(tokenId);
            const tokenEvents = await smartifyContract.queryFilter(tokenFilter);
            tokenURI = IPFS_GATEWAY + tokenEvents[0].args[4];
        }

        if ( _creator != '' && _hashtag == '' ) {       // in this case events = creatorEvents
            tokenURI = IPFS_GATEWAY + events[i].args[4];
        }
        
        if (tokenURI !== previousTokenURI) {
            isRepeating = false;

            if ( i < events.length-1 ){
                htmlToAdd += `
    </div>
`;

                document.getElementById('div-collection').innerHTML += htmlToAdd;
                htmlToAdd = '';
            }

            previousTokenURI = tokenURI;

            nftJSON = await fetchJSON(tokenURI);

            for (let i = 0; i < nftJSON.hashtags.length; i++) {
                    if ( ! creatorHashtags.includes(nftJSON.hashtags[i]) ){
                        document.getElementById('div-collection-hashtags').innerHTML += `<a class="hashtag" href="collections.html?a=${_creator}&h=${encodeURIComponent(nftJSON.hashtags[i])}">${nftJSON.hashtags[i]}</a>${hashtagSpacing}`;
                        creatorHashtags.push(nftJSON.hashtags[i]);
                    }
            }

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
        <div class="nft-description">${nftJSON.description}
        </div>
        <div class="nft-hashtags">${nftJSON.hashtags.map(x => `<a class="hashtag" href="hashtags.html?h=${encodeURIComponent(x)}">${x}</a>`).join(hashtagSpacing)}
        </div>
        <span>${nftJSON.editions} edition(s)</span>
`;
            

        } else {
            if (isRepeating == true){
                htmlToAdd += 
`        <span class="nft-token-info"><a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;`;
            } else {
                htmlToAdd += 
`        <span class="nft-token-info">&nbsp;&nbsp;&nbsp;... also as&nbsp;&nbsp;&nbsp;<a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;`;
                isRepeating = true;
            }

        }

    }

    htmlToAdd += 
`
    </div>
</div>
`;
    document.getElementById('div-collection').innerHTML += htmlToAdd;
    htmlToAdd = '';

    isRepeating = false;

    if ( document.getElementById('div-collection').innerHTML == '' ){
        document.getElementById('div-collection').innerHTML = 'No items found.';
    } else {
        document.getElementById('button-share-link').innerHTML = 'Copy Share Link';
        document.getElementById('button-share-link').style.display = 'inline';
    }

}



async function getHashtaggedTokenIds(_hashtag){
    const _hashtagFilter_1 = smartifyContract.filters.TokenHashtags(null, hashtagToBytes32(_hashtag), null, null);
    const _hashtagEvents_1 = await smartifyContract.queryFilter(_hashtagFilter_1);

    const _hashtagFilter_2 = smartifyContract.filters.TokenHashtags(null, null, hashtagToBytes32(_hashtag), null);
    const _hashtagEvents_2 = await smartifyContract.queryFilter(_hashtagFilter_2);

    const _hashtagFilter_3 = smartifyContract.filters.TokenHashtags(null, null, null, hashtagToBytes32(_hashtag));
    const _hashtagEvents_3 = await smartifyContract.queryFilter(_hashtagFilter_3);

    const hashtagEvents_ = _hashtagEvents_3.concat(_hashtagEvents_2).concat(_hashtagEvents_1);

    let taggedTokenIds_ = [];
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