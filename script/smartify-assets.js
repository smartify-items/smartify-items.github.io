let isRunning = false;

async function showItems() {

    if (isRunning == false) {
        isRunning = true;

        await connectWallet();
        await connectNetwork();
        console.log('_CONNECTED_ACC_ ' + _CONNECTED_ACC_);

        const provider = new ethers.providers.Web3Provider(window.ethereum);
        console.log(`log: contract address set to ${CONTRACT_ADDR}`);

        const smartifyContract = new ethers.Contract(CONTRACT_ADDR, CONTRACT_ABI, provider);
        const balanceOf = Number(await smartifyContract.balanceOf(_CONNECTED_ACC_));
        console.log('balanceOf: ' + balanceOf);

        document.getElementById('collection-and-owner').innerHTML = `<h4>There are ${balanceOf} ITMS owned by ${ethers.utils.getAddress(_CONNECTED_ACC_.toString())}</h4>`;


        const ownedTokenIds = await getOwnedByEvents(smartifyContract, _CONNECTED_ACC_);
        console.log(ownedTokenIds);

        document.getElementById('list-of-nfts').innerHTML = '';

        for (let i = 0; i < ownedTokenIds.length; i++){
            const tokenURI = await smartifyContract.tokenURI(ownedTokenIds[i]);
            
            let nftJSON;
            try{ 
                nftJSON = await fetchJSON(tokenURI);
            } catch (e) {
                console.log(e);
                continue;
            }

            document.getElementById('list-of-nfts').innerHTML +=
`<span class="nftdisplay">
ITMS <a href="items.html?t=${ownedTokenIds[i]}">#${ownedTokenIds[i]}</a>
<span class="imgbox">
    <img class="assets" onclick="imgToFullscreen('${nftJSON.image}')" src="${nftJSON.image}">
</span>
<a href="transfer.html?t=${ownedTokenIds[i]}" title="Transfer">
    <img class="transfer-sign" src="./image/transfer-icon-neg.png">
</a>
</span>`;
        }

        isRunning = false;
    }
    
}
