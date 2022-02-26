
const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);


const minDisplayEntries = 30;
const queryPeriodHour = 48;
let itemsShown = 0;
let itemsShownPrev = 0;
let emptyQueryCount = 0;
const emptyQueryCountLimit = 7;     // emptyQueryCountLimit * queryPeriodHour = max search depth; 

let offsetHoursTracker = 0;
let isShowing = false;

showLatestItems(offsetHoursTracker);

async function showLatestItems(offsetHours) {
    if ( isShowing == false ){

        isShowing = true;
        // console.log(itemsShown +' items shown. Getting items from ' + offsetHours);

        let blockNum = await provider.getBlockNumber();
        blockNum = blockNum - Math.round( offsetHours * 60 * 60 / BLOCK_INTERVAL );

        const queryPeriodBlock = Math.round( queryPeriodHour * 60 * 60 / BLOCK_INTERVAL );
        const fromBlock = blockNum - queryPeriodBlock + 1;
        const toBlock = blockNum;

        const eventFilter = smartifyContract.filters.CreateToken();
        const events = await smartifyContract.queryFilter(eventFilter, fromBlock, toBlock);
        // console.log(offsetHours + ' hr ' + events.length + ' events from ' + fromBlock + ' to ' + toBlock);

        // console.log(events)

        let previousTokenURI = '';
        for (let i = events.length-1; i >= 0; i--) {
            const tokenId = events[i].args[0];
            const tokenURI = IPFS_GATEWAY + events[i].args[4];
            const createdBy = events[i].args[2];

            if ( ! IsIpfs.url(tokenURI) ){
                console.log('Invalid ipfs url: ' + tokenURI);
                continue;
            }

            if (tokenURI !== previousTokenURI) {
                previousTokenURI = tokenURI;

                let nftJSON;
                try{ 
                    nftJSON = await fetchJSON(tokenURI);
                } catch (e) {
                    console.log(e);
                    continue;
                }

                if ( ! IsIpfs.url(nftJSON.image) ){
                    console.log('Invalid ipfs image url: ' + tokenURI);
                    continue;
                }

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
                // console.log('itemsShown: ' + itemsShown);

            }
        }

        document.getElementById('div-latest-status').innerHTML = '...these are our latest items';

        if ( itemsShown == itemsShownPrev ){
            emptyQueryCount++;
        } else {
            emptyQueryCount = 0;
        }

        offsetHoursTracker = offsetHours + queryPeriodHour;

        if ( itemsShown < minDisplayEntries && emptyQueryCount <= emptyQueryCountLimit ){
            itemsShownPrev = itemsShown;

            isShowing = false;
            await showLatestItems(offsetHoursTracker);
        }

        document.getElementById('button-show-more').style.display = 'inline';

        itemsShown = 0;
        isShowing = false;
        // console.log(offsetHoursTracker);
    }
}
