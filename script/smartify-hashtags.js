const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});




let isShowingHashtagged = false;

if (params["h"] !== null){
    const _hashtag = decodeURI(params["h"]);
    console.log(_hashtag);
	document.getElementById('input-hashtag').value = _hashtag;
    
    onShowHashtagged()
}

async function onShowHashtagged(){
    if ( isShowingHashtagged == false ){
        
        const hashtag = document.getElementById('input-hashtag').value;
        if ( hashtag == '' ){
            document.getElementById('div-query-status').innerHTML = 'Please specify a #hashtag.';
            document.getElementById('button-share-link').style.display = 'none';
            document.getElementById('div-items-hashtagged').innerHTML = '';
            return 0;
        }        

        isShowingHashtagged = true;
        document.getElementById('input-hashtag').readOnly = true;
        document.getElementById('div-query-status').innerHTML = 'Loading... ';
        await showHashtagged(hashtag);

        isShowingHashtagged = false;
        document.getElementById('input-hashtag').readOnly = false;
        document.getElementById('div-query-status').innerHTML = '';
    }
}

async function showHashtagged(hashtag) {

    document.getElementById('button-share-link').style.display = 'none';

    const hashtagFilter_1 = smartifyContract.filters.TokenHashtags(null, hashtagToBytes32(hashtag), null, null);
    const hashtagEvents_1 = await smartifyContract.queryFilter(hashtagFilter_1);
    console.log(hashtagEvents_1);

    const hashtagFilter_2 = smartifyContract.filters.TokenHashtags(null, null, hashtagToBytes32(hashtag), null);
    const hashtagEvents_2 = await smartifyContract.queryFilter(hashtagFilter_2);
    console.log(hashtagEvents_2);

    const hashtagFilter_3 = smartifyContract.filters.TokenHashtags(null, null, null, hashtagToBytes32(hashtag));
    const hashtagEvents_3 = await smartifyContract.queryFilter(hashtagFilter_3);
    console.log(hashtagEvents_3);

    const hashtagEvents = hashtagEvents_3.concat(hashtagEvents_2).concat(hashtagEvents_1);
    
    document.getElementById('div-items-hashtagged').innerHTML = '';
    
    for (let i = hashtagEvents.length-1; i >= 0; i--) {
        const tokenId = hashtagEvents[i].args[0];
        const tokenFilter = smartifyContract.filters.CreateToken(tokenId);
        const tokenEvents = await smartifyContract.queryFilter(tokenFilter);
        console.log(tokenEvents);

        const creator = tokenEvents[0].args[2];
        const tokenURI = IPFS_GATEWAY + tokenEvents[0].args[4];
        console.log(tokenURI);

        const creatorShort = creator.substring(0, 6) + '...' + creator.substring(creator.length - 4);

        let previousTokenURI = '';
        let isRepeating = false;
    
        let nftJSON;

        if (tokenURI !== previousTokenURI) {
            isRepeating = false;

            if (i < hashtagEvents.length-1){
                document.getElementById('div-items-hashtagged').innerHTML += '</div>';
            }

            previousTokenURI = tokenURI;
            
            try{ 
                nftJSON = await fetchJSON(tokenURI);
            } catch (e) {
                console.log(e);
                continue;
            }

            document.getElementById('div-items-hashtagged').innerHTML += 
`
<div class="nft-item">
    <img class="preview" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    <div class="nft-token-info">
        <span style="display: inline-block; width: 600px">
            ITMS <a href="items.html?t=${tokenId}">#${tokenId}</a>&nbsp;&nbsp;<span class="highlight">${nftJSON.name}</span>&nbsp;&nbsp;by&nbsp;&nbsp;<a class="creator" href="creators.html?a=${creator}">${creatorShort}</a>
        </span>
        <div style="display: inline-block; width: 480px; text-align: right">
            <span class="more-info" href="#" onclick="displaySwitch('div-info-${i}', 'block')">more info &#x21e9;</span>
        </div>
    </div>
    <div id="div-info-${i}" style="display: none">
        <div class="nft-description">${nftJSON.description}</div>
        <div class="nft-hashtags">${nftJSON.hashtags.map(x => `<a class="hashtag" href="hashtags.html?h=${encodeURIComponent(x)}">${x}</a>`).join('&nbsp;&nbsp;')}</div>
        <span>${nftJSON.editions} edition(s)</span>
`;
            

        } else {
            if (isRepeating == true){
                document.getElementById('div-items-hashtagged').innerHTML += 
`
<span class="nft-token-info"><a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;
`;
            } else {
                document.getElementById('div-items-hashtagged').innerHTML += 
`
<span class="nft-token-info">&nbsp;&nbsp;&nbsp;... also as&nbsp;&nbsp;&nbsp;<a href="items.html?t=${tokenId}">#${tokenId}</a> </span>&nbsp;
`;
                isRepeating = true;
            }

        }

    }

    isRepeating = false;

    if ( document.getElementById('div-items-hashtagged').innerHTML == '' ){
        document.getElementById('div-items-hashtagged').innerHTML = 'No items found.';
    } else {
        document.getElementById('div-items-hashtagged').innerHTML += 
`
    </div>
</div>
`;

        document.getElementById('button-share-link').innerHTML = 'Copy Share Link';
        document.getElementById('button-share-link').style.display = 'inline';
    }

}