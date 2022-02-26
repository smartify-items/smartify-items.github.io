const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});




let isShowingCreated = false;

if (params["a"] !== null){
	document.getElementById('creator-address').value = params["a"];
    onShowCreated();
}

async function onShowCreated() {

    document.getElementById('button-share-link').style.display = 'none';
    document.getElementById('a-check-collections').style.display = 'none';
    document.getElementById('div-items-created').innerHTML = '';

    const creatorAddress = document.getElementById('creator-address').value;
    if ( ethers.utils.isAddress(creatorAddress) ){
        if ( isShowingCreated == false ){
            isShowingCreated = true;
            document.getElementById('creator-address').readOnly = true;
            document.getElementById('div-query-status').innerHTML = 'Loading... ';

            await showCreated(creatorAddress);

            isShowingCreated = false;
            document.getElementById('creator-address').readOnly = false;
            document.getElementById('div-query-status').innerHTML = '';
        }
    } else {
        document.getElementById('div-query-status').innerHTML = 'Please enter a valid creator address.';
    }
}

async function showCreated(createdBy) {

    const eventFilter = smartifyContract.filters.CreateToken(null, null, createdBy);
    const events = await smartifyContract.queryFilter(eventFilter);

    const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

    // document.getElementById('div-items-created').innerHTML = 'ITMS&nbsp;&nbsp;created by&nbsp;&nbsp;' + createdByShort;

    let previousTokenURI = '';
    let isRepeating = false;

    let htmlToAdd = '';
    let nftJSON;
    
    for (let i = events.length-1; i >= 0; i--) {
        const tokenId = events[i].args[0];
        const tokenURI = IPFS_GATEWAY + events[i].args[4];

        if (tokenURI !== previousTokenURI) {
            isRepeating = false;

            if (i < events.length-1){   // does not check out for the last array element
                htmlToAdd += `
    </div>
</div>
`;
                // finishes div and checks out, reset htmlToAdd
                // note that .innerHTML seems to fix HTML syntax errors automatically
                // which can cause issues (pose limits in coding choices)
                document.getElementById('div-items-created').innerHTML += htmlToAdd;
                htmlToAdd = '';
            }

            previousTokenURI = tokenURI;

            try {
                nftJSON = await fetchJSON(tokenURI);
            } catch (e) {
                console.log(e);
                continue;
            }

            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage != null){
                nftJSON.image = 'https://ipfs.io/ipfs/' + foundIPFSinJSONImage[1];
            }

            htmlToAdd += 
`
<div class="nft-item">
    <img class="preview" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    <div class="nft-token-info">
        <span style="display: inline-block; width: 600px">
            ITMS <a href="items.html?t=${tokenId}">#${tokenId}</a>&nbsp;&nbsp;<span class="highlight">${nftJSON.name}</span>&nbsp;&nbsp;by&nbsp;&nbsp;<a class="creator" href="creators.html?a=${createdBy}">${createdByShort}</a>
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

    htmlToAdd += 
`
    </div>
</div>
`;

    isRepeating = false;
    
    document.getElementById('div-items-created').innerHTML += htmlToAdd;
    htmlToAdd = '';    

    if ( document.getElementById('div-items-created').innerHTML == '' ){
        document.getElementById('div-items-created').innerHTML = 'No items found.';
    } else {
        document.getElementById('button-share-link').innerHTML = 'Copy Share Link';
        document.getElementById('button-share-link').style.display = 'inline';

        document.getElementById('a-check-collections').href = `collections.html?a=${createdBy}`;
        document.getElementById('a-check-collections').innerHTML = `check out Collections created by ${createdByShort}`;
        document.getElementById('a-check-collections').style.display = 'inline';
    }

}