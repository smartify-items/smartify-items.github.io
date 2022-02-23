
const provider = new ethers.providers.JsonRpcProvider(httpsRPC);
const smartifyContract = new ethers.Contract(smartifyContractAddress, smartifyContractABI, provider);


const minDisplayEntries = 30;
const queryPeriodHour = 12;
const blockInterval = 5;    // smartBCH: 1 block every 5 seconds
let itemsShown = 0;
let itemsShownPrev = 0;

showLatestItems(0);

async function showLatestItems(offsetHours) {

    let blockNum = await provider.getBlockNumber();
    blockNum = blockNum - (offsetHours * 60 * 60 / blockInterval);

    // const queryPeriodHour = document.getElementById('query-period-hours').value;
    const queryPeriodBlock = queryPeriodHour * 60 * 60 / blockInterval;
    const fromBlock = blockNum - queryPeriodBlock;
    const toBlock = blockNum;

    const eventFilter = smartifyContract.filters.CreateToken();
    const events = await smartifyContract.queryFilter(eventFilter, fromBlock, toBlock);

    // console.log(events)

    let previousTokenURI = '';
    let n_dots = 0;
    for (let i = events.length-1; i >= 0; i--) {
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

        const tokenId = events[i].args[0];
        const tokenURI = ipfsGatewayReplacer + events[i].args[4];
        const createdBy = events[i].args[2];
        

        if (tokenURI !== previousTokenURI) {
            previousTokenURI = tokenURI;

            let nftJSON = await fetchJSON(tokenURI);

            const foundIPFSinJSONImage = nftJSON.image.match(/ipfs:\/\/(\w+)/);
            if (foundIPFSinJSONImage != null){
                nftJSON.image = ipfsGateway + foundIPFSinJSONImage[1];
            }

            // console.log(nftJSON.hashtags);

            const createdByShort = createdBy.substring(0, 6) + '...' + createdBy.substring(createdBy.length - 4);

            document.getElementById('div-latest-items').innerHTML +=
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
        <p>${nftJSON.editions} edition(s)</p>
    </div>
</div>
`;
            itemsShown++;

        }
    }

    document.getElementById('div-latest-status').innerHTML = '...these are our latest items';

    if ( itemsShown < minDisplayEntries && itemsShown != itemsShownPrev ){
        itemsShownPrev = itemsShown;
        showLatestItems(offsetHours + queryPeriodHour);
        console.log('Getting more...');
    }

}
