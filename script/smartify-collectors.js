const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);


const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});



let isShowingCollected = false;

if (params["a"] !== null){
	document.getElementById('collector-address').value = params["a"];
    onShowCollected();
}

async function onShowCollected() {
    if ( isShowingCollected == false ){
        const collectorAddress = document.getElementById('collector-address').value;
        if ( ethers.utils.isAddress(collectorAddress) ){
            isShowingCollected = true;
            document.getElementById('collector-address').readOnly = true;
            document.getElementById('div-query-status').innerHTML = `Loading...`;

            await showCollectedByEvents(collectorAddress);
            // showCollectedByEnum(collectorAddress)

            isShowingCollected = false;
            document.getElementById('collector-address').readOnly = false;
            document.getElementById('div-query-status').innerHTML = '';
        } else {
            document.getElementById('div-items-collected').innerHTML = 'Please enter a valid address.';
            return 0;
        }
    }
}

async function showCollectedByEvents(collectorAddress) {

    document.getElementById('button-share-link').style.display = 'none';

    const ownedTokenIds = await getOwnedByEvents(smartifyContract, collectorAddress);
    console.log(ownedTokenIds);

    document.getElementById('div-items-collected').innerHTML = '';
    for (let i = 0; i < ownedTokenIds.length; i++){
        const tokenURI = await smartifyContract.tokenURI(ownedTokenIds[i]);
        const nftJSON = await fetchJSON(tokenURI);

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
async function showCollectedByEnum(collectorAddress) {

    const balanceOf = Number(await smartifyContract.balanceOf(collectorAddress));
    // console.log(balanceOf);

    for (let i = 0; i < balanceOf; i++) {
        // console.log('i: ' + i);
        let tokenId = Number(await smartifyContract.tokenOfOwnerByIndex(collectorAddress, i));
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