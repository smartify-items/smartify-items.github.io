const provider = new ethers.providers.JsonRpcProvider(httpsRPC);
const smartifyContract = new ethers.Contract(smartifyContractAddress, smartifyContractABI, provider);

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["a"] !== null){
	document.getElementById('creator-address').value = params["a"];
    onShowCreated();
}


function onShowCreated() {
    const creatorAddress = document.getElementById('creator-address').value;
    if ( ethers.utils.isAddress(creatorAddress) ){
        document.getElementById('div-items-created').innerHTML = 'Loading...';
        showCreated(creatorAddress);
    } else {
        document.getElementById('div-items-created').innerHTML = 'Please enter a valid creator address.';
        return 0;
    }
}

async function showCreated(createdBy) {

    const eventFilter = smartifyContract.filters.CreateToken(null, null, createdBy);
    const events = await smartifyContract.queryFilter(eventFilter);
    // console.log(events);

    // event CreateToken(
    //     uint256 indexed tokenId, 
    //     string indexed hashedIpfsCID, 
    //     address indexed createdBy, 
    //     uint16 editions, 
    //     string plainIpfsCID
    // );

    // event TokenHashtags(
    //     uint256 tokenId, 
    //     bytes32 indexed hashtag_1, 
    //     bytes32 indexed hashtag_2, 
    //     bytes32 indexed hashtag_3
    // );

    const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

    document.getElementById('div-items-created').innerHTML = 'ITMS&nbsp;&nbsp;made by&nbsp;&nbsp;' + createdByShort;

    let previousTokenURI = '';
    let isRepeating = false;

    let htmlToAdd = '';
    let nftJSON;
    
    for (let i = events.length-1; i >= 0; i--) {
        const tokenId = events[i].args[0];
        const tokenURI = ipfsGatewayReplacer + events[i].args[4];

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


}