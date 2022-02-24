const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);



const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});

if (params["t"] !== null){
	document.getElementById('input-token-id').value = params["t"];
    showToken();
}



async function selectRandom() {
    const totalSupply = await smartifyContract.totalSupply();
    // console.log(totalSupply);
    document.getElementById('input-token-id').value = Math.floor(Math.random() * (totalSupply - 1)) + 1;
    await showToken();
}



async function showToken() {

    console.log('Loading token info...');

    const totalSupply = await smartifyContract.totalSupply();

    const tokenId = Number(document.getElementById('input-token-id').value);

    document.getElementById('div-token-info').innerHTML = '';

    if ( tokenId <= Number(totalSupply) ){

        const tokenOwner = await smartifyContract.ownerOf(tokenId);
        const tokenOwnerShort = tokenOwner.substring(0, 6) + '...' + tokenOwner.substring(tokenOwner.length - 4);
        const eventFilter = smartifyContract.filters.CreateToken(tokenId);
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
        const creator = events[0].args[2];
        const creatorShort = creator.substring(0, 6) + '...' + creator.substring(creator.length - 4);

        const editions = events[0].args[3];
        // const royalties = events[0].args[5] / 100;

        const tokenURI = IPFS_GATEWAY + events[0].args[4];

        // let tokenURI = await smartifyContract.tokenURI(tokenId);
        // const foundIPFSinURI = tokenURI.match(/ipfs:\/\/(\w+)/);
        // // console.log(foundIPFSinURI);
        // if (foundIPFSinURI != null){
        //     tokenURI = IPFS_GATEWAY + foundIPFSinURI[1];
        // }

        let nftJSON = await fetchJSON(tokenURI);
        const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
        if (foundIPFSinJSONImage != null){
            nftJSON.image = IPFS_GATEWAY + foundIPFSinJSONImage[1];
        }
        document.getElementById('div-token-info').innerHTML +=
        `
        <img class="preview" onclick="imgToFullscreen('${nftJSON.image}')" src="${nftJSON.image}">
        <p style="text-decoration: underline">ITMS #${tokenId}</p>
        <h3>${nftJSON.name}</h3>
        <div class="nft-description">${nftJSON.description}</div>
        <div class="nft-hashtags">${nftJSON.hashtags.map(x => `<a class="hashtag" href="hashtags.html?h=${encodeURIComponent(x)}">${x}</a>`).join(hashtagSpacing)}</div>
        <br>
        <p>[ Owner ]&nbsp;&nbsp;&nbsp;<a class="creator" href="collectors.html?a=${tokenOwner}">${tokenOwnerShort}</a></p>
        <p>[ Creator ]&nbsp;&nbsp;&nbsp;<a class="creator" href="creators.html?a=${creator}">${creatorShort}</a>
        <p>${editions} edition(s)</p>
        <p><a href="${tokenURI}">metadata</a></p>
        `;
        // `<img class="nft-image" src="${nftJSON.image}">`;
        // console.log(nftJSON.description);

    }



}


