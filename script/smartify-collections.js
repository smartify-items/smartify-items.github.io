if ( DEPLOYED_NETWORK_ID == '0x2710' ){
    document.getElementById('h4-checkbox-oasis').style.display = '';
}




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

if (params["auction"] !== null){
    if ( params["auction"] == 'true' ){
        document.getElementById('checkbox-oasis').checked = true;
        document.getElementById('checkbox-oasis').disabled = true;
    }
}

if ( params["a"] !== null || params["h"] !== null){
    onShowCollection()
    .then( () => {
        if ( params["auction"] !== null){
            if ( params["auction"] == 'true' ){
                getOasisInfo();
            }
        }
    });
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
            document.getElementById('div-collection-hashtags').innerHTML = '';
            isShowingCollection = false;
            return 0;
        }

        if ( collectionHashtag == '' ){
            document.getElementById('div-query-status').innerHTML = 'Please enter a hashtag, or select from the following: ';
            // isShowingCollection = false;
            // return 0;
        } else {
            document.getElementById('div-query-status').innerHTML = LOADING_MESSAGE;
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


        document.getElementById('div-query-status').innerHTML
        isShowingCollection = false;

    }
    // if ( creatorAddress != ''){
    //     if ( ethers.utils.isAddress(creatorAddress) ){
    //         document.getElementById('div-query-status').innerHTML = LOADING_MESSAGE;
            
    //         await showCollection(creatorAddress, collectionHashtag);

    //         document.getElementById('div-query-status').innerHTML = '';
    //     } else {
    //         document.getElementById('div-query-status').innerHTML = 'Please enter a valid creator address.';
    //     }
    // } else {
    //     document.getElementById('div-query-status').innerHTML = LOADING_MESSAGE;
        
    //     await showCollection(creatorAddress, collectionHashtag);

    //     document.getElementById('div-query-status').innerHTML = '';
    // }
}

let eventsBlockA;
let eventsBlockB;
let createdTokenIds = [];
let IdsToId = [];           // point multiple Token IDs mapping to the first of the kind

