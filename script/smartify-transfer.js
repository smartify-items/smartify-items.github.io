const params = new Proxy(new URLSearchParams(window.location.search), {
	get: (searchParams, prop) => searchParams.get(prop),
});
// console.log(params);

if (params["t"] !== null){
	document.getElementById('nf-token-id').value = params["t"];
    getOwner0xAddress();
}


async function getOwner0xAddress(){
    console.log('New token owner info requested.');
    document.getElementById('div-nft-info').innerHTML = '';
    document.getElementById('div-nft-transfer').style.display = 'none';
    document.getElementById('div-confirm-transfer').style.display = 'none';

    const tokenId = document.getElementById('nf-token-id').value;
    // console.log(tokenId);

    document.getElementById('nft-owner').value = '';

    if ( tokenId != ''){
        await connectWallet();
        const provider = new ethers.providers.JsonRpcProvider(HTTPS_RPC);
        const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);

        const ownerOfNft = await smartifyContract.ownerOf(tokenId);
        document.getElementById('nft-owner').value = ownerOfNft;

        const tokenURI = await smartifyContract.tokenURI(tokenId);
        const nftJSON = await fetchJSON(tokenURI);

        const creator = nftJSON.creator;
        const creatorShort = creator.substring(0, 6) + '...' + creator.substring(creator.length - 4);

        document.getElementById('div-nft-info').innerHTML = 
`
<div class="nft-item">
    <img class="preview" src="${nftJSON.image}" onclick="imgToFullscreen('${nftJSON.image}')">
    <div class="nft-token-info">
        <span style="display: inline-block; width: 600px">
            ITMS <a href="items.html?t=${tokenId}">#${tokenId}</a>&nbsp;&nbsp;<span class="highlight">${nftJSON.name}</span>&nbsp;&nbsp;by&nbsp;&nbsp;<a class="creator" href="creators.html?a=${creator}">${creatorShort}</a>
        </span>
        <div style="display: inline-block; width: 480px; text-align: right">
            <span class="more-info" href="#" onclick="displaySwitch('div-info-transfer', 'block')">more info &#x21e9;</span>
        </div>
    </div>
    <div id="div-info-transfer" style="display: none">
        <div class="nft-description">${nftJSON.description}</div>
        <div class="nft-hashtags">${nftJSON.hashtags.join(' ')}</div>
        <p>${nftJSON.editions} edition(s)</p>
    </div>
</div>
`;

        if (ownerOfNft == ethers.utils.getAddress(_CONNECTED_ACC_.toString())){
            document.getElementById('nft-owner').value += '    (You)';

            document.getElementById('div-nft-transfer').style.display = 'block';
        }
        
    }
    else {
        document.getElementById('nft-owner').placeholder = 'Invalid token ID';
    }


}

async function onTransfer() {
    document.getElementById('div-nft-transfer').style.display = 'none';
    document.getElementById('div-confirm-transfer').style.display = 'block';
}


async function confirmTransfer() {
    if ( !ethers.utils.isAddress(document.getElementById('recipient-address').value) ){
        alert('Please check recipient address.');
        return 0;
    }

    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const tokenId = document.getElementById('nf-token-id').value;

    const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, signer);

    document.getElementById('button-confirm').innerHTML = 'Transferring...'
    const contractFunction = 
        await smartifyContract.transferFrom(
            ethers.utils.getAddress(_CONNECTED_ACC_.toString()), 
            document.getElementById('recipient-address').value, 
            tokenId);
    const tx = await contractFunction.wait();
    const event = tx.events[0];
    console.log(event);

    document.getElementById('button-confirm').innerHTML = 'Transferred.'

    const ownerOfNft = await smartifyContract.ownerOf(tokenId);
    document.getElementById('nft-owner').value = ownerOfNft;
    

    // location.reload();
}
