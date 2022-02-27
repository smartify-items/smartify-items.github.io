const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);


const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});



// if (params["h"] !== null){
//     const hashtag = decodeURI(params["h"]);
// 	document.getElementById('input-hashtag').value = hashtag;
// }


let isShowingCollected = false;

if (params["a"] !== null){
	document.getElementById('collector-address').value = params["a"];
    onShowCollected();
}

if (params["b"] !== null){
	document.getElementById('creator-address').value = params["b"];
}

async function onShowCollected() {
    if ( isShowingCollected == false ){
        const collectorAddress = document.getElementById('collector-address').value;
        if ( ethers.utils.isAddress(collectorAddress) ){
            isShowingCollected = true;
            document.getElementById('collector-address').readOnly = true;
            // document.getElementById('input-hashtag').readOnly = true;
            document.getElementById('div-query-status').innerHTML = LOADING_MESSAGE;

            document.getElementById('div-items-collected').innerHTML = '';
            // const hashtag = document.getElementById('input-hashtag').value
            // await showCollectedByEvents(collectorAddress, hashtag);
            await showCollectedByEvents(collectorAddress, '');
            // showCollectedByEnum(collectorAddress)

            isShowingCollected = false;
            document.getElementById('collector-address').readOnly = false;
            // document.getElementById('input-hashtag').readOnly = false;
            document.getElementById('div-query-status').innerHTML = '';
        } else {
            document.getElementById('div-items-collected').innerHTML = 'Please enter a valid address.';
            return 0;
        }
    }
}

async function showCollectedByEvents(_collectorAddress, _creator) {

    document.getElementById('button-share-link').style.display = 'none';
    document.getElementById('div-collected-creators').innerHTML = '';
    // document.getElementById('div-collected-hashtags').innerHTML = '';

    const [ownedTokenIds, ownedEvents] = await getOwnedByEvents(smartifyContract, _collectorAddress);
    console.log('ownedTokenIds: ' + ownedTokenIds);

    // let taggedTokenIds = [];
    // // let hashtagEvents = [];
    // if (_hashtag != '' && _hashtag != null){
    //     [taggedTokenIds, hashtagEvents] = await getHashtaggedTokenIds(_hashtag);

    //     // if (_creator == ''){
    //     //     events = hashtagEvents;
    //     // }
    // }
    // console.log('_hashtag: ' + _hashtag);
    // console.log('taggedTokenIds: ' + taggedTokenIds);

    // let collectedHashtags = [];
    let collectedCreators = [];
    

    // let isMatched = false;
    for (let i = 0; i < ownedTokenIds.length; i++){
        const tokenURI = await smartifyContract.tokenURI(ownedTokenIds[i]);
        
        if ( ! IsIpfs.url(tokenURI) ){
            console.log('Invalid ipfs image url: ' + tokenURI);
            continue;
        }

        let nftJSON;
        try{ 
            nftJSON = await fetchJSON(tokenURI);
        } catch (e) {
            console.log(e);
            continue;
        }

        if ( ! IsIpfs.url(nftJSON.image) ){
            console.log('Invalid ipfs url: ' + tokenURI);
            continue;
        }

        // if ( _hashtag != '' ){
        //     if ( taggedTokenIds.includes(ownedTokenIds[i]) ){    // if tokenID is in tagged list
        //         // isMatched = true;
        //     } else {
        //         continue;
        //     }
        // }

        // for (let j = 0; j < nftJSON.hashtags.length; j++) {
        //     if ( ! collectedHashtags.includes(nftJSON.hashtags[j]) ){
        //         document.getElementById('div-collected-hashtags').innerHTML += `<a class="hashtag" href="collectors.html?a=${_collectorAddress}&h=${encodeURIComponent(nftJSON.hashtags[j])}">${nftJSON.hashtags[j]}</a>${hashtagSpacing}`;
        //         collectedHashtags.push(nftJSON.hashtags[j]);
        //     }
        // }

        if ( document.getElementById('creator-address').value != null && document.getElementById('creator-address').value != '' ){
            if ( nftJSON.creator.toLowerCase() != document.getElementById('creator-address').value.toLowerCase() ){
                continue;
            }
        }

        if ( ! collectedCreators.includes(nftJSON.creator) ){
            if ( document.getElementById('div-collected-creators').innerHTML == '' ) {
                document.getElementById('div-collected-creators').innerHTML += 'From Creator(s):    ';
            }
            document.getElementById('div-collected-creators').innerHTML += `<a class="hashtag" href="collectors.html?a=${_collectorAddress}&b=${nftJSON.creator}">${shortAddr(nftJSON.creator)}</a>${hashtagSpacing}`;
            collectedCreators.push(nftJSON.creator);
        }

        document.getElementById('div-items-collected').innerHTML +=
`
<span class="nftdisplay">
ITMS <a href="items.html?t=${ownedTokenIds[i]}">#${ownedTokenIds[i]}</a>
<span class="imgbox">
    <img class="assets" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
</span>
</span>
`;
    }

    if ( document.getElementById('div-items-collected').innerHTML == '' ){
        document.getElementById('div-items-collected').innerHTML = 'No items found.';
    } else {
        document.getElementById('button-share-link').innerHTML = 'Copy Share Link';
        document.getElementById('button-share-link').style.display = 'inline';
    }

}


/* backup function, slower */
/*
async function showCollectedByEnum(_collectorAddress) {

    const balanceOf = Number(await smartifyContract.balanceOf(_collectorAddress));
    // console.log(balanceOf);

    for (let i = 0; i < balanceOf; i++) {
        // console.log('i: ' + i);
        let tokenId = Number(await smartifyContract.tokenOfOwnerByIndex(_collectorAddress, i));
        // console.log('nftIndex: ' + tokenId);
        
        let nftURI = await smartifyContract.tokenURI(tokenId);
        const foundIPFSinURI = nftURI.match(/ipfs:\/\/(\w+)/);
        if (foundIPFSinURI != null){
            nftURI = 'https://ipfs.io/ipfs/' + foundIPFSinURI[1];
        }

        let nftJSON = await fetchJSON(nftURI);
        const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
        if (foundIPFSinJSONImage != null){
            nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
        }

        document.getElementById('div-items-collected').innerHTML +=
`
<span class="nftdisplay">
    ITMS <a href="items.html?t=${tokenId}">#${tokenId}</a>
    <span class="imgbox">
        <a href="${nftJSON.image}"><img class="assets" src="${nftJSON.image}"></a>
    </span>
</span>
`;
    }

}
*/