async function showCollection(_creator, _hashtag) {

    document.getElementById('button-share-link').style.display = 'none';
    document.getElementById('div-collection-hashtags').innerHTML = '';

    // let events;

    let creationEvents = [];
    if ( _creator != '' ){
        [createdTokenIds, creationEvents] = await getCreateTokenByCreator(_creator);
        // events = creationEvents;
    }
    console.log('createdTokenIds: ' + createdTokenIds);

    eventsBlockA = creationEvents[0].blockNumber;
    eventsBlockB = creationEvents[creationEvents.length - 1].blockNumber;
    console.log('eventsBlockA: ' + eventsBlockA);
    console.log('eventsBlockB: ' + eventsBlockB);

    let taggedTokenIds = [];
    // let hashtagEvents = [];
    if (_hashtag != ''){
        [taggedTokenIds, hashtagEvents] = await getHashtaggedTokenIds(_hashtag);

        // if (_creator == ''){
        //     events = hashtagEvents;
        // }
    }
    console.log('taggedTokenIds: ' + taggedTokenIds);

    let previousTokenId;
    let previousTokenURI = '';
    let previousTokenURItoMatch = '';
    let isRepeating = false;

    let nftJSON;
    let creatorHashtags = [];

    let htmlToAdd = '';

    let isMatched = false;
    for (let i = 0; i < createdTokenIds.length; i++) {
        const tokenId = createdTokenIds[i];

        let tokenURI;
        if ( _creator != '' && _hashtag != '' ) {       // both creator and hashtag
            tokenURI = IPFS_GATEWAY + creationEvents[i].args[4];

            if ( ! IsIpfs.url(tokenURI) ){
                console.log('Invalid ipfs url: ' + tokenURI);
                continue;
            }

            if ( tokenURI != previousTokenURItoMatch ){            // if finds new tokenURI 
                // console.log('new token at ' + i + ' ' + tokenId);
                previousTokenURItoMatch = tokenURI;                // save tokenURI
                                                            // compares only if new tokenURI
                if ( taggedTokenIds.includes(tokenId) ){    // if tokenID is in tagged list
                    isMatched = true;
                } else {
                    isMatched = false;
                }
            }
            if (isMatched == false){
                // console.log('skipping ' + i);
                continue;
            }
        }
        // console.log('isMatched: ' + isMatched + ' for ' + i + ', ' + tokenId);

        // if ( _creator == '' && _hashtag != '' ) {       // in this case events = hashtagEvents
        //     const tokenFilter = smartifyContract.filters.CreateToken(tokenId);
        //     const tokenEvents = await smartifyContract.queryFilter(tokenFilter);
        //     tokenURI = IPFS_GATEWAY + tokenEvents[0].args[4];
        // }

        // if ( _creator != '' && _hashtag == '' ) {       // in this case events = creationEvents
            tokenURI = IPFS_GATEWAY + creationEvents[i].args[4];
        // }
        
        if (tokenURI !== previousTokenURI) {    // finds a new token
            isRepeating = false;
            previousTokenId = tokenId;
            IdsToId[tokenId] = previousTokenId;

            if ( i > 0 ){    // checks out htmlToAdd to innerHTML only after first NFT
                                                    // does not check out for the last array element
                htmlToAdd += `
    </div>
</div>
`;
                // finishes div and checks out, reset htmlToAdd
                // note that .innerHTML seems to fix HTML syntax errors automatically
                // which can cause issues (pose limits in coding choices)
                // console.log('checkout content before tokenId: ' + createdTokenIds[i]);
                document.getElementById('div-collection').innerHTML += htmlToAdd;
                htmlToAdd = '';
            }

            previousTokenURI = tokenURI;

            try {
                nftJSON = await fetchJSON(tokenURI);
            } catch (e) {
                console.log(e);
                continue;
            }

            if ( ! IsIpfs.url(nftJSON.image) ){
                console.log('Invalid ipfs image url: ' + tokenURI);
                continue;
            }

            for (let j = 0; j < nftJSON.hashtags.length; j++) {
                    if ( ! creatorHashtags.includes(nftJSON.hashtags[j]) ){
                        document.getElementById('div-collection-hashtags').innerHTML += `<a class="hashtag" href="collections.html?a=${_creator}&h=${encodeURIComponent(nftJSON.hashtags[j])}">${nftJSON.hashtags[j]}</a>${hashtagSpacing}`;
                        creatorHashtags.push(nftJSON.hashtags[j]);
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
    <div class="oasis-info">
        <span class="oasis-info sub-highlight" id="span-oasis-token-id-${tokenId}"></span>
    </div>
    <div class="list-image">
        <img class="preview" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    </div>
    <div>
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
            

        } else {    // token repeats, same as previous

            IdsToId[tokenId] = previousTokenId;

            if (isRepeating == true){   // if already repeating, append to the 'also as' list
                htmlToAdd += 
`        <span class="nft-token-info"><a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;`;
            } else {                    // if first repeat, start 'also as' list, and set isRepeating to true
                htmlToAdd += 
`        <span class="nft-token-info">&nbsp;&nbsp;&nbsp;... also as&nbsp;&nbsp;&nbsp;<a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;`;
                isRepeating = true;
            }

        }   // if token repeats conditional ends here

    }   // for loop ends here

        // console.log((i+1) + ' of ' + createdTokenIds.length);
        // checks out last array element
        htmlToAdd += 
`
    </div>
</div>
`;
        // console.log('checkout content of last array elemet');
        document.getElementById('div-collection').innerHTML += htmlToAdd;
        htmlToAdd = '';

    if ( document.getElementById('div-collection').innerHTML == '' ){
        document.getElementById('div-collection').innerHTML = 'No items found.';
    } else {
        document.getElementById('button-share-link').innerHTML = 'Copy Share Link';
        document.getElementById('button-share-link').style.display = 'inline';
    }

}


async function getOasisInfo(){
    if ( document.getElementById('checkbox-oasis').checked == true ){
        document.getElementById('checkbox-oasis').disabled = true;

        const oasisContract = new ethers.Contract(OASIS_CONTRACT_ADDR, OASIS_CONTRACT_ABI, provider);
        const makeOrderFilter = oasisContract.filters.MakeOrder(CONTRACT_ADDR);
        const makeOrderEvents = await oasisContract.queryFilter(makeOrderFilter, eventsBlockA);

        // console.log(makeOrderEvents);
        // event MakeOrder(IERC721 indexed token, uint256 id, bytes32 indexed hash, address indexed seller);
        // for (let i = 0; i < makeOrderEvents.length ; i++){
        for (let i = makeOrderEvents.length-1; i >= 0 ; i--){
            const orderTokenId = Number(makeOrderEvents[i].args[1]);
            // console.log(orderTokenId);

            if ( createdTokenIds.includes(orderTokenId) ) {
                const orderHash = makeOrderEvents[i].args[2];
                console.log(orderHash);

                const currentPrice = await oasisContract.getCurrentPrice(orderHash);
                const currentPriceBCH = currentPrice / 1e18;
                const orderInfo = await oasisContract.orderInfo(orderHash);
                const auctionType = ['Fixed Price', 'Dutch Auction', 'English Auction'];

                console.log(orderTokenId + ', ' + currentPriceBCH + ' BCH, (' + auctionType[orderInfo[0]] + '), Sold: ' + orderInfo[10] + ' Cancelled: ' + orderInfo[11]);

                if ( orderInfo[10] || orderInfo[11]){
                    ; // sold or cancelled
                } else {
                    document.getElementById(`span-oasis-token-id-${IdsToId[orderTokenId]}`).innerHTML += '#' + orderTokenId + ': ' + currentPriceBCH + ' BCH [' + auctionType[orderInfo[0]] + `] on <a href="https://oasis.cash/token/CONTRACT_ADDR/${orderTokenId}">Oasis</a>
`; 
                }
                    // + document.getElementById(`span-oasis-token-id-${orderTokenId}`).innerHTML;

            }
        }
    }
}

{/* <span id="span-oasis-token-id-${tokenId}"></span> */}