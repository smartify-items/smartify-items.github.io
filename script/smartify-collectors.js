const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);


const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["a"] !== null){
	document.getElementById('collector-address').value = params["a"];
    onShowCollected();
}


function onShowCollected() {
    const collectorAddress = document.getElementById('collector-address').value;
    if ( ethers.utils.isAddress(collectorAddress) ){
        document.getElementById('div-items-collected').innerHTML = '';
        showCollectedByEvents(collectorAddress);
        // showCollectedByEnum(collectorAddress)
    } else {
        document.getElementById('div-items-collected').innerHTML = 'Please enter a valid address.';
        return 0;
    }
}

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

async function showCollectedByEvents(collectorAddress) {

    document.getElementById('div-collector-info').innerHTML = `Loading...</h3>`;

    const eventFilterReceived = smartifyContract.filters.Transfer(null, collectorAddress, null);
    const eventsReceived = await smartifyContract.queryFilter(eventFilterReceived);
    // console.log(eventsReceived);

    const eventFilterSent = smartifyContract.filters.Transfer(collectorAddress, null, null);
    const eventsSent = await smartifyContract.queryFilter(eventFilterSent);
    // console.log(eventsSent);

    // const collectorAddressShort = collectorAddress.substring(0, 6) + '...' + collectorAddress.substring(collectorAddress.length - 4);

    let ownedCandidates = {};
    for (let i = 0; i < eventsReceived.length; i++){
        const tokenId = eventsReceived[i].args[2];
        ownedCandidates[String(tokenId)] = {};
        ownedCandidates[String(tokenId)]["blockNumber"] = eventsReceived[i].blockNumber;
        ownedCandidates[String(tokenId)]["owned"] = true;
        ownedCandidates[String(tokenId)]["ownedIndex"] = i;
    }
    for (let i = 0; i < eventsSent.length; i++){
        const tokenId = eventsSent[i].args[2];

        if ( eventsSent[i].blockNumber >= ownedCandidates[String(tokenId)]["blockNumber"]){
            ownedCandidates[String(tokenId)]["owned"] = false;
        }
    }

    let arrayTokenId = Object.keys(ownedCandidates);
    let ownedIndex = 0;

    document.getElementById('div-collector-info').innerHTML = '';
    for (let i = 0; i < arrayTokenId.length; i++) {
        if (ownedCandidates[String(arrayTokenId[i])]["owned"] === true) {

            ownedIndex++;
            let nftURI = await smartifyContract.tokenURI(arrayTokenId[i]);
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
    ITMS <a href="items.html?t=${arrayTokenId[i]}">#${arrayTokenId[i]}</a>
    <span class="imgbox">
        <img class="assets" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    </span>
</span>
`;
            
        }
    }

}
